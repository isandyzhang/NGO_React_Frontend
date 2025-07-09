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
  Alert,
} from '@mui/material';
import {
  PhotoCamera,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-tw';
import { commonStyles, getValidationStyle, getSelectValidationStyle, getDatePickerValidationStyle, getResponsiveSpacing } from '../../styles/commonStyles';
import { THEME_COLORS } from '../../styles/theme';
import { caseService } from '../../services/caseService';
import Stepper from '../shared/Stepper';
import CaseDetailForm from './CaseDetailForm';

// 設置 dayjs 為中文
dayjs.locale('zh-tw');

/**
 * 分页新增個案表單組件
 * 
 * 使用Stepper組件將表單分為6個步驟：
 * 1. 基本資料 - 姓名、性別、生日
 * 2. 身份資訊 - 身分證字號、電話
 * 3. 地址資訊 - 城市、地區、詳細地址
 * 4. 聯絡資訊 - Email
 * 5. 困難類型 - 個案困難類型
 * 6. 照片上傳 - 個人照片
 */

interface AddCaseFormData {
  // 第一頁：基本資料
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
  
  // 第二頁：個案詳細資料
  contact_name: string;
  contact_relation: string;
  contact_phone: string;
  home_phone: string;
  family_status: string;
  fq: string;
  family_members: string;
  family_type: string;
  parent_nation_father: string;
  parent_nation_mother: string;
  residence: string;
  main_caregiver_name: string;
  main_caregiver_relation: string;
  main_caregiver_id: string;
  main_caregiver_birth: Dayjs | null;
  main_caregiver_job: string;
  main_caregiver_marry_status: string;
  main_caregiver_edu: string;
  source: string;
  help_experience: string;
  consultation: string;
  note: string;
}

const AddCaseStepperForm: React.FC = () => {
  // 表單狀態
  const [formData, setFormData] = useState<AddCaseFormData>({
    // 第一頁：基本資料
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
    
    // 第二頁：個案詳細資料
    contact_name: '',
    contact_relation: '',
    contact_phone: '',
    home_phone: '',
    family_status: '',
    fq: '',
    family_members: '',
    family_type: '',
    parent_nation_father: '',
    parent_nation_mother: '',
    residence: '',
    main_caregiver_name: '',
    main_caregiver_relation: '',
    main_caregiver_id: '',
    main_caregiver_birth: null,
    main_caregiver_job: '',
    main_caregiver_marry_status: '',
    main_caregiver_edu: '',
    source: '',
    help_experience: '',
    consultation: '',
    note: '',
  });

  const [activeStep, setActiveStep] = useState(0);
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
   * 處理第二頁日期變更
   */
  const handleDetailDateChange = (field: keyof AddCaseFormData, value: Dayjs | null) => {
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
   * 驗證當前步驟
   */
  const validateCurrentStep = (): boolean => {
    const errors: { [key: string]: boolean } = {};

    switch (activeStep) {
      case 0: // 基本資料
        if (!formData.name.trim()) errors.name = true;
        if (!formData.birthDate) errors.birthDate = true;
        break;
      case 1: // 個案詳細資料
        if (!formData.contact_name.trim()) errors.contact_name = true;
        if (!formData.contact_relation) errors.contact_relation = true;
        if (!formData.contact_phone.trim()) errors.contact_phone = true;
        if (!formData.family_type) errors.family_type = true;
        if (!formData.source) errors.source = true;
        break;
      case 2: // 身份資訊
        if (!formData.idNumber.trim()) errors.idNumber = true;
        if (!formData.phone.trim()) errors.phone = true;
        break;
      case 3: // 地址資訊
        if (!formData.city) errors.city = true;
        if (!formData.district) errors.district = true;
        if (!formData.address.trim()) errors.address = true;
        break;
      case 4: // 聯絡資訊
        if (!formData.email.trim()) errors.email = true;
        break;
      case 5: // 困難類型
        if (!formData.difficulty) errors.difficulty = true;
        break;
      case 6: // 照片上傳 (可選)
        break;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * 處理下一步
   */
  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStep(prev => prev + 1);
    }
  };

  /**
   * 處理上一步
   */
  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  /**
   * 處理完成
   */
  const handleFinish = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const caseData = {
        name: formData.name,
        phone: formData.phone,
        identityNumber: formData.idNumber,
        birthday: formData.birthDate ? formData.birthDate.format('YYYY-MM-DD') : undefined,
        address: `${formData.city}${formData.district}${formData.address}`,
        description: formData.difficulty,
        email: formData.email,
        gender: formData.gender,
        profileImage: formData.profileImage,
        city: formData.city,
        district: formData.district,
        detailAddress: formData.address
      };

      await caseService.createCase(caseData);
      setSubmitMessage({ type: 'success', text: '個案新增成功！' });
      
      // 重置表單
      setFormData({
        // 第一頁：基本資料
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
        
        // 第二頁：個案詳細資料
        contact_name: '',
        contact_relation: '',
        contact_phone: '',
        home_phone: '',
        family_status: '',
        fq: '',
        family_members: '',
        family_type: '',
        parent_nation_father: '',
        parent_nation_mother: '',
        residence: '',
        main_caregiver_name: '',
        main_caregiver_relation: '',
        main_caregiver_id: '',
        main_caregiver_birth: null,
        main_caregiver_job: '',
        main_caregiver_marry_status: '',
        main_caregiver_edu: '',
        source: '',
        help_experience: '',
        consultation: '',
        note: '',
      });
      setActiveStep(0);
      setImagePreview(null);
    } catch (error) {
      setSubmitMessage({ type: 'error', text: '新增個案失敗，請稍後再試' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 步驟配置
  const steps = [
    {
      label: '基本資料',
      description: '個人基本資料',
      content: (
        <Box sx={{ 
          bgcolor: THEME_COLORS.BACKGROUND_CARD,
          borderRadius: 2,
          p: 3,
          border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ 
              color: THEME_COLORS.TEXT_PRIMARY,
              fontWeight: 600,
              mb: 2,
            }}>
              個人基本資料
            </Typography>
          </Box>
          
          {/* 照片上傳區域 */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            mb: 3,
            p: 3,
            bgcolor: THEME_COLORS.BACKGROUND_SECONDARY,
            borderRadius: 2,
            border: `2px dashed ${THEME_COLORS.BORDER_DASHED}`,
          }}>
            <Avatar
              src={imagePreview || undefined}
              sx={{
                width: 120,
                height: 120,
                fontSize: '3rem',
                bgcolor: formData.gender === 'Male' ? THEME_COLORS.MALE_AVATAR : THEME_COLORS.FEMALE_AVATAR,
                mb: 2,
                border: `3px solid ${THEME_COLORS.BORDER_LIGHT}`,
              }}
            >
              {formData.name ? formData.name.charAt(0) : '?'}
            </Avatar>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCamera />}
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
              
              {imagePreview && (
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
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* 第一行：姓名、性別、生日 */}
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              flexDirection: { xs: 'column', md: 'row' },
              p: 2,
              borderRadius: 1,
            }}>
              <TextField
                fullWidth
                label="姓名"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                sx={getValidationStyle(fieldErrors.name)}
                required
                placeholder="張閔凱"
              />
              <FormControl fullWidth sx={getSelectValidationStyle(fieldErrors.gender)}>
                <InputLabel>性別</InputLabel>
                <Select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  label="性別"
                >
                  {genderOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="生日"
                  value={formData.birthDate}
                  onChange={handleDateChange}
                  sx={getDatePickerValidationStyle(fieldErrors.birthDate)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      placeholder: "YYYY/MM/DD",
                    }
                  }}
                />
              </LocalizationProvider>
            </Box>

            {/* 第二行：身分證字號、電話 */}
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              flexDirection: { xs: 'column', md: 'row' },
              p: 2,
              borderRadius: 1,
            }}>
              <TextField
                fullWidth
                label="身分證字號"
                value={formData.idNumber}
                onChange={(e) => handleInputChange('idNumber', e.target.value.toUpperCase())}
                sx={getValidationStyle(fieldErrors.idNumber)}
                required
                placeholder="A123456789"
                inputProps={{ maxLength: 10 }}
              />
              <TextField
                fullWidth
                label="電話"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                sx={getValidationStyle(fieldErrors.phone)}
                required
                placeholder="0972628466"
                inputProps={{ maxLength: 10 }}
              />
            </Box>

            {/* 第三行：地址資訊 */}
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              flexDirection: { xs: 'column', md: 'row' },
              p: 2,
              borderRadius: 1,
            }}>
              <FormControl fullWidth sx={getSelectValidationStyle(fieldErrors.city)}>
                <InputLabel>城市</InputLabel>
                <Select
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  label="城市"
                  required
                >
                  {cityOptions.map((city) => (
                    <MenuItem key={city} value={city}>
                      {city}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={getSelectValidationStyle(fieldErrors.district)}>
                <InputLabel>地區</InputLabel>
                <Select
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  label="地區"
                  disabled={!formData.city}
                  required
                >
                  {formData.city && districtOptions[formData.city]?.map((district) => (
                    <MenuItem key={district} value={district}>
                      {district}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="詳細地址"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                sx={getValidationStyle(fieldErrors.address)}
                required
                placeholder="文心路一段315號19樓之2"
              />
            </Box>

            {/* 第四行：Email */}
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              flexDirection: { xs: 'column', md: 'row' },
              p: 2,
              borderRadius: 1,
            }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                sx={getValidationStyle(fieldErrors.email)}
                required
                placeholder="jsandknodkin@gmail.com"
              />
              <FormControl fullWidth sx={getSelectValidationStyle(fieldErrors.difficulty)}>
                <InputLabel>困難類型</InputLabel>
                <Select
                  value={formData.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                  label="困難類型"
                  required
                >
                  {difficultyOptions.map((difficulty) => (
                    <MenuItem key={difficulty} value={difficulty}>
                      {difficulty}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Box>
      )
    },
    {
      label: '個案詳細資料',
      description: '聯絡人、家庭、照顧者資訊',
      content: (
        <CaseDetailForm
          formData={formData}
          onInputChange={handleInputChange}
          onDateChange={handleDetailDateChange}
          fieldErrors={fieldErrors}
        />
      )
    },
    {
      label: '身份資訊',
      description: '身分證字號、電話',
      content: (
        <Box sx={{ 
          bgcolor: THEME_COLORS.BACKGROUND_CARD,
          borderRadius: 2,
          p: 3,
          border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ 
              color: THEME_COLORS.TEXT_PRIMARY,
              fontWeight: 600,
              mb: 2,
            }}>
              身份資訊
            </Typography>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            flexDirection: { xs: 'column', md: 'row' },
            p: 2,
            borderRadius: 1,
          }}>
            <TextField
              fullWidth
              label="身分證字號"
              value={formData.idNumber}
              onChange={(e) => handleInputChange('idNumber', e.target.value)}
              sx={getValidationStyle(fieldErrors.idNumber)}
              required
            />
            <TextField
              fullWidth
              label="電話"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              sx={getValidationStyle(fieldErrors.phone)}
              required
            />
          </Box>
        </Box>
      )
    },
    {
      label: '地址資訊',
      description: '城市、地區、詳細地址',
      content: (
        <Box sx={{ 
          bgcolor: THEME_COLORS.BACKGROUND_CARD,
          borderRadius: 2,
          p: 3,
          border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ 
              color: THEME_COLORS.TEXT_PRIMARY,
              fontWeight: 600,
              mb: 2,
            }}>
              地址資訊
            </Typography>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            flexDirection: { xs: 'column', md: 'row' },
            p: 2,
            borderRadius: 1,
          }}>
            <FormControl fullWidth sx={getSelectValidationStyle(fieldErrors.city)}>
              <InputLabel>城市</InputLabel>
              <Select
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                label="城市"
                required
              >
                {cityOptions.map((city) => (
                  <MenuItem key={city} value={city}>
                    {city}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={getSelectValidationStyle(fieldErrors.district)}>
              <InputLabel>地區</InputLabel>
              <Select
                value={formData.district}
                onChange={(e) => handleInputChange('district', e.target.value)}
                label="地區"
                disabled={!formData.city}
                required
              >
                {formData.city && districtOptions[formData.city]?.map((district) => (
                  <MenuItem key={district} value={district}>
                    {district}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="詳細地址"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              sx={getValidationStyle(fieldErrors.address)}
              required
            />
          </Box>
        </Box>
      )
    },
    {
      label: '聯絡資訊',
      description: 'Email',
      content: (
        <Box sx={{ 
          bgcolor: THEME_COLORS.BACKGROUND_CARD,
          borderRadius: 2,
          p: 3,
          border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ 
              color: THEME_COLORS.TEXT_PRIMARY,
              fontWeight: 600,
              mb: 2,
            }}>
              聯絡資訊
            </Typography>
          </Box>
          <Box sx={{ 
            p: 2,
            borderRadius: 1,
          }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              sx={getValidationStyle(fieldErrors.email)}
              required
            />
          </Box>
        </Box>
      )
    },
    {
      label: '困難類型',
      description: '個案困難類型',
      content: (
        <Box sx={{ 
          bgcolor: THEME_COLORS.BACKGROUND_CARD,
          borderRadius: 2,
          p: 3,
          border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ 
              color: THEME_COLORS.TEXT_PRIMARY,
              fontWeight: 600,
              mb: 2,
            }}>
              困難類型
            </Typography>
          </Box>
          <Box sx={{ 
            p: 2,
            borderRadius: 1,
          }}>
            <FormControl fullWidth sx={getSelectValidationStyle(fieldErrors.difficulty)}>
              <InputLabel>困難類型</InputLabel>
              <Select
                value={formData.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                label="困難類型"
                required
              >
                {difficultyOptions.map((difficulty) => (
                  <MenuItem key={difficulty} value={difficulty}>
                    {difficulty}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      )
    },
    {
      label: '照片上傳',
      description: '個人照片（可選）',
      content: (
        <Box sx={{ 
          bgcolor: THEME_COLORS.BACKGROUND_CARD,
          borderRadius: 2,
          p: 3,
          border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ 
              color: THEME_COLORS.TEXT_PRIMARY,
              fontWeight: 600,
              mb: 2,
            }}>
              照片上傳
            </Typography>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: 2,
            p: 3,
            bgcolor: THEME_COLORS.BACKGROUND_SECONDARY,
            borderRadius: 2,
            border: `2px dashed ${THEME_COLORS.BORDER_DASHED}`,
          }}>
            <Avatar
              src={imagePreview || undefined}
              sx={{
                width: 120,
                height: 120,
                fontSize: '3rem',
                bgcolor: formData.gender === 'Male' ? THEME_COLORS.MALE_AVATAR : THEME_COLORS.FEMALE_AVATAR,
                border: `3px solid ${THEME_COLORS.BORDER_LIGHT}`,
              }}
            >
              {formData.name ? formData.name.charAt(0) : '?'}
            </Avatar>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCamera />}
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
              
              {imagePreview && (
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
            
            <Typography variant="caption" sx={{ color: THEME_COLORS.TEXT_MUTED }}>
              支援 JPG、PNG 格式，檔案大小不超過 5MB
            </Typography>
          </Box>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ width: '100%' }}>
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

      {/* Stepper 組件 */}
      <Box sx={{ 
        bgcolor: THEME_COLORS.BACKGROUND_CARD,
        borderRadius: 2,
        p: 3,
        border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}>
        <Stepper
          steps={steps}
          activeStep={activeStep}
          onStepChange={setActiveStep}
          onNext={handleNext}
          onBack={handleBack}
          onFinish={handleFinish}
          canProceed={!isSubmitting}
        />
      </Box>
    </Box>
  );
};

export default AddCaseStepperForm; 