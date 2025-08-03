import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Avatar,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import {
  PhotoCamera,
  Save,
  Person,
  Phone,
  LocationOn,
  Warning,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-tw';
import { commonStyles, getValidationStyle, getSelectValidationStyle, getDatePickerValidationStyle } from '../../styles/commonStyles';
import { THEME_COLORS } from '../../styles/theme';
import { caseService } from '../../services/caseManagement/caseService';
import { authService } from '../../services/accountManagement/authService';
import { caseSpeechService } from '../../services/caseManagement/caseSpeechService';
import { validateIdNumber, validatePhone, validateEmail, validateRequired } from '../../utils/validation';
import SpeechToText from '../shared/SpeechToText';
import { type ParsedPersonInfo } from '../../utils/speechParser';
import { type CaseInfoSchema } from '../../types/caseAI';

// 設置 dayjs 為中文
dayjs.locale('zh-tw');

interface AddCaseFormData {
  name: string;
  gender: 'Male' | 'Female';
  birthDate: Dayjs | null;
  idNumber: string;
  phone: string;
  city: string;
  district: string;
  address: string;  // 街道地址，如：文心路一段216號
  email: string;
  difficulty: string;
  profileImage?: string;
  speechToTextAudioUrl?: string; // 語音檔案 URL
}

const AddCaseTab: React.FC = () => {
  // 表單狀態
  const [formData, setFormData] = useState<AddCaseFormData>({
    name: '',
    gender: 'Male',
    birthDate: null,
    idNumber: '',
    phone: '',
    city: '',
    district: '',
    address: '',
    email: '',
    difficulty: '',
    profileImage: undefined,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>({});
  const [fieldErrorMessages, setFieldErrorMessages] = useState<{ [key: string]: string }>({});
  const [getAudioForUpload, setGetAudioForUpload] = useState<(() => Blob | null) | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // 清理本地預覽 URL
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // 即時欄位驗證函數
  const validateField = (fieldName: string, value: string) => {
    let isValid = true;
    let errorMessage = '';

    switch (fieldName) {
      case 'name':
        if (!value.trim()) {
          isValid = false;
          errorMessage = '姓名為必填欄位';
        } else if (value.trim().length < 2) {
          isValid = false;
          errorMessage = '姓名至少需要2個字元';
        } else if (value.trim().length > 50) {
          isValid = false;
          errorMessage = '姓名不能超過50個字元';
        }
        break;

      case 'identityNumber':
        if (!value.trim()) {
          isValid = false;
          errorMessage = '身分證字號為必填欄位';
        } else if (!/^[A-Z][0-9]{9}$/.test(value.trim())) {
          isValid = false;
          errorMessage = '身分證字號格式錯誤（需1個英文字母+9個數字）';
        } else {
          // 台灣身分證字號檢核
          const letterValues: { [key: string]: number } = {
            'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14, 'F': 15, 'G': 16, 'H': 17, 'I': 34, 'J': 18,
            'K': 19, 'L': 20, 'M': 21, 'N': 22, 'O': 35, 'P': 23, 'Q': 24, 'R': 25, 'S': 26, 'T': 27,
            'U': 28, 'V': 29, 'W': 32, 'X': 30, 'Y': 31, 'Z': 33
          };
          
          const firstLetter = value.charAt(0);
          const letterValue = letterValues[firstLetter];
          let sum = Math.floor(letterValue / 10) + (letterValue % 10) * 9;
          
          for (let i = 1; i < 9; i++) {
            sum += parseInt(value.charAt(i)) * (9 - i);
          }
          sum += parseInt(value.charAt(9));
          
          if (sum % 10 !== 0) {
            isValid = false;
            errorMessage = '身分證字號檢核碼錯誤';
          }
        }
        break;

      case 'phone':
        if (!value.trim()) {
          isValid = false;
          errorMessage = '電話為必填欄位';
        } else if (!/^[0-9\-\s\(\)]+$/.test(value.trim())) {
          isValid = false;
          errorMessage = '電話號碼格式錯誤（只能包含數字、空格、括號、破折號）';
        } else if (value.replace(/[\-\s\(\)]/g, '').length < 8) {
          isValid = false;
          errorMessage = '電話號碼至少需要8位數字';
        }
        break;

      case 'email':
        // Email 是選填的，只有當有輸入時才驗證格式
        if (value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          isValid = false;
          errorMessage = 'Email格式錯誤';
        }
        break;

      case 'birthday':
        if (value) {
          const birthDate = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          
          if (birthDate > today) {
            isValid = false;
            errorMessage = '生日不能晚於今天';
          } else if (age > 150) {
            isValid = false;
            errorMessage = '年齡不能超過150歲';
          }
        }
        break;

      case 'city':
        if (!value.trim()) {
          isValid = false;
          errorMessage = '請選擇城市';
        }
        break;

      case 'district':
        if (!value.trim()) {
          isValid = false;
          errorMessage = '請選擇地區';
        }
        break;

      case 'address':
        if (!value.trim()) {
          isValid = false;
          errorMessage = '詳細地址為必填欄位';
        } else if (value.trim().length < 5) {
          isValid = false;
          errorMessage = '詳細地址至少需要5個字元';
        }
        break;

      case 'difficulty':
        if (!value.trim()) {
          isValid = false;
          errorMessage = '請選擇困難類型';
        }
        break;

      case 'gender':
        if (!value.trim()) {
          isValid = false;
          errorMessage = '請選擇性別';
        }
        break;

      default:
        break;
    }

    // 更新錯誤狀態
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: !isValid
    }));

    setFieldErrorMessages(prev => ({
      ...prev,
      [fieldName]: errorMessage
    }));

    return isValid;
  };

  // 處理欄位失焦事件
  const handleFieldBlur = (fieldName: string, value: string) => {
    validateField(fieldName, value);
  };

  // 清除特定欄位的錯誤
  const clearFieldError = (fieldName: string) => {
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: false
    }));
    setFieldErrorMessages(prev => ({
      ...prev,
      [fieldName]: ''
    }));
  };

  // 選項資料
  const genderOptions = [
    { value: 'Male', label: '男' },
    { value: 'Female', label: '女' },
  ];

  const cityOptions = [
    '台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市',
    '基隆市', '新竹市', '嘉義市', '宜蘭縣', '新竹縣', '苗栗縣',
    '彰化縣', '南投縣', '雲林縣', '嘉義縣', '屏東縣', '台東縣',
    '花蓮縣', '澎湖縣', '金門縣', '連江縣'
  ];

  const districtOptions: { [key: string]: string[] } = {
    '台北市': ['中正區', '大同區', '中山區', '松山區', '大安區', '萬華區', '信義區', '士林區', '北投區', '內湖區', '南港區', '文山區'],
    '新北市': ['板橋區', '三重區', '中和區', '永和區', '新莊區', '新店區', '樹林區', '鶯歌區', '三峽區', '淡水區', '汐止區', '瑞芳區', '土城區', '蘆洲區', '五股區', '泰山區', '林口區', '深坑區', '石碇區', '坪林區', '三芝區', '石門區', '八里區', '平溪區', '雙溪區', '貢寮區', '金山區', '萬里區', '烏來區'],
    '桃園市': ['桃園區', '中壢區', '平鎮區', '八德區', '楊梅區', '蘆竹區', '大溪區', '大園區', '龜山區', '龍潭區', '新屋區', '觀音區', '復興區'],
    '台中市': ['中區', '東區', '南區', '西區', '北區', '西屯區', '南屯區', '北屯區', '豐原區', '東勢區', '大甲區', '清水區', '沙鹿區', '梧棲區', '后里區', '神岡區', '潭子區', '大雅區', '新社區', '石岡區', '外埔區', '大安區', '烏日區', '大肚區', '龍井區', '霧峰區', '太平區', '大里區', '和平區'],
    '台南市': ['中西區', '東區', '南區', '北區', '安平區', '安南區', '永康區', '歸仁區', '新化區', '左鎮區', '玉井區', '楠西區', '南化區', '仁德區', '關廟區', '龍崎區', '官田區', '麻豆區', '佳里區', '西港區', '七股區', '將軍區', '學甲區', '北門區', '新營區', '後壁區', '白河區', '東山區', '六甲區', '下營區', '柳營區', '鹽水區', '善化區', '大內區', '山上區', '新市區', '安定區'],
    '高雄市': ['新興區', '前金區', '苓雅區', '鹽埕區', '鼓山區', '旗津區', '前鎮區', '三民區', '楠梓區', '小港區', '左營區', '仁武區', '大社區', '岡山區', '路竹區', '阿蓮區', '田寮區', '燕巢區', '橋頭區', '梓官區', '彌陀區', '永安區', '湖內區', '鳳山區', '大寮區', '林園區', '鳥松區', '大樹區', '旗山區', '美濃區', '六龜區', '內門區', '杉林區', '甲仙區', '桃源區', '那瑪夏區', '茂林區', '茄萣區'],
    '基隆市': ['仁愛區', '信義區', '中正區', '中山區', '安樂區', '暖暖區', '七堵區'],
    '新竹市': ['東區', '北區', '香山區'],
    '嘉義市': ['東區', '西區'],
    '宜蘭縣': ['宜蘭市', '羅東鎮', '蘇澳鎮', '頭城鎮', '礁溪鄉', '壯圍鄉', '員山鄉', '冬山鄉', '五結鄉', '三星鄉', '大同鄉', '南澳鄉'],
    '新竹縣': ['竹北市', '竹東鎮', '新埔鎮', '關西鎮', '湖口鄉', '新豐鄉', '芎林鄉', '橫山鄉', '北埔鄉', '寶山鄉', '峨眉鄉', '尖石鄉', '五峰鄉'],
    '苗栗縣': ['苗栗市', '苑裡鎮', '通霄鎮', '竹南鎮', '頭份市', '後龍鎮', '卓蘭鎮', '大湖鄉', '公館鄉', '銅鑼鄉', '南庄鄉', '頭屋鄉', '三義鄉', '西湖鄉', '造橋鄉', '三灣鄉', '獅潭鄉', '泰安鄉'],
    '彰化縣': ['彰化市', '員林市', '和美鎮', '鹿港鎮', '溪湖鎮', '二林鎮', '田中鎮', '北斗鎮', '花壇鄉', '芬園鄉', '大村鄉', '永靖鄉', '伸港鄉', '線西鄉', '福興鄉', '秀水鄉', '埔鹽鄉', '埔心鄉', '大城鄉', '芳苑鄉', '竹塘鄉', '溪州鄉'],
    '南投縣': ['南投市', '埔里鎮', '草屯鎮', '竹山鎮', '集集鎮', '名間鄉', '鹿谷鄉', '中寮鄉', '魚池鄉', '國姓鄉', '水里鄉', '信義鄉', '仁愛鄉'],
    '雲林縣': ['斗六市', '斗南鎮', '虎尾鎮', '西螺鎮', '土庫鎮', '北港鎮', '古坑鄉', '大埤鄉', '莿桐鄉', '林內鄉', '二崙鄉', '崙背鄉', '麥寮鄉', '東勢鄉', '褒忠鄉', '台西鄉', '元長鄉', '四湖鄉', '口湖鄉', '水林鄉'],
    '嘉義縣': ['太保市', '朴子市', '布袋鎮', '大林鎮', '民雄鄉', '溪口鄉', '新港鄉', '六腳鄉', '東石鄉', '義竹鄉', '鹿草鄉', '水上鄉', '中埔鄉', '竹崎鄉', '梅山鄉', '番路鄉', '大埔鄉', '阿里山鄉'],
    '屏東縣': ['屏東市', '潮州鎮', '東港鎮', '恆春鎮', '萬丹鄉', '長治鄉', '麟洛鄉', '九如鄉', '里港鄉', '鹽埔鄉', '高樹鄉', '萬巒鄉', '內埔鄉', '竹田鄉', '新埤鄉', '枋寮鄉', '新園鄉', '崁頂鄉', '林邊鄉', '南州鄉', '佳冬鄉', '琉球鄉', '車城鄉', '滿州鄉', '枋山鄉', '三地門鄉', '霧台鄉', '瑪家鄉', '泰武鄉', '來義鄉', '春日鄉', '獅子鄉', '牡丹鄉'],
    '台東縣': ['台東市', '成功鎮', '關山鎮', '卑南鄉', '鹿野鄉', '池上鄉', '東河鄉', '長濱鄉', '太麻里鄉', '大武鄉', '綠島鄉', '海端鄉', '延平鄉', '金峰鄉', '達仁鄉', '蘭嶼鄉'],
    '花蓮縣': ['花蓮市', '鳳林鎮', '玉里鎮', '新城鄉', '吉安鄉', '壽豐鄉', '光復鄉', '豐濱鄉', '瑞穗鄉', '富里鄉', '秀林鄉', '萬榮鄉', '卓溪鄉'],
    '澎湖縣': ['馬公市', '西嶼鄉', '望安鄉', '七美鄉', '白沙鄉', '湖西鄉'],
    '金門縣': ['金城鎮', '金沙鎮', '金湖鎮', '金寧鄉', '烈嶼鄉', '烏坵鄉'],
    '連江縣': ['南竿鄉', '北竿鄉', '莒光鄉', '東引鄉']
  };

  const difficultyOptions = [
    '經濟困難',
    '家庭問題', 
    '學習困難',
    '健康問題',
    '行為問題',
    '人際關係',
    '情緒困擾',
    '其他困難'
  ];

  /**
   * 處理輸入變更
   */
  const handleInputChange = (field: keyof AddCaseFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // 清除該欄位的錯誤狀態
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: false
      }));
    }

    // 當城市改變時，重置地區選擇
    if (field === 'city') {
      setFormData(prev => ({
        ...prev,
        district: ''
      }));
    }
  };

  /**
   * 處理日期變更
   */
  const handleDateChange = (value: Dayjs | null) => {
    console.log('日期選擇變更:', value?.format('YYYY-MM-DD'));
    
    setFormData(prev => ({
      ...prev,
      birthDate: value
    }));

    // 清除生日欄位的錯誤狀態
    if (fieldErrors.birthDate) {
      setFieldErrors(prev => ({
        ...prev,
        birthDate: false
      }));
    }
  };

  /**
   * 處理圖片上傳到 Azure Blob Storage
   */
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 檢查檔案格式
      if (!file.type.startsWith('image/')) {
        setSubmitMessage({
          type: 'error',
          text: '請選擇有效的圖片檔案 (JPG, PNG, GIF)'
        });
        return;
      }

      // 檢查檔案大小 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSubmitMessage({
          type: 'error',
          text: '圖片檔案大小不能超過 5MB'
        });
        return;
      }

      try {
        // 先創建本地預覽 URL
        const localPreviewUrl = URL.createObjectURL(file);
        console.log('創建本地預覽 URL:', localPreviewUrl);
        setImagePreview(localPreviewUrl);
        
        // 顯示上傳中狀態
        setFormData(prev => ({
          ...prev,
          profileImage: 'uploading...'
        }));


        // 上傳到 Azure Blob Storage
        const formData = new FormData();
        formData.append('file', file);

        const response = await caseService.uploadProfileImage(formData);
        
        // 處理不同的回應格式
        console.log('圖片上傳回應:', response);
        let imageUrl = '';
        
        if (response) {
          if (typeof response === 'string') {
            imageUrl = response;
          } else if (typeof response === 'object') {
            if ('imageUrl' in response && response.imageUrl) {
              imageUrl = response.imageUrl;
            } else if ('data' in response && response.data && typeof response.data === 'object' && 'imageUrl' in response.data && typeof response.data.imageUrl === 'string') {
              imageUrl = response.data.imageUrl;
            }
          }
        }
        
        if (!imageUrl) {
          throw new Error('無法從上傳回應中獲取圖片 URL');
        }
        
        console.log('解析到的圖片 URL:', imageUrl);
        
        // 設定 Azure URL
        setFormData(prev => ({
          ...prev,
          profileImage: imageUrl
        }));
        
        // 直接切換到伺服器 URL
        console.log('切換到伺服器 URL:', imageUrl);
        setImagePreview(imageUrl);
        // 清理本地預覽 URL
        if (localPreviewUrl) {
          URL.revokeObjectURL(localPreviewUrl);
        }
        
        setSubmitMessage({
          type: 'success',
          text: '圖片上傳成功！'
        });
        
        console.log('imagePreview 已設定為:', imageUrl);
        console.log('formData.profileImage 已設定為:', imageUrl);
      } catch (error: any) {
        console.error('圖片上傳失敗:', error);
        
        // 顯示詳細錯誤訊息
        let errorMessage = '圖片上傳失敗：';
        if (error.message) {
          errorMessage += error.message;
        } else {
          errorMessage += '未知錯誤，請檢查網路連線和後端服務';
        }
        
        setSubmitMessage({
          type: 'error',
          text: errorMessage
        });
        console.log('完整錯誤物件:', error);
        
        // 清除圖片，但保持本地預覽直到用戶手動移除
        setFormData(prev => ({
          ...prev,
          profileImage: undefined
        }));
        // 不清除 imagePreview，讓用戶可以看到本地預覽
      }
    }
  };

  /**
   * 移除圖片
   */
  const handleRemoveImage = () => {
    // 如果當前是本地預覽 URL，需要釋放它
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      profileImage: undefined
    }));
  };

  /**
   * 處理智能解析結果，自動填入表單（支援 AI 和正則表達式兩種格式）
   */
  const handleParsedData = (parsedData: ParsedPersonInfo | CaseInfoSchema) => {
    console.log('收到智能解析結果:', parsedData);
    
    // 檢查是否為 AI 解析格式（CaseInfoSchema）還是正則表達式格式（ParsedPersonInfo）
    // AI 格式通常有更完整的數據結構和更好的標準化
    const hasAIStructure = parsedData.city?.includes('市') || parsedData.city?.includes('縣');
    const isAIFormat = hasAIStructure || Object.keys(parsedData).length > 5;
    
    // 統一處理兩種格式
    const normalizedData = {
      name: parsedData.name,
      gender: parsedData.gender,
      birthday: isAIFormat ? (parsedData as CaseInfoSchema).birthday : (parsedData as ParsedPersonInfo).birthday,
      idNumber: isAIFormat ? (parsedData as CaseInfoSchema).idNumber : (parsedData as ParsedPersonInfo).idNumber,
      phone: parsedData.phone,
      email: parsedData.email,
      city: parsedData.city,
      district: parsedData.district,
      address: parsedData.address,
      difficulty: isAIFormat ? (parsedData as CaseInfoSchema).difficulty : undefined
    };
    
    console.log('標準化後的解析結果:', normalizedData);
    
    // 只填入尚未填寫的欄位
    setFormData(prev => ({
      ...prev,
      ...(normalizedData.name && !prev.name && { name: normalizedData.name }),
      ...(normalizedData.gender && { gender: normalizedData.gender }),
      ...(normalizedData.birthday && !prev.birthDate && { 
        birthDate: dayjs(normalizedData.birthday) 
      }),
      ...(normalizedData.idNumber && !prev.idNumber && { idNumber: normalizedData.idNumber }),
      ...(normalizedData.phone && !prev.phone && { phone: normalizedData.phone }),
      ...(normalizedData.email && !prev.email && { email: normalizedData.email }),
      ...(normalizedData.city && !prev.city && { 
        city: normalizedData.city // AI 已經標準化，直接使用
      }),
      ...(normalizedData.district && !prev.district && { district: normalizedData.district }),
      ...(normalizedData.address && !prev.address && { address: normalizedData.address }),
      ...(normalizedData.difficulty && !prev.difficulty && { difficulty: normalizedData.difficulty }),
    }));
    
    // 計算填入的欄位數量
    const filledFields = Object.keys(normalizedData).filter(key => 
      normalizedData[key as keyof typeof normalizedData] !== undefined
    ).length;
    
    // 顯示成功訊息
    setSubmitMessage({
      type: 'success',
      text: `已成功使用 ${isAIFormat ? 'AI 智能解析' : '正則表達式解析'} 並自動填入 ${filledFields} 個欄位！`
    });
    
    // 3秒後清除訊息
    setTimeout(() => setSubmitMessage(null), 3000);
  };

  /**
   * 表單驗證
   */
  const validateForm = (): { isValid: boolean; errorMessages: string[] } => {
    const errors: { [key: string]: boolean } = {};
    const errorMessages: string[] = [];

    // 必填欄位驗證
    const requiredFields = [
      { field: 'name', label: '姓名' },
      { field: 'idNumber', label: '身分證字號' },
      { field: 'phone', label: '聯絡電話' },
      { field: 'city', label: '城市' },
      { field: 'district', label: '區域' },
      { field: 'address', label: '詳細地址' },
      { field: 'email', label: '電子郵件' },
      { field: 'difficulty', label: '困難描述' }
    ];
    
    requiredFields.forEach(({ field, label }) => {
      if (!validateRequired(formData[field as keyof AddCaseFormData] as string)) {
        errors[field] = true;
        errorMessages.push(`請填寫${label}`);
      }
    });

    // 驗證生日
    if (!formData.birthDate) {
      errors.birthDate = true;
      errorMessages.push('請選擇生日');
    }

    // 驗證身分證格式
    if (formData.idNumber && !validateIdNumber(formData.idNumber)) {
      errors.idNumber = true;
      errorMessages.push('身分證字號格式錯誤，應為1個英文字母後接9個數字');
    }

    // 驗證手機格式
    if (formData.phone && !validatePhone(formData.phone)) {
      errors.phone = true;
      errorMessages.push('聯絡電話格式錯誤，請輸入有效的台灣手機號碼');
    }

    // 驗證Email格式
    if (formData.email && !validateEmail(formData.email)) {
      errors.email = true;
      errorMessages.push('電子郵件格式錯誤，請輸入有效的Email地址');
    }

    setFieldErrors(errors);
    return { isValid: errorMessages.length === 0, errorMessages };
  };

  /**
   * 提交表單
   */
  const handleSubmit = async () => {
    const validation = validateForm();
    if (!validation.isValid) {
      setSubmitMessage({
        type: 'error',
        text: `請修正以下問題：\n• ${validation.errorMessages.join('\n• ')}`
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      // 獲取當前用戶資訊
      const currentWorker = authService.getCurrentWorker();
      if (!currentWorker) {
        setSubmitMessage({
          type: 'error',
          text: '未找到登入工作人員資訊，請重新登入'
        });
        return;
      }

      // 準備提交的資料（注意：欄位名稱需符合後端 CreateCaseRequest 格式）
      const submitData: any = {
        Name: formData.name,
        Gender: formData.gender,
        Birthday: formData.birthDate ? formData.birthDate.toDate() : undefined,
        IdentityNumber: formData.idNumber,
        Phone: formData.phone,
        WorkerId: currentWorker.workerId,  // 使用當前登入用戶的WorkerId
        City: formData.city,
        District: formData.district,
        DetailAddress: formData.address,  // 後端只需要 DetailAddress，不需要完整的 address
        Email: formData.email,
        Description: formData.difficulty || "其他困難",
      };

      // 只有當 ProfileImage 是有效的 URL 時才包含在提交數據中
      if (formData.profileImage && formData.profileImage.trim() !== '') {
        try {
          new URL(formData.profileImage);
          submitData.ProfileImage = formData.profileImage;
        } catch (error) {
          console.warn('⚠️ ProfileImage 不是有效的 URL，將被忽略:', formData.profileImage);
        }
      }

      // 先建立個案，取得 caseId
      console.log('開始建立個案...');
      const newCase = await caseService.createCase(submitData);
      console.log('個案建立成功，CaseId:', newCase.caseId);
      
      // 如果有語音檔案，在個案建立後上傳並關聯
      console.log('檢查音檔上傳條件:', {
        getAudioForUpload: !!getAudioForUpload,
        newCaseId: newCase.caseId,
        hasAudioFunction: typeof getAudioForUpload === 'function'
      });
      
      if (getAudioForUpload && newCase.caseId) {
        try {
          console.log('開始取得音檔...');
          const audioBlob = getAudioForUpload();
          console.log('音檔取得結果:', {
            hasAudioBlob: !!audioBlob,
            audioBlobType: audioBlob?.constructor?.name,
            audioBlobSize: audioBlob?.size,
            audioBlobType2: audioBlob?.type
          });
          
          if (audioBlob) {
            console.log('開始上傳語音檔案到 Azure 並關聯到個案...');
            console.log('音檔 Blob 資訊:', {
              size: audioBlob.size,
              type: audioBlob.type,
              lastModified: new Date().toISOString()
            });
            
            // 將 Blob 轉換為 File 對象
            const audioFile = new File([audioBlob], 'speech-audio.wav', { type: 'audio/wav' });
            console.log('創建 File 對象:', {
              name: audioFile.name,
              size: audioFile.size,
              type: audioFile.type,
              lastModified: audioFile.lastModified
            });
            
            // 上傳音檔並關聯到個案
            console.log('調用 speechService.uploadAudio 並傳遞 caseId:', newCase.caseId);
            const uploadResult = await caseSpeechService.uploadAudio(audioFile, newCase.caseId);
            console.log('音檔上傳並關聯成功，URL:', uploadResult.audioUrl);
            console.log('上傳結果:', uploadResult);
          } else {
            console.log('getAudioForUpload() 返回 null，沒有音檔需要上傳');
          }
        } catch (audioError) {
          console.error('音檔上傳失敗:', audioError);
          console.error('錯誤詳情:', {
            message: audioError instanceof Error ? audioError.message : '未知錯誤',
            stack: audioError instanceof Error ? audioError.stack : undefined
          });
          // 音檔上傳失敗不影響個案建立，只記錄錯誤
        }
      } else {
        console.log('沒有音檔需要上傳或個案建立失敗');
      }

      setSubmitMessage({
        type: 'success',
        text: '個案資料已成功新增！' + (getAudioForUpload ? ' 語音檔案也已上傳。' : '')
      });

      // 清空表單
      setFormData({
        name: '',
        gender: 'Male',
        birthDate: null,
        idNumber: '',
        phone: '',
        city: '',
        district: '',
        address: '',
        email: '',
        difficulty: '',
        profileImage: undefined,
      });
      setImagePreview(null);
      setFieldErrors({});
      setGetAudioForUpload(null); // 清除音檔引用

    } catch (error) {
      console.error('提交個案資料失敗:', error);
      
      // 檢查是否為身分證重複錯誤
      const errorData = (error as any)?.response?.data;
      if (errorData?.errorType === 'DUPLICATE_IDENTITY') {
        setSubmitMessage({
          type: 'error',
          text: `⚠️ 此身分證字號已存在！\n\n個案資訊：\n• 個案編號：${errorData.existingCaseId}\n• 姓名：${errorData.existingCaseName}\n• 建立時間：${new Date(errorData.existingCaseCreatedAt).toLocaleString('zh-TW')}\n\n建議：請使用「查詢個案」功能搜尋該個案`
        });
      } else if (errorData?.message) {
        setSubmitMessage({
          type: 'error',
          text: errorData.message
        });
      } else {
        setSubmitMessage({
          type: 'error',
          text: '提交失敗，請稍後再試'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-tw">
      <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: 3 }}>
        

        {/* 提交訊息 */}
        {submitMessage && (
          <Box sx={{ mb: 3 }}>
            <Alert 
              severity={submitMessage.type} 
              sx={{ 
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
              onClose={() => setSubmitMessage(null)}
            >
              {submitMessage.text}
            </Alert>
          </Box>
        )}

        {/* 主要內容區域 */}
        <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* 左側：表單卡片 */}
          <Box sx={{ flex: 1 }}>
            {/* 基本資料卡片 */}
            <Card sx={{ 
              bgcolor: THEME_COLORS.BACKGROUND_CARD,
              borderRadius: 2,
              border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              mb: 3,
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Person sx={{ color: THEME_COLORS.PRIMARY, mr: 1 }} />
                  <Typography variant="h6" sx={{ 
                    color: THEME_COLORS.TEXT_PRIMARY,
                    fontWeight: 600,
                  }}>
                    基本資料
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                    <TextField
                      fullWidth
                      label="姓名"
                      value={formData.name}
                      onChange={(e) => {
                        handleInputChange('name', e.target.value);
                        if (fieldErrors.name && e.target.value.trim()) {
                          clearFieldError('name');
                        }
                      }}
                      onBlur={(e) => handleFieldBlur('name', e.target.value)}
                      sx={getValidationStyle(fieldErrors.name)}
                      required
                      error={fieldErrors.name}
                      helperText={fieldErrorMessages.name}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
                    <FormControl fullWidth sx={getSelectValidationStyle(fieldErrors.gender)} error={fieldErrors.gender}>
                      <InputLabel>性別</InputLabel>
                      <Select
                        value={formData.gender}
                        onChange={(e) => {
                          handleInputChange('gender', e.target.value);
                          if (fieldErrors.gender && e.target.value) {
                            clearFieldError('gender');
                          }
                        }}
                        onBlur={() => handleFieldBlur('gender', formData.gender)}
                        label="性別"
                        required
                      >
                        {genderOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {fieldErrors.gender && (
                        <Typography variant="caption" sx={{ color: 'error.main', mt: 0.5, ml: 1.5 }}>
                          請選擇性別
                        </Typography>
                      )}
                    </FormControl>
                  </Box>
                  <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <DatePicker
                      label="生日"
                      value={formData.birthDate}
                      onChange={(date) => {
                        handleDateChange(date);
                        if (fieldErrors.birthday && date) {
                          clearFieldError('birthday');
                        }
                      }}
                      sx={getDatePickerValidationStyle(fieldErrors.birthDate)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          placeholder: "請選擇生日",
                          error: fieldErrors.birthday,
                          helperText: fieldErrorMessages.birthday,
                          onBlur: () => {
                            if (formData.birthDate) {
                              handleFieldBlur('birthday', formData.birthDate.format('YYYY-MM-DD'));
                            }
                          }
                        },
                      }}
                      // 設置日期範圍，允許選擇 1900 年到今天
                      minDate={dayjs('1900-01-01')}
                      maxDate={dayjs()}
                      // 確保可以選擇任何有效日期
                      disableFuture={true}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 250px', minWidth: '200px' }}>
                    <TextField
                      fullWidth
                      label="身分證字號"
                      value={formData.idNumber}
                      onChange={(e) => {
                        handleInputChange('idNumber', e.target.value);
                        if (fieldErrors.identityNumber && e.target.value.trim()) {
                          clearFieldError('identityNumber');
                        }
                      }}
                      onBlur={(e) => handleFieldBlur('identityNumber', e.target.value)}
                      sx={getValidationStyle(fieldErrors.identityNumber)}
                      required
                      placeholder="例：A123456789"
                      error={fieldErrors.identityNumber}
                      helperText={fieldErrorMessages.identityNumber}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* 聯絡資料卡片 */}
            <Card sx={{ 
              bgcolor: THEME_COLORS.BACKGROUND_CARD,
              borderRadius: 2,
              border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              mb: 3,
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Phone sx={{ color: THEME_COLORS.PRIMARY, mr: 1 }} />
                  <Typography variant="h6" sx={{ 
                    color: THEME_COLORS.TEXT_PRIMARY,
                    fontWeight: 600,
                  }}>
                    聯絡資料
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ flex: '1 1 250px', minWidth: '200px' }}>
                    <TextField
                      fullWidth
                      label="手機號碼"
                      value={formData.phone}
                      onChange={(e) => {
                        handleInputChange('phone', e.target.value);
                        if (fieldErrors.phone && e.target.value.trim()) {
                          clearFieldError('phone');
                        }
                      }}
                      onBlur={(e) => handleFieldBlur('phone', e.target.value)}
                      sx={getValidationStyle(fieldErrors.phone)}
                      required
                      placeholder="例：0912345678"
                      error={fieldErrors.phone}
                      helperText={fieldErrorMessages.phone}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        handleInputChange('email', e.target.value);
                        if (fieldErrors.email && e.target.value.trim()) {
                          clearFieldError('email');
                        }
                      }}
                      onBlur={(e) => handleFieldBlur('email', e.target.value)}
                      sx={getValidationStyle(fieldErrors.email)}
                      placeholder="例：example@email.com"
                      error={fieldErrors.email}
                      helperText={fieldErrorMessages.email}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* 地址資料卡片 */}
            <Card sx={{ 
              bgcolor: THEME_COLORS.BACKGROUND_CARD,
              borderRadius: 2,
              border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              mb: 3,
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <LocationOn sx={{ color: THEME_COLORS.PRIMARY, mr: 1 }} />
                  <Typography variant="h6" sx={{ 
                    color: THEME_COLORS.TEXT_PRIMARY,
                    fontWeight: 600,
                  }}>
                    地址資料
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
                  <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
                    <FormControl fullWidth sx={getSelectValidationStyle(fieldErrors.city)} error={fieldErrors.city}>
                      <InputLabel>城市</InputLabel>
                      <Select
                        value={formData.city}
                        onChange={(e) => {
                          handleInputChange('city', e.target.value);
                          if (fieldErrors.city && e.target.value) {
                            clearFieldError('city');
                          }
                        }}
                        onBlur={() => handleFieldBlur('city', formData.city)}
                        label="城市"
                        required
                      >
                        {cityOptions.map((city) => (
                          <MenuItem key={city} value={city}>
                            {city}
                          </MenuItem>
                        ))}
                      </Select>
                      {fieldErrors.city && (
                        <Typography variant="caption" sx={{ color: 'error.main', mt: 0.5, ml: 1.5 }}>
                          {fieldErrorMessages.city}
                        </Typography>
                      )}
                    </FormControl>
                  </Box>
                  <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
                    <FormControl fullWidth sx={getSelectValidationStyle(fieldErrors.district)} error={fieldErrors.district}>
                      <InputLabel>地區</InputLabel>
                      <Select
                        value={formData.district}
                        onChange={(e) => {
                          handleInputChange('district', e.target.value);
                          if (fieldErrors.district && e.target.value) {
                            clearFieldError('district');
                          }
                        }}
                        onBlur={() => handleFieldBlur('district', formData.district)}
                        label="地區"
                        required
                        disabled={!formData.city}
                      >
                        {formData.city && districtOptions[formData.city]?.map((district) => (
                          <MenuItem key={district} value={district}>
                            {district}
                          </MenuItem>
                        ))}
                      </Select>
                      {fieldErrors.district && (
                        <Typography variant="caption" sx={{ color: 'error.main', mt: 0.5, ml: 1.5 }}>
                          {fieldErrorMessages.district}
                        </Typography>
                      )}
                    </FormControl>
                  </Box>
                </Box>
                <TextField
                  fullWidth
                  label="詳細地址"
                  value={formData.address}
                  onChange={(e) => {
                    handleInputChange('address', e.target.value);
                    if (fieldErrors.address && e.target.value.trim()) {
                      clearFieldError('address');
                    }
                  }}
                  onBlur={(e) => handleFieldBlur('address', e.target.value)}
                  sx={getValidationStyle(fieldErrors.address)}
                  required
                  multiline
                  rows={2}
                  error={fieldErrors.address}
                  helperText={fieldErrorMessages.address}
                />
              </CardContent>
            </Card>

            {/* 困難類型卡片 */}
            <Card sx={{ 
              bgcolor: THEME_COLORS.BACKGROUND_CARD,
              borderRadius: 2,
              border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              mb: 3,
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Warning sx={{ color: THEME_COLORS.PRIMARY, mr: 1 }} />
                  <Typography variant="h6" sx={{ 
                    color: THEME_COLORS.TEXT_PRIMARY,
                    fontWeight: 600,
                  }}>
                    困難類型
                  </Typography>
                </Box>
                <FormControl fullWidth sx={getSelectValidationStyle(fieldErrors.difficulty)} error={fieldErrors.difficulty}>
                  <InputLabel>困難類型</InputLabel>
                  <Select
                    value={formData.difficulty}
                    onChange={(e) => {
                      handleInputChange('difficulty', e.target.value);
                      if (fieldErrors.difficulty && e.target.value) {
                        clearFieldError('difficulty');
                      }
                    }}
                    onBlur={() => handleFieldBlur('difficulty', formData.difficulty)}
                    label="困難類型"
                    required
                  >
                    {difficultyOptions.map((difficulty) => (
                      <MenuItem key={difficulty} value={difficulty}>
                        {difficulty}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.difficulty && (
                    <Typography variant="caption" sx={{ color: 'error.main', mt: 0.5, ml: 1.5 }}>
                      {fieldErrorMessages.difficulty}
                    </Typography>
                  )}
                </FormControl>
              </CardContent>
            </Card>

          </Box>

          {/* 右側：照片上傳 */}
          <Box sx={{ width: { xs: '100%', md: '300px' }, flexShrink: 0 }}>
            <Card sx={{ 
              bgcolor: THEME_COLORS.BACKGROUND_CARD,
              borderRadius: 2,
              border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              position: { md: 'sticky' },
              top: { md: 24 },
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ 
                  color: THEME_COLORS.TEXT_PRIMARY,
                  fontWeight: 600,
                  mb: 3,
                  textAlign: 'center'
                }}>
                  個人照片
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: 3,
                  p: 3,
                  bgcolor: THEME_COLORS.BACKGROUND_SECONDARY,
                  borderRadius: 2,
                  border: `2px dashed ${THEME_COLORS.BORDER_DASHED}`,
                }}>

                  {formData.profileImage === 'uploading...' ? (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      gap: 2,
                      width: 150,
                      height: 150,
                      justifyContent: 'center'
                    }}>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        圖片上傳中...
                      </Typography>
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        border: '3px solid #f3f3f3',
                        borderTop: `3px solid ${THEME_COLORS.PRIMARY}`,
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        '@keyframes spin': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' }
                        }
                      }} />
                    </Box>
                  ) : imagePreview ? (
                    <Box sx={{ 
                      width: 150, 
                      height: 150, 
                      position: 'relative',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: `3px solid ${THEME_COLORS.BORDER_LIGHT}`,
                      bgcolor: THEME_COLORS.BACKGROUND_SECONDARY,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        borderColor: THEME_COLORS.PRIMARY
                      }
                    }}>
                      <img
                        src={imagePreview}
                        alt="個案照片預覽"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                        onClick={() => setShowImageModal(true)}
                        onError={(e) => {
                          console.error('圖片加載失敗:', imagePreview);
                          // 只有在本地預覽載入失敗時才清除
                          if (imagePreview && imagePreview.startsWith('blob:')) {
                            setImagePreview(null);
                            setSubmitMessage({
                              type: 'error',
                              text: '圖片加載失敗，請重新上傳'
                            });
                          }
                          // 伺服器圖片載入失敗時不顯示警告，因為可能只是暫時的網路問題
                        }}
                        onLoad={() => {
                          console.log('圖片加載成功:', imagePreview);
                          // 不重複顯示成功訊息，避免干擾用戶
                        }}
                      />
                      {/* 懸停時顯示的放大鏡圖標 */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          opacity: 0,
                          transition: 'opacity 0.3s ease',
                          color: 'white',
                          bgcolor: 'rgba(0,0,0,0.5)',
                          borderRadius: '50%',
                          width: 40,
                          height: 40,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          '&:hover': {
                            opacity: 1
                          }
                        }}
                      >
                        <PhotoCamera sx={{ fontSize: 20 }} />
                      </Box>
                    </Box>
                  ) : (
                    <Avatar
                      sx={{
                        width: 150,
                        height: 150,
                        fontSize: '4rem',
                        bgcolor: formData.gender === 'Male' ? THEME_COLORS.MALE_AVATAR : THEME_COLORS.FEMALE_AVATAR,
                        border: `3px solid ${THEME_COLORS.BORDER_LIGHT}`,
                      }}
                    >
                      {formData.name ? formData.name.charAt(0) : '?'}
                    </Avatar>
                  )}
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<PhotoCamera />}
                      disabled={formData.profileImage === 'uploading...'}
                      sx={{
                        color: THEME_COLORS.PRIMARY,
                        borderColor: THEME_COLORS.PRIMARY,
                        '&:hover': {
                          borderColor: THEME_COLORS.PRIMARY_HOVER,
                          bgcolor: THEME_COLORS.PRIMARY_TRANSPARENT,
                        },
                      }}
                    >
                      上傳照片
                      <input
                        hidden
                        accept="image/*"
                        type="file"
                        onChange={handleImageUpload}
                      />
                    </Button>
                    
                    {imagePreview && formData.profileImage !== 'uploading...' && (
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={handleRemoveImage}
                        sx={{
                          borderColor: THEME_COLORS.ERROR,
                          color: THEME_COLORS.ERROR,
                          '&:hover': {
                            borderColor: THEME_COLORS.ERROR_DARK,
                            bgcolor: THEME_COLORS.ERROR_LIGHT,
                          },
                        }}
                      >
                        移除照片
                      </Button>
                    )}
                  </Box>
                  
                  <Typography variant="caption" sx={{ 
                    color: THEME_COLORS.TEXT_MUTED,
                    textAlign: 'center'
                  }}>
                    支援 JPG、PNG 格式<br />
                    檔案大小不超過 5MB<br />
                    {imagePreview && formData.profileImage !== 'uploading...' && '點擊圖片可放大預覽'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* 語音轉字幕工具 */}
            <Box sx={{ mt: 3 }}>
              <SpeechToText
                enableSmartParsing={true}
                useAIParsing={true}
                onTextGenerated={(text) => {
                  console.log('語音轉換完成:', text);
                }}
                onAudioReady={(getAudio) => {
                  // 保存音檔獲取方法，供儲存個案時使用
                  console.log('onAudioReady 被調用，設置音檔獲取方法');
                  setGetAudioForUpload(() => getAudio);
                  console.log('音檔已準備好，可在儲存個案時上傳');
                }}
                onParsedDataReady={handleParsedData}
                placeholder="語音轉換的文字將顯示在這裡，或點擊「AI智能填入」自動填入左側欄位..."
              />
            </Box>
          </Box>
        </Box>

        {/* 提交按鈕 */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mt: 4,
          pt: 3,
          borderTop: `1px solid ${THEME_COLORS.BORDER_LIGHT}`
        }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSubmit}
            disabled={isSubmitting}
            sx={{
              ...commonStyles.primaryButton,
              px: 6,
              py: 1.5,
              fontSize: '1.1rem',
            }}
          >
            {isSubmitting ? '提交中...' : '新增個案'}
          </Button>
        </Box>
      </Box>

      {/* 圖片放大預覽模態框 */}
      {showImageModal && imagePreview && formData.profileImage !== 'uploading...' && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            p: 2
          }}
          onClick={() => setShowImageModal(false)}
        >
          <Box
            sx={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              bgcolor: 'white',
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imagePreview}
              alt="個案照片放大預覽"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
                maxWidth: '90vw',
                maxHeight: '90vh'
              }}
            />
            <Button
              onClick={() => setShowImageModal(false)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                minWidth: 'auto',
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: 'rgba(0,0,0,0.5)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.7)'
                }
              }}
            >
              ×
            </Button>
          </Box>
        </Box>
      )}
    </LocalizationProvider>
  );
};

export { AddCaseTab };
export default AddCaseTab; 