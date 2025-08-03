import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  useTheme,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  CircularProgress,
} from '@mui/material';
import { Cancel, Person, People, AutoAwesome, Close } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-tw'; // 中文本地化
import { THEME_COLORS } from '../../styles/theme';
import { commonStyles, getResponsiveSpacing, getButtonStyle, getButtonVariant } from '../../styles/commonStyles';
import activityService, { CategoryOption } from '../../services/activityManagement/activityService';
import imageGenerationService from '../../services/activityManagement/activityImageService';
import AIOptimizeButton from '../shared/AIOptimizeButton';
import GoogleMapSelector from '../shared/GoogleMapSelector';

// 設置 dayjs 為中文
dayjs.locale('zh-tw');

/**
 * 位置資料介面
 */
interface LocationData {
  address: string;
  placeName: string; // 修正：移除可選標記
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

/**
 * 活動表單資料介面
 */
interface ActivityFormData {
  activityName: string;
  description: string;
  imageUrl?: string;
  location: string;
  locationData?: LocationData; // 新增位置資料
  maxParticipants: number;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  signupDeadline: Dayjs | null;
  workerId: number;
  targetAudience: string; // 'public' | 'case'
  category: string;
  status: string;
}

/**
 * 新增活動表單組件 Props
 */
interface NewActivityFormProps {
  onSubmit?: (data: ActivityFormData) => void;
  onCancel?: () => void;
}

/**
 * 取得動態主題顏色
 */
const getDynamicThemeColors = (activityType: 'public' | 'case') => {
  if (activityType === 'case') {
    // 個案活動使用綠色系
    return {
      primary: THEME_COLORS.PRIMARY,
      primaryLight: THEME_COLORS.PRIMARY_LIGHT,
      primaryDark: THEME_COLORS.PRIMARY_DARK,
      primaryHover: THEME_COLORS.PRIMARY_HOVER,
      primaryLightBg: THEME_COLORS.PRIMARY_LIGHT_BG,
      primaryTransparent: THEME_COLORS.PRIMARY_TRANSPARENT,
    };
  } else {
    // 民眾活動使用淡藍色系
    return {
      primary: THEME_COLORS.INFO,
      primaryLight: '#64b5f6',
      primaryDark: '#1976d2',
      primaryHover: '#1565c0',
      primaryLightBg: '#e3f2fd',
      primaryTransparent: 'rgba(33, 150, 243, 0.1)',
    };
  }
};

/**
 * 新增活動表單組件 (NewActivityForm)
 * 
 * 主要功能：
 * 1. 活動基本資訊輸入（名稱、日期、時間、地點）
 * 2. 人數需求設定（志工人數、個案人數）
 * 3. 活動圖片上傳和預覽
 * 4. 活動描述輸入（簡述和詳細說明）
 * 5. 表單驗證和提交
 * 6. 動態主題顏色切換（志工綠色系，個案橙色系）
 * 
 * 特色功能：
 * - 響應式設計，支援桌面和手機
 * - 圖片上傳和即時預覽
 * - 檔案大小和類型驗證
 * - 動態主題與活動類型一致
 * - 完整的錯誤處理
 */
const NewActivityForm: React.FC<NewActivityFormProps> = ({ onSubmit, onCancel }) => {
  const theme = useTheme();
  const { user } = useAuth();

  // 分類選項狀態
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  // AI 圖片生成狀態
  const [aiImageDialogOpen, setAiImageDialogOpen] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageData, setGeneratedImageData] = useState<string | null>(null);
  const [isUploadingToAzure, setIsUploadingToAzure] = useState(false);

  // 表單資料狀態
  const [formData, setFormData] = useState<ActivityFormData>({
    activityName: '',
    description: '',
    imageUrl: '',
    location: '',
    locationData: undefined,
    maxParticipants: 0,
    startDate: dayjs().add(7, 'day').hour(12).minute(0), // 預設為七天後中午12點
    endDate: dayjs().add(7, 'day').hour(17).minute(0), // 預設為七天後下午5點（開始時間後5小時）
    signupDeadline: dayjs().add(4, 'day').hour(12).minute(0), // 預設為四天後中午12點（開始時間前3天）
    workerId: user?.workerId || 0, // 從登入使用者取得workerId
    targetAudience: 'case',
    category: '',
    status: 'open',
  });

  // 驗證狀態
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>({});
  const [fieldErrorMessages, setFieldErrorMessages] = useState<{ [key: string]: string }>({});

  // 載入分類選項
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoryData = await activityService.getCategories();
        setCategories(categoryData);
      } catch (error) {
        console.error('載入分類選項失敗:', error);
      }
    };

    loadCategories();
  }, []);

  // 動態主題顏色
  const dynamicColors = useMemo(() => getDynamicThemeColors(formData.targetAudience as 'public' | 'case'), [formData.targetAudience]);

  // 動態輸入框樣式
  const dynamicInputStyles = useMemo(() => ({
    ...commonStyles.formInput,
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#ffffff',
      '&.Mui-focused fieldset': {
        borderColor: dynamicColors.primary,
      },
    },
    '& .MuiInputLabel-root': {
      '&.Mui-focused': {
        color: dynamicColors.primary,
      },
    },
  }), [dynamicColors]);

  // 動態日期選擇器樣式
  const dynamicDatePickerStyles = useMemo(() => ({
    ...commonStyles.formDatePicker,
    '& .MuiOutlinedInput-root': {
      '&.Mui-focused fieldset': {
        borderColor: dynamicColors.primary,
      },
    },
    '& .MuiInputLabel-root': {
      '&.Mui-focused': {
        color: dynamicColors.primary,
      },
    },
  }), [dynamicColors]);

  // 即時欄位驗證函數
  const validateField = (fieldName: string, value: any) => {
    let isValid = true;
    let errorMessage = '';

    switch (fieldName) {
      case 'activityName':
        if (!value.trim()) {
          isValid = false;
          errorMessage = '活動名稱為必填欄位';
        } else if (value.trim().length < 2) {
          isValid = false;
          errorMessage = '活動名稱至少需要2個字元';
        } else if (value.trim().length > 100) {
          isValid = false;
          errorMessage = '活動名稱不能超過100個字元';
        }
        break;

      case 'location':
        // 檢查 locationData 而不是 location 字符串
        if (!formData.locationData || !formData.locationData.address.trim()) {
          isValid = false;
          errorMessage = '請選擇活動地點';
        } else if (formData.locationData.address.trim().length < 5) {
          isValid = false;
          errorMessage = '活動地點至少需要5個字元';
        } else if (formData.locationData.address.trim().length > 200) {
          isValid = false;
          errorMessage = '活動地點不能超過200個字元';
        }
        break;

      case 'maxParticipants':
        if (!value || value <= 0) {
          isValid = false;
          errorMessage = '人數需求為必填欄位，且必須大於0';
        } else if (value > 1000) {
          isValid = false;
          errorMessage = '人數需求不能超過1000人';
        }
        break;

      case 'category':
        if (!value.trim()) {
          isValid = false;
          errorMessage = '活動分類為必填欄位';
        }
        break;

      case 'description':
        if (!value.trim()) {
          isValid = false;
          errorMessage = '活動描述為必填欄位';
        } else if (value.trim().length < 10) {
          isValid = false;
          errorMessage = '活動描述至少需要10個字元';
        } else if (value.trim().length > 1000) {
          isValid = false;
          errorMessage = '活動描述不能超過1000個字元';
        }
        break;

      case 'startDate':
        if (!value) {
          isValid = false;
          errorMessage = '開始時間為必填欄位';
        } else if (value.isBefore(dayjs())) {
          isValid = false;
          errorMessage = '開始時間不能早於現在';
        }
        break;

      case 'endDate':
        if (!value) {
          isValid = false;
          errorMessage = '結束時間為必填欄位';
        } else if (formData.startDate && value.isBefore(formData.startDate)) {
          isValid = false;
          errorMessage = '結束時間不能早於開始時間';
        }
        break;

      case 'signupDeadline':
        if (!value) {
          isValid = false;
          errorMessage = '報名截止日為必填欄位';
        } else if (formData.startDate && value.isAfter(formData.startDate)) {
          isValid = false;
          errorMessage = '報名截止日不能晚於開始時間';
        }
        break;

      default:
        break;
    }

    return { isValid, errorMessage };
  };

  // 處理欄位失焦驗證
  const handleFieldBlur = (fieldName: string, value: any) => {
    const { isValid, errorMessage } = validateField(fieldName, value);
    
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: !isValid
    }));
    
    setFieldErrorMessages(prev => ({
      ...prev,
      [fieldName]: errorMessage
    }));
  };

  // 清除欄位錯誤
  const clearFieldError = useCallback((fieldName: string) => {
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: false
    }));
    
    setFieldErrorMessages(prev => ({
      ...prev,
      [fieldName]: ''
    }));
  }, []);

  /**
   * 處理表單欄位變更
   */
  const handleInputChange = (field: keyof ActivityFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // 清除該欄位的錯誤狀態
    clearFieldError(field);
  };

  /**
   * 處理位置資料變更
   */
  const handleLocationChange = useCallback((locationData: LocationData) => {
    setFormData(prev => ({
      ...prev,
      location: locationData.address,
      locationData: locationData,
    }));

    // 清除地點欄位的錯誤狀態
    clearFieldError('location');
  }, [clearFieldError]);

  /**
   * 處理地圖錯誤
   */
  const handleMapError = useCallback((error: string) => {
    console.error('Google Maps 錯誤:', error);
    // 可以在这里添加错误处理逻辑
  }, []);

  /**
   * 處理 AI 圖片生成
   */
  const handleGenerateImage = async () => {
    try {
      setIsGeneratingImage(true);
      
      // 驗證描述
      const validation = imageGenerationService.validatePrompt(imagePrompt);
      if (!validation.isValid) {
        alert(validation.message);
        return;
      }

      // 調用 AI 圖片生成服務
      console.log('🔄 開始調用 AI 圖片生成服務...');
      const result = await imageGenerationService.generateImage(imagePrompt);
      
      console.log('📋 AI 圖片生成結果:', result);
      console.log('📋 結果類型:', typeof result);
      console.log('📋 結果內容:', JSON.stringify(result, null, 2));
      
      if (result && result.success && result.imageData) {
        console.log('✅ 圖片生成成功，設置圖片數據:', result.imageData);
        setGeneratedImageData(result.imageData);
        alert('圖片生成成功！');
      } else {
        console.error('❌ 圖片生成失敗:', result);
        const errorMessage = result?.message || '未知錯誤';
        alert(`圖片生成失敗：${errorMessage}`);
      }
    } catch (error: any) {
      console.error('AI 圖片生成失敗:', error);
      alert('圖片生成失敗，請稍後再試');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  /**
   * 使用生成的圖片
   */
  const handleUseGeneratedImage = async () => {
    if (generatedImageData) {
      try {
        setIsUploadingToAzure(true);
        
        // 如果是 URL 格式，需要下載並上傳到 Azure Blob Storage
        if (generatedImageData.startsWith('http')) {
          console.log('🔄 下載 AI 生成的圖片並上傳到 Azure Blob Storage');

          // 下載圖片
          const response = await fetch(generatedImageData);
          const blob = await response.blob();
          
          // 創建 File 對象
          const file = new File([blob], 'ai-generated-image.png', { type: 'image/png' });
          
          // 上傳到 Azure Blob Storage
          const formData = new FormData();
          formData.append('file', file);
          
          const uploadResponse = await activityService.uploadImage(formData);
          
          // 設置 Azure URL
          setFormData(prev => ({
            ...prev,
            imageUrl: uploadResponse.imageUrl
          }));
          
          alert('AI 圖片已成功上傳到 Azure Blob Storage！');
        } else {
          // Base64 格式，直接設置
          setFormData(prev => ({
            ...prev,
            imageUrl: generatedImageData
          }));
        }
        
        // 關閉對話框並重置狀態
        setAiImageDialogOpen(false);
        setImagePrompt('');
        setGeneratedImageData(null);
        
      } catch (error: any) {
        console.error('❌ 處理 AI 圖片失敗:', error);
        alert('處理 AI 圖片失敗，請稍後再試');
        
        // 清除圖片
        setFormData(prev => ({
          ...prev,
          imageUrl: ''
        }));
      } finally {
        setIsUploadingToAzure(false);
      }
    }
  };



  /**
   * 處理活動類別變更
   */
  const handleTargetAudienceChange = (
    event: React.MouseEvent<HTMLElement>,
    newTarget: string | null,
  ) => {
    if (newTarget !== null) {
      setFormData(prev => ({
        ...prev,
        targetAudience: newTarget,
      }));
    }
  };

  /**
   * 處理開始時間變更
   */
  const handleStartDateChange = (newValue: Dayjs | null) => {
    setFormData(prev => ({
      ...prev,
      startDate: newValue,
      // 自動調整結束時間為開始時間後5小時
      endDate: newValue ? newValue.add(5, 'hour') : prev.endDate,
      // 自動調整報名截止日為開始時間前3天
      signupDeadline: newValue ? newValue.subtract(3, 'day') : prev.signupDeadline
    }));

    // 清除相關欄位的錯誤狀態
    clearFieldError('startDate');
    clearFieldError('endDate');
    clearFieldError('signupDeadline');
  };

  /**
   * 處理結束時間變更
   */
  const handleEndDateChange = (newValue: Dayjs | null) => {
    setFormData(prev => ({
      ...prev,
      endDate: newValue
    }));

    // 清除錯誤狀態
    clearFieldError('endDate');
  };

  /**
   * 處理報名截止日變更
   */
  const handleSignupDeadlineChange = (newValue: Dayjs | null) => {
    setFormData(prev => ({
      ...prev,
      signupDeadline: newValue
    }));

    // 清除錯誤狀態
    clearFieldError('signupDeadline');
  };

  /**
   * 快速設定人數
   */
  const handleQuickSetParticipants = (count: number) => {
    setFormData(prev => ({
      ...prev,
      maxParticipants: count
    }));

    // 清除錯誤狀態
    clearFieldError('maxParticipants');
  };

  /**
   * 處理圖片上傳到 Azure Blob Storage
   */
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('📁 選擇的檔案:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      // 驗證檔案類型
      if (!file.type.startsWith('image/')) {
        alert('請選擇圖片檔案');
        return;
      }

      // 驗證檔案大小 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('圖片檔案大小不能超過 5MB');
        return;
      }

      try {
        console.log('🚀 開始上傳圖片到 Azure Blob Storage');
        
        // 顯示上傳中狀態
        setFormData(prev => ({
          ...prev,
          imageUrl: 'uploading...'
        }));

        // 上傳到 Azure Blob Storage
        const formData = new FormData();
        formData.append('file', file);

        console.log('📦 FormData 準備完成，開始呼叫 API');
        const response = await activityService.uploadImage(formData);
        
        console.log('✅ 圖片上傳成功:', response);
        
        // 設定 Azure URL
        setFormData(prev => ({
          ...prev,
          imageUrl: response.imageUrl
        }));

        alert('圖片上傳成功！');
      } catch (error: any) {
        console.error('❌ 圖片上傳失敗:', error);
        
        // 顯示詳細錯誤訊息
        let errorMessage = '圖片上傳失敗：';
        if (error.message) {
          errorMessage += error.message;
        } else if (error.response?.data?.message) {
          errorMessage += error.response.data.message;
        } else {
          errorMessage += '未知錯誤，請檢查網路連線和後端服務';
        }
        
        console.log('🔍 完整錯誤物件:', error);
        alert(errorMessage);
        
        // 清除圖片
        setFormData(prev => ({
          ...prev,
          imageUrl: ''
        }));
      }
    }
  };

  /**
   * 移除圖片
   */
  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      imageUrl: ''
    }));
  };

  /**
   * 處理表單提交
   */
  const handleSubmit = async () => {
    try {
      // 完整表單驗證
      const requiredFields = [
        'activityName',
        'location', 
        'maxParticipants',
        'category',
        'description',
        'startDate',
        'endDate',
        'signupDeadline'
      ];

      let hasError = false;
      const newFieldErrors: { [key: string]: boolean } = {};
      const newFieldErrorMessages: { [key: string]: string } = {};

      // 驗證所有必填欄位
      requiredFields.forEach(field => {
        const value = formData[field as keyof ActivityFormData];
        const { isValid, errorMessage } = validateField(field, value);
        
        if (!isValid) {
          hasError = true;
          newFieldErrors[field] = true;
          newFieldErrorMessages[field] = errorMessage;
        }
      });

      // 如果有錯誤，更新錯誤狀態並返回
      if (hasError) {
        setFieldErrors(newFieldErrors);
        setFieldErrorMessages(newFieldErrorMessages);
        return;
      }

      // 準備提交資料 (移除workerId，後端會從JWT Token取得)
      const { workerId, ...dataWithoutWorkerId } = formData;
      const submitData = {
        ...dataWithoutWorkerId,
        // 如果有 locationData，使用 placeName 作為 location，formattedAddress 作為 address
        location: formData.locationData?.placeName || formData.location,
        address: formData.locationData?.formattedAddress || '',
        startDate: formData.startDate?.toISOString() || '',
        endDate: formData.endDate?.toISOString() || '',
        signupDeadline: formData.signupDeadline?.toISOString() || '',
      };

      // 呼叫 API
      await activityService.createActivity(submitData);

      // 成功提示
      alert('活動建立成功！');

      // 重置表單
      setFormData({
        activityName: '',
        description: '',
        imageUrl: '',
        location: '',
        locationData: undefined,
        maxParticipants: 0,
        startDate: dayjs().add(7, 'day').hour(12).minute(0),
        endDate: dayjs().add(7, 'day').hour(17).minute(0),
        signupDeadline: dayjs().add(4, 'day').hour(12).minute(0),
        workerId: user?.workerId || 0,
        targetAudience: 'case',
        category: '',
        status: 'open',
      });

      // 呼叫回調函數
      if (onSubmit) {
        onSubmit(formData);
      }

    } catch (error: any) {
      console.error('建立活動失敗:', error);
      
      // 根據錯誤類型顯示不同的錯誤訊息
      let errorMessage = '建立活動失敗，請稍後再試';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = '認證失敗，請重新登入';
      } else if (error.response?.status === 403) {
        errorMessage = '權限不足，無法建立活動';
      } else if (error.response?.status === 500) {
        errorMessage = '伺服器錯誤，請稍後再試';
      }
      
      alert(errorMessage);
      
      // 如果是認證錯誤，不需要額外處理，因為 activityService 已經處理了
    }
  };

  /**
   * 處理取消
   */
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-tw">
      <Paper sx={{ 
        ...commonStyles.formSection, 
        width: '100%', 
        p: getResponsiveSpacing('lg'), 
        position: 'relative',
        borderLeft: `4px solid ${dynamicColors.primary}`,
        backgroundColor: `${dynamicColors.primaryTransparent}`,
        transition: 'all 0.3s ease',
      }}>
        {/* 表單標題區域 */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'flex-start' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 },
          mb: 3
        }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ 
              ...commonStyles.formHeader,
              ...theme.customTypography?.cardTitle,
              mb: 1,
              color: dynamicColors.primaryDark
            }}>
              新增活動 - {formData.targetAudience === 'case' ? '個案活動' : '民眾活動'}
            </Typography>
            
            <Typography variant="body2" sx={{ 
              color: THEME_COLORS.TEXT_MUTED,
              ...theme.customTypography?.legendLabel
            }}>
              請輸入各欄位及參加人數，系統預設為{formData.targetAudience === 'case' ? '個案活動模式' : '民眾活動模式'}
            </Typography>
          </Box>

          {/* 右上角：活動類別 Toggle Button */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'flex-start', sm: 'flex-end' },
            minWidth: 'max-content'
          }}>
            <Typography variant="body2" sx={{ 
              ...commonStyles.formLabel,
              mb: 1,
              fontSize: '0.875rem',
              color: THEME_COLORS.TEXT_SECONDARY
            }}>
              活動類別 *
            </Typography>
            <ToggleButtonGroup
              value={formData.targetAudience}
              exclusive
              onChange={handleTargetAudienceChange}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  px: { xs: 1.5, sm: 2 },
                  py: 1,
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  borderColor: THEME_COLORS.BORDER_LIGHT,
                  color: THEME_COLORS.TEXT_SECONDARY,
                  '&.Mui-selected': {
                    backgroundColor: dynamicColors.primary,
                    color: 'white',
                    '&:hover': {
                      backgroundColor: dynamicColors.primaryHover,
                    },
                  },
                  '&:hover': {
                    backgroundColor: dynamicColors.primaryLightBg,
                  },
                },
              }}
            >
              <ToggleButton value="public" aria-label="民眾活動">
                <People sx={{ mr: 0.5, fontSize: { xs: 16, sm: 18 } }} />
                民眾
              </ToggleButton>
              <ToggleButton value="case" aria-label="個案活動">
                <Person sx={{ mr: 0.5, fontSize: { xs: 16, sm: 18 } }} />
                個案
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: getResponsiveSpacing('md') 
        }}>
          {/* 第一行：活動名稱 */}
          <TextField
            label="活動名稱 *"
            value={formData.activityName}
            onChange={(e) => handleInputChange('activityName', e.target.value)}
            onBlur={(e) => handleFieldBlur('activityName', e.target.value)}
            fullWidth
            placeholder="雜貨旅遊 x 台積電二手作甜點體驗營"
            required
            error={fieldErrors.activityName}
            helperText={fieldErrorMessages.activityName}
            sx={{
              ...dynamicInputStyles,
              ...(fieldErrors.activityName && {
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: THEME_COLORS.ERROR },
                  '&:hover fieldset': { borderColor: THEME_COLORS.ERROR_DARK },
                  '&.Mui-focused fieldset': { borderColor: THEME_COLORS.ERROR },
                },
              }),
            }}
          />

          {/* 第二行：活動開始和結束時間 */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: 2
          }}>
            <Typography variant="body2" sx={{ 
              color: THEME_COLORS.TEXT_SECONDARY,
              fontStyle: 'italic'
            }}>
              💡 開始時間預設為七天後中午12點，結束時間會自動設為開始時間後5小時
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              gap: getResponsiveSpacing('md'), 
              flexDirection: { xs: 'column', sm: 'row' } 
            }}>
              <DateTimePicker
                label="活動開始時間 *"
                value={formData.startDate}
                onChange={handleStartDateChange}
                onAccept={(value) => handleFieldBlur('startDate', value)}
                format="YYYY/MM/DD HH:mm"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: fieldErrors.startDate,
                    helperText: fieldErrorMessages.startDate,
                    sx: { 
                      ...dynamicDatePickerStyles,
                      flex: 1,
                      ...(fieldErrors.startDate && {
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: THEME_COLORS.ERROR },
                          '&:hover fieldset': { borderColor: THEME_COLORS.ERROR_DARK },
                          '&.Mui-focused fieldset': { borderColor: THEME_COLORS.ERROR },
                        },
                      }),
                    }
                  }
                }}
              />
              <DateTimePicker
                label="活動結束時間 *"
                value={formData.endDate}
                onChange={handleEndDateChange}
                onAccept={(value) => handleFieldBlur('endDate', value)}
                format="YYYY/MM/DD HH:mm"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: fieldErrors.endDate,
                    helperText: fieldErrorMessages.endDate,
                    sx: { 
                      ...dynamicDatePickerStyles,
                      flex: 1,
                      ...(fieldErrors.endDate && {
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: THEME_COLORS.ERROR },
                          '&:hover fieldset': { borderColor: THEME_COLORS.ERROR_DARK },
                          '&.Mui-focused fieldset': { borderColor: THEME_COLORS.ERROR },
                        },
                      }),
                    }
                  }
                }}
              />
            </Box>
          </Box>

          {/* 第三行：報名截止日 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" sx={{ 
              color: THEME_COLORS.TEXT_SECONDARY,
              fontStyle: 'italic'
            }}>
              💡 報名截止日會自動設為開始時間前3天（四天後中午12點）
            </Typography>
            <DateTimePicker
              label="報名截止日 *"
              value={formData.signupDeadline}
              onChange={handleSignupDeadlineChange}
              onAccept={(value) => handleFieldBlur('signupDeadline', value)}
              format="YYYY/MM/DD HH:mm"
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  error: fieldErrors.signupDeadline,
                  helperText: fieldErrorMessages.signupDeadline,
                  sx: {
                    ...dynamicDatePickerStyles,
                    ...(fieldErrors.signupDeadline && {
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: THEME_COLORS.ERROR },
                        '&:hover fieldset': { borderColor: THEME_COLORS.ERROR_DARK },
                        '&.Mui-focused fieldset': { borderColor: THEME_COLORS.ERROR },
                      },
                    }),
                  },
                  placeholder: "設定報名截止的日期和時間"
                }
              }}
            />
          </Box>

          {/* 第四行：地點 */}
          <Box>
            <Typography variant="body2" sx={{ 
              color: 'text.secondary',
              fontWeight: 500,
              mb: 1
            }}>
              活動地點 *
            </Typography>
            <GoogleMapSelector
              key="google-map-selector"
              value={formData.locationData}
              onChange={handleLocationChange}
              onError={handleMapError}
              disabled={false}
              placeholder="輸入地址搜尋位置..."
              label="活動地點"
            />
            {fieldErrors.location && (
              <Typography variant="caption" sx={{ color: THEME_COLORS.ERROR, mt: 0.5, ml: 1.5 }}>
                {fieldErrorMessages.location}
              </Typography>
            )}
          </Box>

          {/* 第五行：人數需求 */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: 2
          }}>
            <TextField
              label="需求活動人數 *"
              type="number"
              value={formData.maxParticipants}
              onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value) || 0)}
              onBlur={(e) => handleFieldBlur('maxParticipants', parseInt(e.target.value) || 0)}
              sx={{ 
                ...dynamicInputStyles,
                ...(fieldErrors.maxParticipants && {
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: THEME_COLORS.ERROR },
                    '&:hover fieldset': { borderColor: THEME_COLORS.ERROR_DARK },
                    '&.Mui-focused fieldset': { borderColor: THEME_COLORS.ERROR },
                  },
                }),
              }}
              placeholder="請輸入需求人數"
              error={fieldErrors.maxParticipants}
              helperText={fieldErrorMessages.maxParticipants}
              InputProps={{
                inputProps: { min: 1, max: 1000 }
              }}
            />
            
            {/* 快速人數選擇按鈕 */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ 
                color: THEME_COLORS.TEXT_SECONDARY,
                display: 'flex',
                alignItems: 'center',
                mr: 1
              }}>
                快速選擇：
              </Typography>
              {[5, 10, 15, 20].map((count) => (
                <Button
                  key={count}
                  size="small"
                  variant={formData.maxParticipants === count ? "contained" : "outlined"}
                  onClick={() => handleQuickSetParticipants(count)}
                  sx={{
                    minWidth: 40,
                    height: 32,
                    fontSize: '0.875rem',
                    ...(formData.maxParticipants === count ? {
                      bgcolor: dynamicColors.primary,
                      color: 'white',
                      '&:hover': {
                        bgcolor: dynamicColors.primaryHover,
                      }
                    } : {
                      borderColor: THEME_COLORS.BORDER_DEFAULT,
                      color: THEME_COLORS.TEXT_SECONDARY,
                      '&:hover': {
                        borderColor: dynamicColors.primary,
                        backgroundColor: dynamicColors.primaryLightBg,
                        color: dynamicColors.primary,
                      }
                    })
                  }}
                >
                  {count}
                </Button>
              ))}
            </Box>
          </Box>

          {/* 第六行：活動分類 */}
          <FormControl 
            fullWidth 
            error={fieldErrors.category}
            sx={{
              ...dynamicInputStyles,
              ...(fieldErrors.category && {
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: THEME_COLORS.ERROR },
                  '&:hover fieldset': { borderColor: THEME_COLORS.ERROR_DARK },
                  '&.Mui-focused fieldset': { borderColor: THEME_COLORS.ERROR },
                },
              }),
            }}
          >
            <InputLabel id="category-label">活動分類 *</InputLabel>
            <Select
              labelId="category-label"
              value={formData.category}
              label="活動分類 *"
              onChange={(e) => handleInputChange('category', e.target.value)}
              onBlur={() => handleFieldBlur('category', formData.category)}
              sx={{
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: fieldErrors.category ? THEME_COLORS.ERROR : dynamicColors.primary,
                },
              }}
            >
              <MenuItem value="">
                <em>請選擇活動分類</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.value} value={category.value}>
                  {category.label}
                </MenuItem>
              ))}
            </Select>
            {fieldErrors.category && (
              <Typography variant="caption" sx={{ color: THEME_COLORS.ERROR, mt: 0.5, ml: 1.5 }}>
                {fieldErrorMessages.category}
              </Typography>
            )}
          </FormControl>

          {/* 第七行：活動圖片上傳 */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ 
                ...commonStyles.formLabel 
              }}>
                活動圖片
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant={getButtonVariant('upload')}
                  startIcon={<AutoAwesome />}
                  onClick={() => setAiImageDialogOpen(true)}
                  sx={{ 
                    ...getButtonStyle('upload'),
                    fontSize: '0.75rem', 
                    py: 0.5,
                    borderColor: dynamicColors.primary,
                    color: dynamicColors.primary,
                    '&:hover': {
                      borderColor: dynamicColors.primaryHover,
                      bgcolor: dynamicColors.primaryLightBg,
                    }
                  }}
                >
                  AI 生成
                </Button>
              </Box>
            </Box>
            <Box sx={{ 
              border: `2px dashed ${THEME_COLORS.BORDER_DASHED}`, 
              borderRadius: 2, 
              p: getResponsiveSpacing('md').md,
              textAlign: 'center',
              bgcolor: THEME_COLORS.BACKGROUND_UPLOAD,
              position: 'relative'
            }}>
              {formData.imageUrl ? (
                <Box sx={{ position: 'relative' }}>
                  {formData.imageUrl === 'uploading...' ? (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      p: 3 
                    }}>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        圖片上傳中...
                      </Typography>
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        border: '3px solid #f3f3f3',
                        borderTop: `3px solid ${dynamicColors.primary}`,
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        '@keyframes spin': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' }
                        }
                      }} />
                    </Box>
                  ) : (
                    <>
                      <Box 
                        component="img"
                        src={formData.imageUrl}
                        alt="活動圖片預覽"
                        sx={{
                          maxWidth: '100%',
                          maxHeight: 300,
                          borderRadius: 1,
                          boxShadow: theme.shadows[1]
                        }}
                      />
                      <IconButton
                        onClick={handleRemoveImage}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: THEME_COLORS.OVERLAY_DARK,
                          color: 'white',
                          '&:hover': {
                            bgcolor: THEME_COLORS.OVERLAY_DARK_HOVER,
                          }
                        }}
                        size="small"
                      >
                        <Cancel />
                      </IconButton>
                    </>
                  )}
                </Box>
              ) : (
                <Box>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant={getButtonVariant('upload')}
                      component="span"
                      sx={{
                        ...getButtonStyle('upload'),
                        borderColor: dynamicColors.primary,
                        color: dynamicColors.primary,
                        '&:hover': {
                          borderColor: dynamicColors.primaryHover,
                          bgcolor: dynamicColors.primaryLightBg,
                        }
                      }}
                    >
                      選擇圖片
                    </Button>
                  </label>
                  <Typography variant="body2" sx={{ 
                    mt: 1, 
                    color: THEME_COLORS.TEXT_MUTED 
                  }}>
                    支援 JPG、PNG 格式，檔案大小請勿超過 5MB
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* 第七行：活動描述 */}
          <Box>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 1
            }}>
              <Typography variant="body2" sx={{ 
                color: 'text.secondary',
                fontWeight: 500
              }}>
                活動描述 *
              </Typography>
              <AIOptimizeButton
                description={formData.description}
                onOptimized={(optimizedText) => handleInputChange('description', optimizedText)}
                size="small"
              />
            </Box>
            <TextField
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              onBlur={(e) => handleFieldBlur('description', e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="請詳細描述活動內容..."
              required
              error={fieldErrors.description}
              helperText={fieldErrorMessages.description}
              sx={{
                ...dynamicInputStyles,
                ...(fieldErrors.description && {
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: THEME_COLORS.ERROR },
                    '&:hover fieldset': { borderColor: THEME_COLORS.ERROR_DARK },
                    '&.Mui-focused fieldset': { borderColor: THEME_COLORS.ERROR },
                  },
                }),
              }}
            />
          </Box>
        </Box>

        {/* 儲存按鈕 */}
        <Box sx={{ 
          mt: getResponsiveSpacing('lg').md, 
          display: 'flex', 
          gap: getResponsiveSpacing('md'), 
          justifyContent: 'flex-end' 
        }}>
          <Button
            variant={getButtonVariant('secondary')}
            onClick={handleCancel}
            sx={{
              ...getButtonStyle('secondary'),
            }}
          >
            取消
          </Button>
          <Button
            variant={getButtonVariant('primary')}
            onClick={handleSubmit}
            sx={{
              ...getButtonStyle('primary'),
              backgroundColor: dynamicColors.primary,
              '&:hover': {
                backgroundColor: dynamicColors.primaryHover,
              },
            }}
          >
            儲存活動
          </Button>
        </Box>
      </Paper>

      {/* AI 圖片生成對話框 */}
      <Dialog 
        open={aiImageDialogOpen} 
        onClose={() => setAiImageDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{
          background: `linear-gradient(135deg, ${dynamicColors.primary}15, ${dynamicColors.primary}25)`,
          borderBottom: `2px solid ${dynamicColors.primary}30`,
          py: 2,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${dynamicColors.primary}, ${dynamicColors.primary}80)`,
              boxShadow: `0 2px 8px ${dynamicColors.primary}40`
            }}>
              <AutoAwesome sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                color: dynamicColors.primary,
                lineHeight: 1.2
              }}>
                AI 圖片生成
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'text.secondary',
                display: 'block',
                mt: 0.5
              }}>
                使用 AI 技術生成活動圖片
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={() => setAiImageDialogOpen(false)}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: `${dynamicColors.primary}15`,
                color: dynamicColors.primary
              }
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            請描述您想要的活動圖片，AI 將為您生成符合描述的圖片。
          </DialogContentText>
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label="圖片描述"
            placeholder="例如：一個溫馨的活動場景，人們圍坐在一起聊天，背景是溫暖的陽光..."
            value={imagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
            sx={{ mb: 2 }}
          />

          {generatedImageData && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                生成的圖片預覽：
              </Typography>
              <Box
                component="img"
                src={generatedImageData}
                alt="AI 生成的圖片"
                onError={(e) => {
                  console.error('圖片載入失敗:', e);
                  alert('圖片載入失敗，請重試');
                }}
                onLoad={() => {
                  console.log('圖片載入成功:', generatedImageData);
                }}
                sx={{
                  maxWidth: '100%',
                  maxHeight: 200,
                  borderRadius: 1,
                  border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
                }}
              />
              <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
                圖片來源: {generatedImageData.startsWith('http') ? 'Azure OpenAI' : 'Base64'}
              </Typography>
            </Box>
          )}

          {isGeneratingImage && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              <Typography variant="body2">
                正在生成圖片...（AI 圖片生成需要 10-30 秒，請耐心等待）
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setAiImageDialogOpen(false)}
            variant={getButtonVariant('secondary')}
            sx={{
              ...getButtonStyle('secondary'),
            }}
          >
            取消
          </Button>
          {!generatedImageData && (
            <Button 
              onClick={handleGenerateImage}
              disabled={isGeneratingImage || !imagePrompt.trim()}
              variant={getButtonVariant('primary')}
              startIcon={<AutoAwesome />}
              sx={{
                ...getButtonStyle('primary'),
                bgcolor: dynamicColors.primary,
                '&:hover': {
                  bgcolor: dynamicColors.primaryHover,
                }
              }}
            >
              生成圖片
            </Button>
          )}
          {generatedImageData && (
            <Button 
              onClick={handleUseGeneratedImage}
              disabled={isUploadingToAzure}
              variant={getButtonVariant('primary')}
              startIcon={isUploadingToAzure ? <CircularProgress size={16} color="inherit" /> : undefined}
              sx={{
                ...getButtonStyle('primary'),
                bgcolor: dynamicColors.primary,
                '&:hover': {
                  bgcolor: dynamicColors.primaryHover,
                },
                '&:disabled': {
                  bgcolor: `${dynamicColors.primary}80`,
                  color: 'white',
                }
              }}
            >
              {isUploadingToAzure ? '上傳中...' : '使用此圖片'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default NewActivityForm; 