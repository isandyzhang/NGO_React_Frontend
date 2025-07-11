import React, { useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  Typography,
  Chip,
  Alert,
  FormControlLabel,
  Checkbox,
  Divider,
  Autocomplete,
} from '@mui/material';
import { Add, Event, Person, Business, School, PersonAdd, Home, Phone, LocationOn } from '@mui/icons-material';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { THEME_COLORS } from '../../styles/theme';
import { commonStyles, getResponsiveSpacing } from '../../styles/commonStyles';
import { CalendarEvent } from '../../services/scheduleService';

// 配置中文本地化
const locales = {
  'zh-TW': zhTW,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// 事件類型配置 - 使用主題顏色
const eventTypes = {
  activity: { label: '活動', color: THEME_COLORS.PRIMARY, icon: Event },
  meeting: { label: '會議', color: THEME_COLORS.INFO, icon: Business },
  'case-visit': { label: '個案訪問', color: THEME_COLORS.WARNING, icon: Person },
  training: { label: '培訓', color: THEME_COLORS.PRIMARY_LIGHT, icon: School },
  other: { label: '其他', color: THEME_COLORS.TEXT_MUTED, icon: Event },
};

// 模擬個案資料庫（與物資管理頁面共用）
const mockCaseDatabase = [
  { id: 'C001', name: '張小明', phone: '0912-345-678', address: '台北市信義區信義路100號', status: '追蹤中' },
  { id: 'C002', name: '李美華', phone: '0923-456-789', address: '台北市中山區中山北路200號', status: '結案' },
  { id: 'C003', name: '王大同', phone: '0934-567-890', address: '新北市板橋區文化路50號', status: '追蹤中' },
  { id: 'C004', name: '陳雅婷', phone: '0945-678-901', address: '桃園市桃園區中正路300號', status: '新案' },
  { id: 'C005', name: '林建志', phone: '0956-789-012', address: '台中市西屯區台灣大道400號', status: '追蹤中' },
  { id: 'C006', name: '黃淑芬', phone: '0967-890-123', address: '高雄市前金區中正四路500號', status: '結案' },
];

// 新增事件表單資料
interface NewEventForm {
  title: string;
  start: string;
  end: string;
  startTime: string;
  endTime: string;
  type: CalendarEvent['type'];
  description: string;
  // 個案訪問相關欄位
  caseId: string;
  isNewCase: boolean;
  newCaseName: string;
  newCasePhone: string;
  newCaseAddress: string;
}

interface CalendarComponentProps {
  events?: CalendarEvent[];
  onEventCreate?: (event: Omit<CalendarEvent, 'id'>) => void;
  onEventUpdate?: (event: CalendarEvent) => void;
  onEventDelete?: (eventId: string) => void;
}

/**
 * 行事曆組件 (CalendarComponent)
 * 
 * 主要功能：
 * 1. 月/週/日視圖切換
 * 2. 新增事件（手動輸入）
 * 3. 事件類型分類和視覺區分
 * 4. 事件詳細資訊查看
 * 5. 事件編輯和刪除
 * 6. 中文本地化顯示
 * 7. 個案訪問特殊功能：個案ID、新個案創建、物資需求提醒
 */
const CalendarComponent: React.FC<CalendarComponentProps> = ({
  events = [],
  onEventCreate,
  onEventUpdate,
  onEventDelete,
}) => {
  const theme = useTheme();
  
  // 對話框狀態
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // 表單資料
  const [formData, setFormData] = useState<NewEventForm>({
    title: '',
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    type: 'other',
    description: '',
    caseId: '',
    isNewCase: false,
    newCaseName: '',
    newCasePhone: '',
    newCaseAddress: '',
  });

  // 日曆視圖狀態
  const [currentView, setCurrentView] = useState<View>('month');

  /**
   * 重置表單
   */
  const resetForm = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      title: '',
      start: today,
      end: today,
      startTime: '09:00',
      endTime: '10:00',
      type: 'other',
      description: '',
      caseId: '',
      isNewCase: false,
      newCaseName: '',
      newCasePhone: '',
      newCaseAddress: '',
    });
    setSelectedEvent(null);
    setIsEditMode(false);
  }, []);

  /**
   * 開啟新增事件對話框
   */
  const handleAddEvent = useCallback((slotInfo?: { start: Date; end: Date }) => {
    resetForm();
    if (slotInfo) {
      const startDate = slotInfo.start.toISOString().split('T')[0];
      const endDate = slotInfo.end.toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        start: startDate,
        end: endDate,
      }));
    }
    setIsDialogOpen(true);
  }, [resetForm]);

  /**
   * 點擊事件處理
   */
  const handleEventClick = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      start: event.start.toISOString().split('T')[0],
      end: event.end.toISOString().split('T')[0],
      startTime: format(event.start, 'HH:mm'),
      endTime: format(event.end, 'HH:mm'),
      type: event.type,
      description: event.description || '',
      caseId: event.caseId || '',
      isNewCase: event.isNewCase || false,
      newCaseName: event.caseInfo?.name || '',
      newCasePhone: event.caseInfo?.phone || '',
      newCaseAddress: event.caseInfo?.address || '',
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  }, []);

  /**
   * 計算物資需求填寫截止日期（訪問後2天）
   */
  const calculateSupplyNeedsDeadline = (visitDate: Date): Date => {
    const deadline = new Date(visitDate);
    deadline.setDate(deadline.getDate() + 2);
    return deadline;
  };

  /**
   * 儲存事件
   */
  const handleSaveEvent = useCallback(() => {
    if (!formData.title.trim()) {
      alert('請輸入事件標題');
      return;
    }

    // 個案訪問特殊驗證
    if (formData.type === 'case-visit') {
      if (formData.isNewCase) {
        // 新個案驗證
        if (!formData.newCaseName.trim() || !formData.newCasePhone.trim() || !formData.newCaseAddress.trim()) {
          alert('新個案請完整填寫姓名、電話、地址');
          return;
        }
      } else {
        // 現有個案驗證
        if (!formData.caseId.trim()) {
          alert('請選擇或輸入個案ID');
          return;
        }
      }
    }

    const startDateTime = new Date(`${formData.start}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.end}T${formData.endTime}`);

    if (endDateTime <= startDateTime) {
      alert('結束時間必須晚於開始時間');
      return;
    }

    const eventData: Omit<CalendarEvent, 'id'> = {
      title: formData.title,
      start: startDateTime,
      end: endDateTime,
      type: formData.type,
      description: formData.description,
    };

    // 個案訪問特殊處理
    if (formData.type === 'case-visit') {
      if (formData.isNewCase) {
        // 新個案
        eventData.isNewCase = true;
        eventData.caseInfo = {
          name: formData.newCaseName,
          phone: formData.newCasePhone,
          address: formData.newCaseAddress,
        };
        // 生成新的個案ID
        eventData.caseId = `C${String(mockCaseDatabase.length + 1).padStart(3, '0')}`;
      } else {
        // 現有個案
        eventData.caseId = formData.caseId;
        eventData.isNewCase = false;
      }
      
      // 設置物資需求填寫截止日期
      eventData.supplyNeedsDeadline = calculateSupplyNeedsDeadline(endDateTime);
    }

    if (isEditMode && selectedEvent) {
      // 更新事件
      const updatedEvent = {
        ...selectedEvent,
        ...eventData,
      };
      onEventUpdate?.(updatedEvent);
    } else {
      // 新增事件
      onEventCreate?.(eventData);
    }

    setIsDialogOpen(false);
    resetForm();
  }, [formData, isEditMode, selectedEvent, onEventCreate, onEventUpdate, resetForm]);

  /**
   * 刪除事件
   */
  const handleDeleteEvent = useCallback(() => {
    if (selectedEvent && onEventDelete) {
      onEventDelete(selectedEvent.id);
      setIsDialogOpen(false);
      resetForm();
    }
  }, [selectedEvent, onEventDelete, resetForm]);

  /**
   * 事件樣式 - 使用主題顏色
   */
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const eventType = eventTypes[event.type];
    return {
      style: {
        backgroundColor: eventType.color,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '12px',
        padding: '2px 5px',
      },
    };
  }, []);

  // 是否顯示個案相關欄位
  const showCaseFields = formData.type === 'case-visit';

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      {/* 日曆工具欄 */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: getResponsiveSpacing('md'),
        flexWrap: 'wrap',
        gap: getResponsiveSpacing('md')
      }}>
        <Typography variant="h6" sx={{ 
          ...commonStyles.cardTitle,
          color: THEME_COLORS.TEXT_PRIMARY 
        }}>
          行事曆管理
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {/* 事件類型圖例 */}
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            flexWrap: 'wrap', 
            mr: getResponsiveSpacing('md') 
          }}>
            {Object.entries(eventTypes).map(([key, type]) => (
              <Chip
                key={key}
                label={type.label}
                size="small"
                sx={{
                  backgroundColor: type.color,
                  color: 'white !important',
                  fontSize: commonStyles.cardLabel.fontSize,
                }}
              />
            ))}
          </Box>
          
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleAddEvent()}
            sx={{
              ...commonStyles.primaryButton,
            }}
          >
            新增行程
          </Button>
        </Box>
      </Box>

      {/* 日曆主體 */}
      <Box sx={{ 
        height: 600, 
        ...commonStyles.statsCard,
        bgcolor: THEME_COLORS.BACKGROUND_CARD,
        '& .rbc-calendar': {
          fontFamily: theme.typography.fontFamily,
        },
        '& .rbc-header': {
          bgcolor: THEME_COLORS.BACKGROUND_PRIMARY,
          color: THEME_COLORS.TEXT_PRIMARY,
          fontWeight: 600,
          padding: '8px',
          borderBottom: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
        },
        '& .rbc-today': {
          bgcolor: THEME_COLORS.PRIMARY_LIGHT_BG,
        },
        '& .rbc-toolbar': {
          mb: getResponsiveSpacing('md'),
        },
        '& .rbc-toolbar button': {
          border: `1px solid ${THEME_COLORS.BORDER_DEFAULT}`,
          bgcolor: THEME_COLORS.BACKGROUND_CARD,
          color: THEME_COLORS.TEXT_SECONDARY,
          borderRadius: '6px',
          padding: '6px 12px',
          '&:hover': {
            bgcolor: THEME_COLORS.BACKGROUND_PRIMARY,
          },
          '&.rbc-active': {
            bgcolor: THEME_COLORS.PRIMARY,
            color: 'white',
            borderColor: THEME_COLORS.PRIMARY,
          },
        },
      }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectSlot={handleAddEvent}
          onSelectEvent={handleEventClick}
          eventPropGetter={eventStyleGetter}
          selectable
          popup
          view={currentView}
          onView={setCurrentView}
          messages={{
            next: '下一頁',
            previous: '上一頁',
            today: '今天',
            month: '月',
            week: '週',
            day: '日',
            agenda: '議程',
            date: '日期',
            time: '時間',
            event: '事件',
            noEventsInRange: '此期間沒有事件',
            allDay: '全天',
          }}
        />
      </Box>

      {/* 新增/編輯事件對話框 */}
      <Dialog
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          resetForm();
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          ...commonStyles.cardTitle,
          borderBottom: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
          pb: getResponsiveSpacing('md')
        }}>
          {isEditMode ? '編輯行程' : '新增行程'}
        </DialogTitle>
        
        <DialogContent sx={{ pt: getResponsiveSpacing('lg') }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: getResponsiveSpacing('lg') 
          }}>
            {/* 事件標題 */}
            <TextField
              label="事件標題 *"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              fullWidth
              placeholder="請輸入事件標題"
              sx={{ ...commonStyles.formInput }}
            />

            {/* 事件類型 */}
            <FormControl fullWidth>
              <InputLabel>事件類型</InputLabel>
              <Select
                value={formData.type}
                label="事件類型"
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  type: e.target.value as CalendarEvent['type'],
                  // 重置個案相關欄位
                  caseId: '',
                  isNewCase: false,
                  newCaseName: '',
                  newCasePhone: '',
                  newCaseAddress: '',
                }))}
                sx={{ ...commonStyles.formInput }}
              >
                {Object.entries(eventTypes).map(([key, type]) => (
                  <MenuItem key={key} value={key}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <type.icon sx={{ fontSize: 16, color: type.color }} />
                      {type.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 個案訪問特殊欄位 */}
            {showCaseFields && (
              <>
                <Divider sx={{ my: 1 }}>
                                      <Chip 
                      icon={<Person />}
                      label="個案訪問資訊" 
                      size="small"
                      sx={{ 
                        bgcolor: THEME_COLORS.SUCCESS_LIGHT,
                        color: THEME_COLORS.WARNING,
                      }}
                    />
                </Divider>

                {/* 新個案勾選框 */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isNewCase}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        isNewCase: e.target.checked,
                        // 切換時重置相關欄位
                        caseId: '',
                        newCaseName: '',
                        newCasePhone: '',
                        newCaseAddress: '',
                      }))}
                      sx={{ 
                        color: THEME_COLORS.WARNING,
                        '&.Mui-checked': {
                          color: THEME_COLORS.WARNING,
                        },
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonAdd sx={{ fontSize: 16 }} />
                      新個案
                    </Box>
                  }
                />

                {formData.isNewCase ? (
                  /* 新個案資料欄位 */
                  <Box sx={{ 
                    p: getResponsiveSpacing('md'),
                    border: `1px solid ${THEME_COLORS.SUCCESS_LIGHT}`,
                    borderRadius: '8px',
                    bgcolor: THEME_COLORS.PRIMARY_LIGHT_BG,
                  }}>
                    <Typography variant="subtitle2" sx={{ 
                      mb: getResponsiveSpacing('md'),
                      color: THEME_COLORS.PRIMARY_DARK,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}>
                      <PersonAdd sx={{ fontSize: 16 }} />
                      新個案基本資料
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: getResponsiveSpacing('md') }}>
                      <TextField
                        label="姓名 *"
                        value={formData.newCaseName}
                        onChange={(e) => setFormData(prev => ({ ...prev, newCaseName: e.target.value }))}
                        fullWidth
                        placeholder="請輸入個案姓名"
                        InputProps={{
                          startAdornment: <Person sx={{ mr: 1, color: THEME_COLORS.TEXT_MUTED }} />,
                        }}
                        sx={{ ...commonStyles.formInput }}
                      />
                      
                      <TextField
                        label="電話 *"
                        value={formData.newCasePhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, newCasePhone: e.target.value }))}
                        fullWidth
                        placeholder="09XX-XXX-XXX"
                        InputProps={{
                          startAdornment: <Phone sx={{ mr: 1, color: THEME_COLORS.TEXT_MUTED }} />,
                        }}
                        sx={{ ...commonStyles.formInput }}
                      />
                      
                      <TextField
                        label="地址 *"
                        value={formData.newCaseAddress}
                        onChange={(e) => setFormData(prev => ({ ...prev, newCaseAddress: e.target.value }))}
                        fullWidth
                        placeholder="請輸入完整地址"
                        InputProps={{
                          startAdornment: <LocationOn sx={{ mr: 1, color: THEME_COLORS.TEXT_MUTED }} />,
                        }}
                        sx={{ ...commonStyles.formInput }}
                      />
                    </Box>
                  </Box>
                ) : (
                  /* 現有個案選擇 */
                  <Autocomplete
                    value={mockCaseDatabase.find(c => c.id === formData.caseId) || null}
                    onChange={(_, newValue) => {
                      if (newValue && typeof newValue === 'object') {
                        setFormData(prev => ({ 
                          ...prev, 
                          caseId: newValue.id 
                        }));
                      }
                    }}
                    options={mockCaseDatabase}
                    getOptionLabel={(option) => typeof option === 'string' ? option : `${option.id} - ${option.name}`}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="個案ID *"
                        placeholder="請選擇或輸入個案ID"
                        sx={{ ...commonStyles.formInput }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {option.id} - {option.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: THEME_COLORS.TEXT_MUTED }}>
                            {option.phone} | {option.address}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    freeSolo
                    onInputChange={(_, newInputValue) => {
                      setFormData(prev => ({ ...prev, caseId: newInputValue }));
                    }}
                  />
                )}

                {/* 物資需求提醒 */}
                <Alert 
                  severity="info" 
                  sx={{ 
                    bgcolor: THEME_COLORS.PRIMARY_LIGHT_BG,
                    border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
                    color: THEME_COLORS.INFO,
                  }}
                >
                  <Typography variant="body2">
                    📋 <strong>提醒：</strong>個案訪問結束後，需在<strong>2天內</strong>填寫個案物資需求評估。
                    系統將自動設定提醒時間。
                  </Typography>
                </Alert>
              </>
            )}

            {/* 日期範圍 */}
            <Box sx={{ display: 'flex', gap: getResponsiveSpacing('md') }}>
              <TextField
                label="開始日期"
                type="date"
                value={formData.start}
                onChange={(e) => setFormData(prev => ({ ...prev, start: e.target.value }))}
                sx={{ ...commonStyles.formInput, flex: 1 }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="結束日期"
                type="date"
                value={formData.end}
                onChange={(e) => setFormData(prev => ({ ...prev, end: e.target.value }))}
                sx={{ ...commonStyles.formInput, flex: 1 }}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            {/* 時間範圍 */}
            <Box sx={{ display: 'flex', gap: getResponsiveSpacing('md') }}>
              <TextField
                label="開始時間"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                sx={{ ...commonStyles.formInput, flex: 1 }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="結束時間"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                sx={{ ...commonStyles.formInput, flex: 1 }}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            {/* 事件描述 */}
            <TextField
              label="備註說明"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={3}
              placeholder="請輸入事件的詳細說明..."
              sx={{ ...commonStyles.formInput }}
            />

            {isEditMode && (
              <Alert severity="info" sx={{ 
                mt: getResponsiveSpacing('sm'),
                bgcolor: THEME_COLORS.BACKGROUND_PRIMARY,
                border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
                color: THEME_COLORS.TEXT_SECONDARY,
              }}>
                正在編輯現有事件，您可以修改任何欄位或刪除此事件。
              </Alert>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ 
          p: getResponsiveSpacing('lg'), 
          borderTop: `1px solid ${THEME_COLORS.BORDER_LIGHT}` 
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            {/* 左側：刪除按鈕（僅編輯模式） */}
            <Box>
              {isEditMode && (
                <Button
                  onClick={handleDeleteEvent}
                  sx={{ 
                    ...commonStyles.dangerButton,
                    variant: 'outlined',
                    border: `1px solid ${THEME_COLORS.ERROR}`,
                    bgcolor: 'transparent',
                    color: THEME_COLORS.ERROR,
                    '&:hover': {
                      bgcolor: THEME_COLORS.ERROR_LIGHT,
                    }
                  }}
                >
                  刪除事件
                </Button>
              )}
            </Box>

            {/* 右側：取消和儲存按鈕 */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
                sx={{ ...commonStyles.secondaryButton }}
              >
                取消
              </Button>
              <Button
                onClick={handleSaveEvent}
                variant="contained"
                sx={{ ...commonStyles.primaryButton }}
              >
                {isEditMode ? '更新事件' : '新增事件'}
              </Button>
            </Box>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CalendarComponent; 