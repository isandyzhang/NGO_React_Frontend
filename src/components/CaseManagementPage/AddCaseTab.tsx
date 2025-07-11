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
import { caseService } from '../../services/caseService';
import { validateIdNumber, validatePhone, validateEmail, validateRequired } from '../../utils/validation';

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
    '新北市': ['板橋區', '三重區', '中和區', '永和區', '新莊區', '新店區', '樹林區', '鶯歌區', '三峽區', '淡水區', '汐止區', '瑞芳區', '土城區', '蘆洲區', '五股區', '泰山區', '林口區'],
    '桃園市': ['桃園區', '中壢區', '平鎮區', '八德區', '楊梅區', '蘆竹區', '大溪區', '大園區', '龜山區', '龍潭區', '新屋區', '觀音區', '復興區'],
    '台中市': ['中區', '東區', '南區', '西區', '北區', '西屯區', '南屯區', '北屯區', '豐原區', '東勢區', '大甲區', '清水區', '沙鹿區', '梧棲區', '后里區', '神岡區', '潭子區', '大雅區'],
    '台南市': ['中西區', '東區', '南區', '北區', '安平區', '安南區', '永康區', '歸仁區', '新化區', '左鎮區', '玉井區', '楠西區', '南化區', '仁德區', '關廟區', '龍崎區'],
    '高雄市': ['新興區', '前金區', '苓雅區', '鹽埕區', '鼓山區', '旗津區', '前鎮區', '三民區', '楠梓區', '小港區', '左營區', '仁武區', '大社區', '岡山區', '路竹區'],
    '基隆市': ['仁愛區', '信義區', '中正區', '中山區', '安樂區', '暖暖區', '七堵區'],
    '新竹市': ['東區', '北區', '香山區'],
    '嘉義市': ['東區', '西區'],
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

    // 清除生日欄位的錯誤狀態
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
      // 檢查檔案大小 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSubmitMessage({
          type: 'error',
          text: '圖片檔案大小不能超過 5MB'
        });
        return;
      }

      // 檢查檔案格式
      if (!file.type.startsWith('image/')) {
        setSubmitMessage({
          type: 'error',
          text: '請選擇有效的圖片檔案 (JPG, PNG)'
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setImagePreview(base64String);
        setFormData(prev => ({
          ...prev,
          profileImage: base64String
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
    let hasErrors = false;

    // 必填欄位驗證
    const requiredFields = ['name', 'idNumber', 'phone', 'city', 'district', 'address', 'email', 'difficulty'];
    
    requiredFields.forEach(field => {
      if (!validateRequired(formData[field as keyof AddCaseFormData] as string)) {
        errors[field] = true;
        hasErrors = true;
      }
    });

    // 驗證生日
    if (!formData.birthDate) {
      errors.birthDate = true;
      hasErrors = true;
    }

    // 驗證身分證格式
    if (formData.idNumber && !validateIdNumber(formData.idNumber)) {
      errors.idNumber = true;
      hasErrors = true;
    }

    // 驗證手機格式
    if (formData.phone && !validatePhone(formData.phone)) {
      errors.phone = true;
      hasErrors = true;
    }

    // 驗證Email格式
    if (formData.email && !validateEmail(formData.email)) {
      errors.email = true;
      hasErrors = true;
    }

    setFieldErrors(errors);
    return !hasErrors;
  };

  /**
   * 提交表單
   */
  const handleSubmit = async () => {
    if (!validateForm()) {
      setSubmitMessage({
        type: 'error',
        text: '請檢查表單資料，確保所有必填欄位都已正確填寫'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      // 準備提交的資料
      const submitData = {
        name: formData.name,
        gender: formData.gender,
        birthday: formData.birthDate?.format('YYYY-MM-DD'),
        identityNumber: formData.idNumber,
        phone: formData.phone,
        city: formData.city,
        district: formData.district,
        address: `${formData.city}${formData.district}${formData.address}`,
        detailAddress: formData.address,
        email: formData.email,
        description: formData.difficulty,
        profileImage: formData.profileImage,
      };

      // 調試日誌：顯示發送的日期格式
      console.log('🔍 提交數據調試：', {
        originalDate: formData.birthDate,
        formattedDate: submitData.birthday,
        dateType: typeof submitData.birthday,
        isValid: formData.birthDate?.isValid(),
      });

      await caseService.createCase(submitData);

      setSubmitMessage({
        type: 'success',
        text: '個案資料已成功新增！'
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

    } catch (error) {
      console.error('提交個案資料失敗:', error);
      setSubmitMessage({
        type: 'error',
        text: '提交失敗，請稍後再試'
      });
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
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      sx={getValidationStyle(fieldErrors.name)}
                      required
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
                    <FormControl fullWidth sx={getSelectValidationStyle(fieldErrors.gender)}>
                      <InputLabel>性別</InputLabel>
                      <Select
                        value={formData.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        label="性別"
                        required
                      >
                        {genderOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <DatePicker
                      label="生日"
                      value={formData.birthDate}
                      onChange={handleDateChange}
                      sx={getDatePickerValidationStyle(fieldErrors.birthDate)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                        },
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 250px', minWidth: '200px' }}>
                    <TextField
                      fullWidth
                      label="身分證字號"
                      value={formData.idNumber}
                      onChange={(e) => handleInputChange('idNumber', e.target.value)}
                      sx={getValidationStyle(fieldErrors.idNumber)}
                      required
                      placeholder="例：A123456789"
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
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      sx={getValidationStyle(fieldErrors.phone)}
                      required
                      placeholder="例：0912345678"
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      sx={getValidationStyle(fieldErrors.email)}
                      required
                      placeholder="例：example@email.com"
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
                  </Box>
                  <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
                    <FormControl fullWidth sx={getSelectValidationStyle(fieldErrors.district)}>
                      <InputLabel>地區</InputLabel>
                      <Select
                        value={formData.district}
                        onChange={(e) => handleInputChange('district', e.target.value)}
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
                    </FormControl>
                  </Box>
                </Box>
                <TextField
                  fullWidth
                  label="詳細地址"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  sx={getValidationStyle(fieldErrors.address)}
                  required
                  multiline
                  rows={2}
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
                  <Avatar
                    src={imagePreview || undefined}
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
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
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
                  
                  <Typography variant="caption" sx={{ 
                    color: THEME_COLORS.TEXT_MUTED,
                    textAlign: 'center'
                  }}>
                    支援 JPG、PNG 格式<br />
                    檔案大小不超過 5MB
                  </Typography>
                </Box>
              </CardContent>
            </Card>
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
    </LocalizationProvider>
  );
};

export { AddCaseTab };
export default AddCaseTab; 