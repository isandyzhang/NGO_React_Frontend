import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem, Box, Typography
} from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { Activity } from '../../services/activityService';

interface ActivityFormDialogProps {
  open: boolean;
  initialData?: Partial<Activity>;
  onClose: () => void;
  onSubmit: (data: Partial<Activity>) => void;
  isEdit?: boolean;
}

const defaultForm: Partial<Activity> = {
  activityName: '',
  description: '',
  imageUrl: '',
  location: '',
  maxParticipants: 0,
  currentParticipants: 0,
  startDate: '',
  endDate: '',
  signupDeadline: '',
  workerId: 1,
  targetAudience: 'user',
  status: 'open',
};

const ActivityFormDialog: React.FC<ActivityFormDialogProps> = ({ open, initialData, onClose, onSubmit, isEdit }) => {
  const [form, setForm] = useState<Partial<Activity>>(defaultForm);

  useEffect(() => {
    if (open) {
      setForm({ ...defaultForm, ...initialData });
    }
  }, [open, initialData]);

  // 處理欄位變更
  const handleChange = (field: keyof Activity, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // 處理日期欄位
  const handleDateChange = (field: keyof Activity, value: Dayjs | null) => {
    setForm(prev => ({ ...prev, [field]: value ? value.format('YYYY-MM-DD') : '' }));
  };

  // 驗證（可擴充）
  const isValid = form.activityName && form.location && form.startDate && form.endDate && form.signupDeadline;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? '編輯活動' : '新增活動'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {isEdit && (
            <TextField label="活動ID" value={form.activityId} fullWidth InputProps={{ readOnly: true }} />
          )}
          <TextField label="活動名稱" value={form.activityName} onChange={e => handleChange('activityName', e.target.value)} fullWidth required />
          <TextField label="描述" value={form.description} onChange={e => handleChange('description', e.target.value)} fullWidth multiline rows={2} />
          <TextField label="圖片路徑" value={form.imageUrl} onChange={e => handleChange('imageUrl', e.target.value)} fullWidth />
          <TextField label="地點" value={form.location} onChange={e => handleChange('location', e.target.value)} fullWidth required />
          <TextField label="最大人數" type="number" value={form.maxParticipants} onChange={e => handleChange('maxParticipants', Number(e.target.value))} fullWidth required />
          <TextField label="目前人數" type="number" value={form.currentParticipants} onChange={e => handleChange('currentParticipants', Number(e.target.value))} fullWidth InputProps={{ readOnly: true }} />
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-tw">
            <DateTimePicker
              label="開始日期"
              value={form.startDate ? dayjs(form.startDate) : null}
              onChange={v => handleDateChange('startDate', v)}
              format="YYYY-MM-DD"
            />
            <DateTimePicker
              label="結束日期"
              value={form.endDate ? dayjs(form.endDate) : null}
              onChange={v => handleDateChange('endDate', v)}
              format="YYYY-MM-DD"
            />
            <DateTimePicker
              label="報名截止日"
              value={form.signupDeadline ? dayjs(form.signupDeadline) : null}
              onChange={v => handleDateChange('signupDeadline', v)}
              format="YYYY-MM-DD"
            />
          </LocalizationProvider>
          <TextField label="負責人ID" type="number" value={form.workerId} onChange={e => handleChange('workerId', Number(e.target.value))} fullWidth required />
          <TextField
            label="對象"
            select
            value={form.targetAudience}
            onChange={e => handleChange('targetAudience', e.target.value)}
            fullWidth
            required
          >
            <MenuItem value="user">一般使用者</MenuItem>
            <MenuItem value="case">個案</MenuItem>
          </TextField>
          <TextField
            label="狀態"
            select
            value={form.status}
            onChange={e => handleChange('status', e.target.value)}
            fullWidth
            required
          >
            <MenuItem value="open">開放</MenuItem>
            <MenuItem value="close">關閉</MenuItem>
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button onClick={() => isValid && onSubmit(form)} variant="contained" disabled={!isValid}>{isEdit ? '儲存' : '新增'}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ActivityFormDialog; 