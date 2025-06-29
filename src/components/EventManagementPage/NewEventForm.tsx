import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  useTheme,
  Select,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  Alert,
} from '@mui/material';
import { Cancel, PhotoCamera, Event, Group, LocationOn, AccessTime, Description, Person } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-tw'; // 中文本地化
import { THEME_COLORS } from '../../styles/theme';
import { commonStyles, getResponsiveSpacing } from '../../styles/commonStyles';

// 設置 dayjs 為中文
dayjs.locale('zh-tw');

/**
 * 活動表單資料介面
 */
interface EventFormData {
  name: string;
  location: string;
  volunteerCount: number;
  participantCount: number;
  shortDescription: string;
  detailDescription: string;
  startDateTime: Dayjs | null;
  endDateTime: Dayjs | null;
  registrationDeadline: Dayjs | null;
  image: File | null;
  imagePreview: string | null;
}

/**
 * 新增活動表單組件 Props
 */
interface NewEventFormProps {
  onSubmit?: (data: EventFormData) => void;
  onCancel?: () => void;
}

/**
 * 新增活動表單組件 (NewEventForm)
 * 
 * 主要功能：
 * 1. 活動基本資訊輸入（名稱、日期、時間、地點）
 * 2. 人數需求設定（志工人數、個案人數）
 * 3. 活動圖片上傳和預覽
 * 4. 活動描述輸入（簡述和詳細說明）
 * 5. 表單驗證和提交
 * 
 * 特色功能：
 * - 響應式設計，支援桌面和手機
 * - 圖片上傳和即時預覽
 * - 檔案大小和類型驗證
 * - 綠色主題與 NGO 品牌一致
 * - 完整的錯誤處理
 */
const NewEventForm: React.FC<NewEventFormProps> = ({ onSubmit, onCancel }) => {
  const theme = useTheme();

  // 表單資料狀態
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    location: '',
    volunteerCount: 0,
    participantCount: 0,
    shortDescription: '',
    detailDescription: '',
    startDateTime: dayjs(),
    endDateTime: dayjs().add(2, 'hour'), // 預設活動為2小時
    registrationDeadline: dayjs().subtract(1, 'day'), // 預設報名截止日為活動前一天
    image: null,
    imagePreview: null,
  });

  /**
   * 處理表單欄位變更
   */
  const handleInputChange = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * 處理開始時間變更
   */
  const handleStartDateTimeChange = (newValue: Dayjs | null) => {
    setFormData(prev => ({
      ...prev,
      startDateTime: newValue,
      // 如果結束時間早於開始時間，自動調整結束時間為開始時間後2小時
      endDateTime: newValue && prev.endDateTime && prev.endDateTime.isBefore(newValue) 
        ? newValue.add(2, 'hour') 
        : prev.endDateTime
    }));
  };

  /**
   * 處理結束時間變更
   */
  const handleEndDateTimeChange = (newValue: Dayjs | null) => {
    setFormData(prev => ({
      ...prev,
      endDateTime: newValue
    }));
  };

  /**
   * 處理報名截止日變更
   */
  const handleRegistrationDeadlineChange = (newValue: Dayjs | null) => {
    setFormData(prev => ({
      ...prev,
      registrationDeadline: newValue
    }));
  };

  /**
   * 處理圖片上傳
   */
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 檢查檔案大小 (限制 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('圖片檔案大小不能超過 5MB');
        return;
      }

      // 檢查檔案類型
      if (!file.type.startsWith('image/')) {
        alert('請選擇圖片檔案');
        return;
      }

      // 創建預覽 URL
      const previewUrl = URL.createObjectURL(file);
      
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: previewUrl
      }));
    }
  };

  /**
   * 移除圖片
   */
  const handleRemoveImage = () => {
    if (formData.imagePreview) {
      URL.revokeObjectURL(formData.imagePreview);
    }
    setFormData(prev => ({
      ...prev,
      image: null,
      imagePreview: null
    }));
  };

  /**
   * 處理表單提交
   */
  const handleSubmit = () => {
    // 基本驗證
    if (!formData.name.trim()) {
      alert('請輸入活動名稱');
      return;
    }

    if (!formData.startDateTime) {
      alert('請選擇活動開始時間');
      return;
    }

    if (!formData.endDateTime) {
      alert('請選擇活動結束時間');
      return;
    }

    if (!formData.registrationDeadline) {
      alert('請選擇報名截止日');
      return;
    }

    // 驗證結束時間是否晚於開始時間
    if (formData.endDateTime.isBefore(formData.startDateTime)) {
      alert('活動結束時間必須晚於開始時間');
      return;
    }

    // 驗證報名截止日是否早於活動開始時間
    if (formData.registrationDeadline.isAfter(formData.startDateTime)) {
      alert('報名截止日必須早於活動開始時間');
      return;
    }

    // 驗證活動時間長度（不能超過24小時）
    const durationHours = formData.endDateTime.diff(formData.startDateTime, 'hour');
    if (durationHours > 24) {
      alert('活動時間長度不能超過24小時');
      return;
    }

    if (!formData.location.trim()) {
      alert('請輸入活動地點');
      return;
    }

    if (!formData.shortDescription.trim()) {
      alert('請輸入活動簡述');
      return;
    }

    // 調用父組件的提交函數
    onSubmit?.(formData);
  };

  /**
   * 處理取消
   */
  const handleCancel = () => {
    // 清理圖片預覽 URL
    if (formData.imagePreview) {
      URL.revokeObjectURL(formData.imagePreview);
    }
    
    onCancel?.();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-tw">
      <Paper sx={{ ...commonStyles.formSection, width: '100%', p: getResponsiveSpacing('lg') }}>
        <Typography variant="h5" sx={{ 
          ...commonStyles.formHeader,
          ...commonStyles.spacing.section,
          ...theme.customTypography?.cardTitle
        }}>
          新增活動
        </Typography>
        
        <Typography variant="body2" sx={{ 
          ...commonStyles.spacing.section,
          color: THEME_COLORS.TEXT_MUTED,
          ...theme.customTypography?.legendLabel
        }}>
          請輸入各欄位及參加人數
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: getResponsiveSpacing('md') 
        }}>
          {/* 第一行：活動名稱 */}
          <TextField
            label="活動名稱 *"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            fullWidth
            placeholder="雜貨旅遊 x 台積電二手作甜點體驗營"
            required
            sx={{ ...commonStyles.formInput }}
          />

          {/* 第二行：活動開始和結束時間 */}
          <Box sx={{ 
            display: 'flex', 
            gap: getResponsiveSpacing('md'), 
            flexDirection: { xs: 'column', sm: 'row' } 
          }}>
            <DateTimePicker
              label="活動開始時間 *"
              value={formData.startDateTime}
              onChange={handleStartDateTimeChange}
              format="YYYY/MM/DD HH:mm"
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  sx: { 
                    ...commonStyles.formDatePicker,
                    flex: 1 
                  }
                }
              }}
            />
            <DateTimePicker
              label="活動結束時間 *"
              value={formData.endDateTime}
              onChange={handleEndDateTimeChange}
              format="YYYY/MM/DD HH:mm"
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  sx: { 
                    ...commonStyles.formDatePicker,
                    flex: 1 
                  }
                }
              }}
            />
          </Box>

          {/* 第三行：報名截止日 */}
          <DateTimePicker
            label="報名截止日 *"
            value={formData.registrationDeadline}
            onChange={handleRegistrationDeadlineChange}
            format="YYYY/MM/DD HH:mm"
            slotProps={{
              textField: {
                fullWidth: true,
                required: true,
                sx: { 
                  ...commonStyles.formDatePicker
                },
                placeholder: "設定報名截止的日期和時間"
              }
            }}
          />

          {/* 第四行：地點 */}
          <TextField
            label="活動地點 *"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            fullWidth
            placeholder="請輸入活動地點，例如：NGO基地 (台北市南港區忠孝東路六段488號)"
            required
            sx={{ ...commonStyles.formInput }}
          />

          {/* 第五行：人數需求 */}
          <Box sx={{ 
            display: 'flex', 
            gap: getResponsiveSpacing('md'), 
            flexDirection: { xs: 'column', sm: 'row' } 
          }}>
            <TextField
              label="需求志工人數"
              type="number"
              value={formData.volunteerCount}
              onChange={(e) => handleInputChange('volunteerCount', parseInt(e.target.value) || 0)}
              sx={{ 
                ...commonStyles.formInput,
                flex: 1 
              }}
              placeholder="請輸入需求志工人數"
              InputProps={{
                inputProps: { min: 0, max: 100 }
              }}
            />

            <TextField
              label="需求個案人數"
              type="number"
              value={formData.participantCount}
              onChange={(e) => handleInputChange('participantCount', parseInt(e.target.value) || 0)}
              sx={{ 
                ...commonStyles.formInput,
                flex: 1 
              }}
              placeholder="請輸入需求個案人數"
              InputProps={{
                inputProps: { min: 0, max: 100 }
              }}
            />
          </Box>

          {/* 第六行：活動圖片上傳 */}
          <Box>
            <Typography variant="body2" sx={{ 
              ...commonStyles.formLabel 
            }}>
              活動圖片
            </Typography>
            <Box sx={{ 
              border: `2px dashed ${THEME_COLORS.BORDER_DASHED}`, 
              borderRadius: 2, 
              p: getResponsiveSpacing('md').md,
              textAlign: 'center',
              bgcolor: THEME_COLORS.BACKGROUND_UPLOAD,
              position: 'relative'
            }}>
              {formData.imagePreview ? (
                <Box sx={{ position: 'relative' }}>
                  <Box 
                    component="img"
                    src={formData.imagePreview}
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
                      variant="outlined"
                      component="span"
                      sx={{
                        borderColor: THEME_COLORS.PRIMARY,
                        color: THEME_COLORS.PRIMARY,
                        '&:hover': {
                          borderColor: THEME_COLORS.PRIMARY_DARK,
                          bgcolor: THEME_COLORS.PRIMARY_LIGHT_BG,
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

          {/* 第七行：活動簡述 */}
          <TextField
            label="活動簡述 *"
            value={formData.shortDescription}
            onChange={(e) => handleInputChange('shortDescription', e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder="請簡單描述活動內容..."
            required
            sx={{ ...commonStyles.formInput }}
          />
        </Box>

        {/* 儲存按鈕 */}
        <Box sx={{ 
          mt: getResponsiveSpacing('lg').md, 
          display: 'flex', 
          gap: getResponsiveSpacing('md'), 
          justifyContent: 'flex-end' 
        }}>
          <Button
            variant="outlined"
            onClick={handleCancel}
            sx={{
              ...commonStyles.secondaryButton,
              px: 4,
              py: 1.5,
            }}
          >
            取消
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              ...commonStyles.primaryButton,
              px: 4,
              py: 1.5,
            }}
          >
            儲存活動
          </Button>
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};

export default NewEventForm;
export type { EventFormData }; 