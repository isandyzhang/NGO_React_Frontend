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
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Add, Event, Person, Business, School, PersonAdd, Home, Phone, LocationOn, AccessTime } from '@mui/icons-material';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { THEME_COLORS } from '../../styles/theme';
import { commonStyles, getResponsiveSpacing } from '../../styles/commonStyles';
import { CalendarEvent } from '../../services/schedule/scheduleService';
import { formatDateForInput } from '../../utils/dateHelper';

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

// 自定義時間選擇器組件
interface TimePickerFieldProps {
  label: string;
  value: string;
  onChange: (time: string) => void;
}

const TimePickerField: React.FC<TimePickerFieldProps> = ({ label, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState('09');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState('上午');

  // 從 value 解析時間
  React.useEffect(() => {
    if (value) {
      const [hour, minute] = value.split(':');
      const hourNum = parseInt(hour);
      if (hourNum === 0) {
        setSelectedHour('12');
        setSelectedPeriod('上午');
      } else if (hourNum <= 12) {
        setSelectedHour(hourNum.toString().padStart(2, '0'));
        setSelectedPeriod('上午');
      } else {
        setSelectedHour((hourNum - 12).toString().padStart(2, '0'));
        setSelectedPeriod('下午');
      }
      setSelectedMinute(minute);
    }
  }, [value]);

  const handleTimeSelect = () => {
    let hour = parseInt(selectedHour);
    if (selectedPeriod === '下午' && hour !== 12) {
      hour += 12;
    } else if (selectedPeriod === '上午' && hour === 12) {
      hour = 0;
    }
    const timeString = `${hour.toString().padStart(2, '0')}:${selectedMinute}`;
    onChange(timeString);
    setIsOpen(false);
  };

  const formatDisplayTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [hour, minute] = timeStr.split(':');
    const hourNum = parseInt(hour);
    const period = hourNum >= 12 ? '下午' : '上午';
    const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
    return `${period} ${displayHour.toString().padStart(2, '0')}:${minute}`;
  };

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

  return (
    <Box sx={{ flex: 1 }}>
      <TextField
        label={label}
        value={formatDisplayTime(value)}
        onClick={() => setIsOpen(true)}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setIsOpen(true)} edge="end">
                <AccessTime />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ 
          ...commonStyles.formDatePicker,
          width: '100%',
          '& .MuiInputBase-input': {
            cursor: 'pointer',
          },
          '& .MuiInputBase-root': {
            cursor: 'pointer',
          }
        }}
        InputLabelProps={{ shrink: true }}
      />

      {/* 時間選擇對話框 */}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          選擇{label}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            gap: 2,
            py: 2
          }}>
            {/* 小時選擇 */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                小時
              </Typography>
              <Select
                value={selectedHour}
                onChange={(e) => setSelectedHour(e.target.value)}
                size="small"
                sx={{ minWidth: 70 }}
              >
                {hours.map((hour) => (
                  <MenuItem key={hour} value={hour}>
                    {hour}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <Typography variant="h5" sx={{ mt: 3 }}>:</Typography>

            {/* 分鐘選擇 */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                分鐘
              </Typography>
              <Select
                value={selectedMinute}
                onChange={(e) => setSelectedMinute(e.target.value)}
                size="small"
                sx={{ minWidth: 70 }}
              >
                {minutes.map((minute) => (
                  <MenuItem key={minute} value={minute}>
                    {minute}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            {/* 上午/下午選擇 */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                時段
              </Typography>
              <Select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                size="small"
                sx={{ minWidth: 70 }}
              >
                <MenuItem value="上午">上午</MenuItem>
                <MenuItem value="下午">下午</MenuItem>
              </Select>
            </Box>
          </Box>

          {/* 預覽 */}
          <Box sx={{ 
            textAlign: 'center', 
            mt: 2, 
            p: 2, 
            bgcolor: THEME_COLORS.BACKGROUND_PRIMARY,
            borderRadius: 1,
            border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`
          }}>
            <Typography variant="body2" color="text.secondary">
              預覽時間
            </Typography>
            <Typography variant="h6" sx={{ color: THEME_COLORS.PRIMARY }}>
              {selectedPeriod} {selectedHour}:{selectedMinute}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsOpen(false)}>
            取消
          </Button>
          <Button onClick={handleTimeSelect} variant="contained">
            確認
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
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
const ScheduleComponent: React.FC<CalendarComponentProps> = ({
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
    start: formatDateForInput(new Date()),
    end: formatDateForInput(new Date()),
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
  const [currentDate, setCurrentDate] = useState(new Date());

  /**
   * 重置表單
   */
  const resetForm = useCallback(() => {
    const today = formatDateForInput(new Date());
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
      // 使用本地時間格式化函數，避免時區問題
      const startDate = formatDateForInput(slotInfo.start);
      const endDate = formatDateForInput(slotInfo.end);
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
      start: formatDateForInput(event.start),
      end: formatDateForInput(event.end),
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
        // 強制設定日期文字為黑色
        '& .rbc-date-cell': {
          color: '#000000 !important',
        },
        '& .rbc-button-link': {
          color: '#000000 !important',
        },
        '& .rbc-month-view .rbc-date-cell > a': {
          color: '#000000 !important',
        },
        '& .rbc-month-view .rbc-date-cell button': {
          color: '#000000 !important',
        },
        '& .rbc-month-view .rbc-off-range-bg': {
          '& .rbc-button-link': {
            color: '#666666 !important',
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
          date={currentDate}
          onNavigate={setCurrentDate}
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
          components={{
            toolbar: (props) => (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2,
                flexWrap: 'wrap',
                gap: 1
              }}>
                {/* 左側：導航按鈕 */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={() => props.onNavigate('PREV')}
                    sx={{
                      border: `1px solid ${THEME_COLORS.BORDER_DEFAULT}`,
                      bgcolor: THEME_COLORS.BACKGROUND_CARD,
                      color: THEME_COLORS.TEXT_SECONDARY,
                      borderRadius: '6px',
                      padding: '6px 12px',
                      minWidth: 'auto',
                      '&:hover': {
                        bgcolor: THEME_COLORS.BACKGROUND_PRIMARY,
                      },
                    }}
                  >
                    上一頁
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={() => props.onNavigate('TODAY')}
                    sx={{
                      border: `1px solid ${THEME_COLORS.BORDER_DEFAULT}`,
                      bgcolor: THEME_COLORS.BACKGROUND_CARD,
                      color: THEME_COLORS.TEXT_SECONDARY,
                      borderRadius: '6px',
                      padding: '6px 12px',
                      minWidth: 'auto',
                      '&:hover': {
                        bgcolor: THEME_COLORS.BACKGROUND_PRIMARY,
                      },
                    }}
                  >
                    今天
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={() => props.onNavigate('NEXT')}
                    sx={{
                      border: `1px solid ${THEME_COLORS.BORDER_DEFAULT}`,
                      bgcolor: THEME_COLORS.BACKGROUND_CARD,
                      color: THEME_COLORS.TEXT_SECONDARY,
                      borderRadius: '6px',
                      padding: '6px 12px',
                      minWidth: 'auto',
                      '&:hover': {
                        bgcolor: THEME_COLORS.BACKGROUND_PRIMARY,
                      },
                    }}
                  >
                    下一頁
                  </Button>
                  
                  {/* 當前月份顯示 */}
                  <Typography
                    variant="h6"
                    sx={{
                      ml: 2,
                      fontWeight: 600,
                      color: THEME_COLORS.PRIMARY,
                      fontSize: '1.1rem',
                    }}
                  >
                    {format(currentDate, 'yyyy年M月', { locale: zhTW })}
                  </Typography>
                </Box>

                {/* 右側：視圖切換按鈕 */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {['month', 'week', 'day'].map((viewName) => (
                    <Button
                      key={viewName}
                      variant={props.view === viewName ? 'contained' : 'outlined'}
                      onClick={() => props.onView(viewName as View)}
                      sx={{
                        border: `1px solid ${THEME_COLORS.BORDER_DEFAULT}`,
                        bgcolor: props.view === viewName ? THEME_COLORS.PRIMARY : THEME_COLORS.BACKGROUND_CARD,
                        color: props.view === viewName ? 'white' : THEME_COLORS.TEXT_SECONDARY,
                        borderRadius: '6px',
                        padding: '6px 12px',
                        minWidth: 'auto',
                        '&:hover': {
                          bgcolor: props.view === viewName ? THEME_COLORS.PRIMARY : THEME_COLORS.BACKGROUND_PRIMARY,
                        },
                      }}
                    >
                      {viewName === 'month' ? '月' : viewName === 'week' ? '週' : '日'}
                    </Button>
                  ))}
                </Box>
              </Box>
            ),
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
                sx={{ 
                  ...commonStyles.formDatePicker, 
                  flex: 1,
                  '& .MuiInputBase-input': {
                    ...commonStyles.formDatePicker['& .MuiInputBase-input'],
                    cursor: 'pointer', // 確保可點擊
                  },
                  '& .MuiInputBase-root': {
                    cursor: 'pointer',
                  }
                }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="結束日期"
                type="date"
                value={formData.end}
                onChange={(e) => setFormData(prev => ({ ...prev, end: e.target.value }))}
                sx={{ 
                  ...commonStyles.formDatePicker, 
                  flex: 1,
                  '& .MuiInputBase-input': {
                    ...commonStyles.formDatePicker['& .MuiInputBase-input'],
                    cursor: 'pointer', // 確保可點擊
                  },
                  '& .MuiInputBase-root': {
                    cursor: 'pointer',
                  }
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            {/* 時間範圍 */}
            <Box sx={{ display: 'flex', gap: getResponsiveSpacing('md') }}>
              <TimePickerField
                label="開始時間"
                value={formData.startTime}
                onChange={(time) => setFormData(prev => ({ ...prev, startTime: time }))}
              />
              <TimePickerField
                label="結束時間"
                value={formData.endTime}
                onChange={(time) => setFormData(prev => ({ ...prev, endTime: time }))}
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

export default ScheduleComponent; 