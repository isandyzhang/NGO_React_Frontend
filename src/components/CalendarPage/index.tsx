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
} from '@mui/material';
import { Add, Event, Person, Business, School } from '@mui/icons-material';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { THEME_COLORS } from '../../styles/theme';
import { commonStyles, getResponsiveSpacing } from '../../styles/commonStyles';

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

// 事件類型定義
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'meeting' | 'activity' | 'case-visit' | 'training' | 'other';
  description?: string;
  participants?: string[];
}

// 事件類型配置 - 使用主題顏色
const eventTypes = {
  activity: { label: '活動', color: THEME_COLORS.PRIMARY, icon: Event },
  meeting: { label: '會議', color: THEME_COLORS.INFO, icon: Business },
  'case-visit': { label: '個案訪問', color: THEME_COLORS.WARNING, icon: Person },
  training: { label: '培訓', color: THEME_COLORS.PRIMARY_LIGHT, icon: School },
  other: { label: '其他', color: THEME_COLORS.TEXT_MUTED, icon: Event },
};

// 新增事件表單資料
interface NewEventForm {
  title: string;
  start: string;
  end: string;
  startTime: string;
  endTime: string;
  type: CalendarEvent['type'];
  description: string;
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
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  }, []);

  /**
   * 儲存事件
   */
  const handleSaveEvent = useCallback(() => {
    if (!formData.title.trim()) {
      alert('請輸入事件標題');
      return;
    }

    const startDateTime = new Date(`${formData.start}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.end}T${formData.endTime}`);

    if (endDateTime <= startDateTime) {
      alert('結束時間必須晚於開始時間');
      return;
    }

    const eventData = {
      title: formData.title,
      start: startDateTime,
      end: endDateTime,
      type: formData.type,
      description: formData.description,
    };

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
        maxWidth="sm"
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
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as CalendarEvent['type'] }))}
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