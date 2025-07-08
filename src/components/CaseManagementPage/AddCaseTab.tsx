import React, { useState } from 'react';
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
  Paper,
  Alert,
} from '@mui/material';
import {
  PhotoCamera,
  Save,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-tw'; // 中文本地化
import { commonStyles, getValidationStyle, getSelectValidationStyle, getDatePickerValidationStyle, getResponsiveSpacing } from '../../styles/commonStyles';
import { caseService } from '../../services/caseService';

// 設置 dayjs 為中文
dayjs.locale('zh-tw');

/**
 * 新增個案表單組件
 * 
 * 根據設計圖實作的完整個案新增表單，包含：
 * 1. 照片上傳功能
 * 2. 個人基本資訊（姓名、性別、生日、身分證字號、電話）
 * 3. 地址資訊（城市、地區、詳細地址）
 * 4. 聯絡資訊（Email）
 * 5. 個案困難類型
 */

interface AddCaseFormData {
  name: string;
  gender: 'Male' | 'Female';
  birthDate: Dayjs | null;
  idNumber: string;
  phone: string;
  city: string;
  district: string;
  address: string;
  email: string;
  difficulty: string;
  profileImage?: string;
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
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>({});

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
    setFormData(prev => ({
      ...prev,
      birthDate: value
    }));

    // 清除該欄位的錯誤狀態
    if (fieldErrors.birthDate) {
      setFieldErrors(prev => ({
        ...prev,
        birthDate: false
      }));
    }
  };

  /**
   * 處理圖片上傳
   */
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 檢查檔案大小 (限制為 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSubmitMessage({ type: 'error', text: '圖片檔案大小不能超過 5MB' });
        return;
      }

      // 檢查檔案類型
      if (!file.type.startsWith('image/')) {
        setSubmitMessage({ type: 'error', text: '請選擇有效的圖片檔案' });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setImagePreview(imageUrl);
        setFormData(prev => ({
          ...prev,
          profileImage: imageUrl
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * 移除圖片
   */
  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      profileImage: undefined
    }));
  };

  /**
   * 表單驗證
   */
  const validateForm = (): boolean => {
    const errors: { [key: string]: boolean } = {};
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = true;
      isValid = false;
      setSubmitMessage({ type: 'error', text: '請輸入姓名' });
      return false;
    }
    if (!formData.birthDate) {
      errors.birthDate = true;
      isValid = false;
      setSubmitMessage({ type: 'error', text: '請選擇生日' });
      return false;
    }
    if (!formData.idNumber.trim()) {
      errors.idNumber = true;
      isValid = false;
      setSubmitMessage({ type: 'error', text: '請輸入身分證字號' });
      return false;
    }
    if (!formData.phone.trim()) {
      errors.phone = true;
      isValid = false;
      setSubmitMessage({ type: 'error', text: '請輸入電話' });
      return false;
    }
    if (!formData.city) {
      errors.city = true;
      isValid = false;
      setSubmitMessage({ type: 'error', text: '請選擇城市' });
      return false;
    }
    if (!formData.district) {
      errors.district = true;
      isValid = false;
      setSubmitMessage({ type: 'error', text: '請選擇地區' });
      return false;
    }
    if (!formData.address.trim()) {
      errors.address = true;
      isValid = false;
      setSubmitMessage({ type: 'error', text: '請輸入地址' });
      return false;
    }
    if (!formData.email.trim()) {
      errors.email = true;
      isValid = false;
      setSubmitMessage({ type: 'error', text: '請輸入Email' });
      return false;
    }
    if (!formData.difficulty) {
      errors.difficulty = true;
      isValid = false;
      setSubmitMessage({ type: 'error', text: '請選擇個案的困難' });
      return false;
    }

    // Email 格式驗證
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = true;
      isValid = false;
      setSubmitMessage({ type: 'error', text: '請輸入有效的Email格式' });
      return false;
    }

    // 身分證字號格式驗證 (台灣身分證格式)
    const idRegex = /^[A-Z][12]\d{8}$/;
    if (!idRegex.test(formData.idNumber)) {
      errors.idNumber = true;
      isValid = false;
      setSubmitMessage({ type: 'error', text: '請輸入有效的身分證字號格式' });
      return false;
    }

    // 電話格式驗證
    const phoneRegex = /^09\d{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      errors.phone = true;
      isValid = false;
      setSubmitMessage({ type: 'error', text: '請輸入有效的手機號碼格式 (09xxxxxxxx)' });
      return false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  /**
   * 提交表單
   */
  const handleSubmit = async () => {
    setSubmitMessage(null);
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 構建要提交的資料
      const caseData = {
        name: formData.name,
        phone: formData.phone,
        identityNumber: formData.idNumber,
        birthday: formData.birthDate ? formData.birthDate.format('YYYY-MM-DD') : undefined,
        address: `${formData.city}${formData.district}${formData.address}`,
        description: formData.difficulty,
        email: formData.email,
        gender: 'Male',
        profileImage: formData.profileImage,
        city: formData.city,
        district: formData.district,
        detailAddress: formData.address
      };

      // 實際的 API 呼叫
      await caseService.createCase(caseData);

      setSubmitMessage({ type: 'success', text: '個案資料已成功建立！' });
      
      // 重置表單
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

    } catch (error) {
      console.error('建立個案失敗:', error);
      setSubmitMessage({ type: 'error', text: '建立個案失敗，請稍後再試' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-tw">
      {/* 提交訊息 */}
      {submitMessage && (
        <Alert 
          severity={submitMessage.type} 
          sx={{ ...commonStyles.spacing.element, mb: 2 }}
          onClose={() => setSubmitMessage(null)}
        >
          {submitMessage.text}
        </Alert>
      )}

      <Paper sx={{ 
        ...commonStyles.formSection, 
        width: '100%', 
        maxWidth: '100%',
        p: { 
          xs: 2, // 手機版使用較小的內邊距
          sm: 3, 
          md: 4 
        },
        mx: 0, // 確保沒有額外的水平邊距
        overflow: 'hidden' // 防止內容溢出
      }}>
        {/* 照片上傳區域 */}
        <Box sx={{ ...commonStyles.photoUploadSection }}>
          <Avatar
            src={imagePreview || undefined}
            sx={{
              width: { xs: 100, sm: 120 },
              height: { xs: 100, sm: 120 },
              mb: 2,
              ...commonStyles.defaultAvatar,
              fontSize: { xs: '2.5rem', sm: '3rem' }
            }}
          />
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoCamera />}
              sx={{ ...commonStyles.uploadButton }}
            >
              Upload Photo
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Button>
            
            {imagePreview && (
              <>
                <Typography variant="body2" sx={{ 
                  mx: 1,
                  ...commonStyles.separatorText
                }}>
                  |
                </Typography>
                <Button
                  variant="text"
                  onClick={handleRemoveImage}
                  sx={{ ...commonStyles.removeButton }}
                >
                  remove
                </Button>
              </>
            )}
          </Box>
        </Box>

        {/* 個人資訊 */}
        <Typography variant="h6" sx={{ ...commonStyles.formHeader }}>
          個人資訊
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: { xs: 2, sm: 3 }
        }}>
          {/* 第一行：姓名、性別、生日 */}
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 2, sm: 2, md: 3 }, 
            flexDirection: { xs: 'column', sm: 'row' },
            width: '100%'
          }}>
            <TextField
              label="姓名"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              fullWidth
              required
              placeholder="張閔凱"
              sx={{ 
                ...getValidationStyle(fieldErrors.name),
                flex: 1 
              }}
            />
            <FormControl fullWidth required sx={{ flex: 1 }}>
              <InputLabel>性別</InputLabel>
              <Select
                value={formData.gender}
                label="性別"
                onChange={(e) => handleInputChange('gender', e.target.value)}
                sx={{ ...getSelectValidationStyle(fieldErrors.gender) }}
              >
                {genderOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <DatePicker
              label="生日"
              value={formData.birthDate}
              onChange={handleDateChange}
              format="YYYY/MM/DD"
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  error: fieldErrors.birthDate,
                  helperText: "格式：yyyy/mm/dd",
                  sx: { 
                    ...getDatePickerValidationStyle(fieldErrors.birthDate),
                    flex: 1 
                  }
                }
              }}
            />
          </Box>

          {/* 第二行：身分證字號、電話 */}
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 2, sm: 2, md: 3 }, 
            flexDirection: { xs: 'column', sm: 'row' },
            width: '100%'
          }}>
            <TextField
              label="身分證字號"
              value={formData.idNumber}
              onChange={(e) => handleInputChange('idNumber', e.target.value.toUpperCase())}
              fullWidth
              required
              placeholder="A123456789"
              inputProps={{ maxLength: 10 }}
              sx={{ 
                ...getValidationStyle(fieldErrors.idNumber),
                flex: 1 
              }}
            />
            <TextField
              label="電話"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              fullWidth
              required
              placeholder="0972628466"
              inputProps={{ maxLength: 10 }}
              sx={{ 
                ...getValidationStyle(fieldErrors.phone),
                flex: 1 
              }}
            />
          </Box>
        </Box>

        {/* 地址 */}
        <Typography variant="h6" sx={{ 
          ...commonStyles.formHeader, 
          mt: { xs: 3, sm: 4 }
        }}>
          地址
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 2, sm: 2, md: 3 }, 
          flexDirection: { xs: 'column', md: 'row' },
          width: '100%'
        }}>
          {/* 城市、地區、地址 */}
          <FormControl fullWidth required sx={{ flex: 1 }}>
            <InputLabel>城市</InputLabel>
            <Select
              value={formData.city}
              label="城市"
              onChange={(e) => handleInputChange('city', e.target.value)}
              sx={{ ...getSelectValidationStyle(fieldErrors.city) }}
            >
              {cityOptions.map((city) => (
                <MenuItem key={city} value={city}>
                  {city}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth required sx={{ flex: 1 }}>
            <InputLabel>地區</InputLabel>
            <Select
              value={formData.district}
              label="地區"
              onChange={(e) => handleInputChange('district', e.target.value)}
              disabled={!formData.city}
              sx={{ ...getSelectValidationStyle(fieldErrors.district) }}
            >
              {(districtOptions[formData.city] || []).map((district) => (
                <MenuItem key={district} value={district}>
                  {district}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="地址"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            fullWidth
            required
            placeholder="文心路一段315號19樓之2"
            sx={{ 
              ...getValidationStyle(fieldErrors.address),
              flex: 1 
            }}
          />
        </Box>

        {/* Email */}
        <Box sx={{ mt: { xs: 2, sm: 3 } }}>
          <TextField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            fullWidth
            required
            placeholder="jsandknodkin@gmail.com"
            sx={{ ...getValidationStyle(fieldErrors.email) }}
          />
        </Box>

        {/* 個案的困難 */}
        <Box sx={{ 
          mt: { xs: 2, sm: 3 }
        }}>
          <FormControl fullWidth required>
            <InputLabel>個案的困難</InputLabel>
            <Select
              value={formData.difficulty}
              label="個案的困難"
              onChange={(e) => handleInputChange('difficulty', e.target.value)}
              sx={{ ...getSelectValidationStyle(fieldErrors.difficulty) }}
            >
              {difficultyOptions.map((difficulty) => (
                <MenuItem key={difficulty} value={difficulty}>
                  {difficulty}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* 儲存按鈕 */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: { xs: 'center', sm: 'flex-end' }, 
          mt: { xs: 3, sm: 4 },
          width: '100%'
        }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={isSubmitting}
            startIcon={<Save />}
            sx={{
              ...commonStyles.primaryButton,
              px: { xs: 3, sm: 4 },
              py: { xs: 1.2, sm: 1.5 },
              fontSize: { xs: '1rem', sm: '1.1rem' },
              borderRadius: 2,
              minWidth: { xs: '120px', sm: 'auto' },
            }}
          >
            {isSubmitting ? '儲存中...' : '儲存'}
          </Button>
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};

export { AddCaseTab };
export default AddCaseTab; 