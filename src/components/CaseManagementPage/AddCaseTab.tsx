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
  IconButton,
} from '@mui/material';
import {
  PhotoCamera,
  Delete,
  Save,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-tw'; // 中文本地化
import { commonStyles, getValidationStyle, getSelectValidationStyle, getDatePickerValidationStyle, getResponsiveSpacing } from '../../styles/commonStyles';
import { CaseFormData } from '../../services/caseService';

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
  gender: 'male' | 'female';
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
    gender: 'male',
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
    { value: 'male', label: '男' },
    { value: 'female', label: '女' },
  ];

  const cityOptions = [
    '台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市',
    '基隆市', '新竹市', '嘉義市', '宜蘭縣', '新竹縣', '苗栗縣',
    '彰化縣', '南投縣', '雲林縣', '嘉義縣', '屏東縣', '台東縣',
    '花蓮縣', '澎湖縣', '金門縣', '連江縣'
  ];

  const districtOptions: { [key: string]: string[] } = {
    '台北市': ['中正區', '大同區', '中山區', '松山區', '大安區', '萬華區', '信義區', '士林區', '北投區', '內湖區', '南港區', '文山區'],
    '台中市': ['中區', '東區', '南區', '西區', '北區', '西屯區', '南屯區', '北屯區', '豐原區', '東勢區', '大甲區', '清水區', '沙鹿區', '梧棲區'],
    '高雄市': ['新興區', '前金區', '苓雅區', '鹽埕區', '鼓山區', '旗津區', '前鎮區', '三民區', '楠梓區', '小港區', '左營區', '仁武區'],
    // 可以根據需要添加更多城市的區域選項
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
      const caseData: CaseFormData = {
        name: formData.name,
        birthDate: formData.birthDate ? formData.birthDate.format('YYYY-MM-DD') : '',
        idNumber: formData.idNumber,
        gender: formData.gender === 'male' ? 'male' : formData.gender === 'female' ? 'female' : 'other',
        city: formData.city,
        district: formData.district,
        detailAddress: formData.address,
        schoolType: '', // 這些欄位在圖片中沒有，先設為空值
        schoolDistrict: '',
        contactName: formData.name, // 使用個案姓名作為聯絡人
        relationship: '本人',
        phoneRegion: '台灣',
        phoneNumber: formData.phone,
        mobilePhone: formData.phone,
        email: formData.email,
        specialStatus: {
          lowIncome: formData.difficulty === '經濟困難',
          singleParent: false,
          newResident: false,
          indigenous: false,
          disabled: false,
          other: formData.difficulty !== '經濟困難' ? formData.difficulty : ''
        },
        profileImage: formData.profileImage
      };

      // TODO: 實際的 API 呼叫
      // await caseService.createCase(caseData);
      
      // 模擬 API 呼叫
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSubmitMessage({ type: 'success', text: '個案資料已成功建立！' });
      
      // 重置表單
      setFormData({
        name: '',
        gender: 'male',
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