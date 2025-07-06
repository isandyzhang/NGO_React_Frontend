import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Collapse,
  CircularProgress,
  Alert,
  InputAdornment,
  Avatar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Search,
  Edit,
  Save,
  Cancel,
  ExpandMore,
  ExpandLess,
  LocationOn,
  Group,
  AccessTime,
  Add,
} from '@mui/icons-material';
import { THEME_COLORS } from '../../styles/theme';
import activityService, { Activity } from '../../services/activityService';

interface ActivityRecord extends Activity {
  workerName?: string;
}

const ActivityManagement: React.FC = () => {
  const [searchContent, setSearchContent] = useState('');
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<ActivityRecord | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>({});
  const [activityRecords, setActivityRecords] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 載入活動資料
  const loadActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('開始載入活動資料...');
      const response = await activityService.getActivities();
      console.log('Service 回應:', response);
      console.log('活動數量:', response.activities.length);
      
      setActivityRecords(response.activities);
    } catch (err) {
      console.error('載入活動資料錯誤:', err);
      setError(err instanceof Error ? err.message : '載入資料時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  // 組件載入時取得資料
  useEffect(() => {
    loadActivities();
  }, []);

  const handleSearch = async () => {
    if (!searchContent.trim()) {
      loadActivities();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await activityService.getActivities();
      const filtered = response.activities.filter(activity =>
        activity.activityName.toLowerCase().includes(searchContent.toLowerCase()) ||
        activity.location.toLowerCase().includes(searchContent.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchContent.toLowerCase())
      );
      setActivityRecords(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : '搜尋時發生錯誤');
      console.error('搜尋錯誤:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRowExpansion = (id: number) => {
    setExpandedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const handleEdit = (record: ActivityRecord) => {
    setEditingRow(record.activityId);
    setEditFormData({ ...record });
    setFieldErrors({});
    if (!expandedRows.includes(record.activityId)) {
      setExpandedRows(prev => [...prev, record.activityId]);
    }
  };

  const handleSave = async () => {
    if (!editFormData) return;

    const errors: { [key: string]: boolean } = {};
    if (!editFormData.activityName.trim()) errors.activityName = true;
    if (!editFormData.location.trim()) errors.location = true;
    if (!editFormData.description.trim()) errors.description = true;
    if (!editFormData.startDate) errors.startDate = true;
    if (!editFormData.endDate) errors.endDate = true;
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setLoading(true);
      
      await activityService.updateActivity(editFormData.activityId, editFormData);

      setActivityRecords(prev => 
        prev.map(record => 
          record.activityId === editFormData.activityId 
            ? { ...editFormData }
            : record
        )
      );
      
      setEditingRow(null);
      setEditFormData(null);
      setFieldErrors({});
      alert('活動資料已成功更新！');
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新時發生錯誤');
      console.error('更新錯誤:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditFormData(null);
    setFieldErrors({});
  };

  const handleEditInputChange = (field: string, value: any) => {
    setEditFormData(prev => 
      prev ? { ...prev, [field]: value } : null
    );
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: false
      }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW');
  };

  // 格式化日期為 YYYY-MM-DD 格式（用於 input[type="date"]）
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // 狀態標籤顏色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return THEME_COLORS.SUCCESS;
      case 'close': return THEME_COLORS.ERROR;
      default: return THEME_COLORS.TEXT_MUTED;
    }
  };

  // 對象標籤顏色
  const getAudienceColor = (aud: string) => aud === 'case' ? THEME_COLORS.PRIMARY : THEME_COLORS.INFO;

  return (
    <Box sx={{ p: 3 }}>
      {/* 錯誤訊息 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 搜尋區域 */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: THEME_COLORS.BACKGROUND_CARD }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="請輸入活動名稱、地點或描述關鍵字"
            value={searchContent}
            onChange={(e) => setSearchContent(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: THEME_COLORS.TEXT_SECONDARY }} />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, minWidth: 200 }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Search />}
            sx={{ minWidth: 100, bgcolor: THEME_COLORS.PRIMARY }}
          >
            {loading ? '搜尋中...' : '查詢'}
          </Button>
        </Box>
      </Paper>

      {/* 資料表格 */}
      <TableContainer component={Paper} sx={{ bgcolor: THEME_COLORS.BACKGROUND_CARD }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: THEME_COLORS.BACKGROUND_SECONDARY }}>
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>活動名稱</TableCell>
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>地點</TableCell>
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>狀態</TableCell>
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>對象</TableCell>
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>人數</TableCell>
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>開始日期</TableCell>
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY, textAlign: 'center' }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && activityRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress />
                  <Typography sx={{ mt: 2 }}>載入中...</Typography>
                </TableCell>
              </TableRow>
            ) : activityRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="textSecondary">
                    {searchContent ? '查無符合條件的資料' : '暫無活動資料'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              activityRecords.map((record) => (
                <React.Fragment key={record.activityId}>
                  {/* 主要資料行 */}
                  <TableRow 
                    hover
                    sx={{ 
                      '&:hover': { backgroundColor: THEME_COLORS.HOVER_LIGHT },
                      cursor: 'pointer'
                    }}
                    onClick={() => toggleRowExpansion(record.activityId)}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar 
                          src={record.imageUrl || undefined} 
                          sx={{ width: 40, height: 40, bgcolor: THEME_COLORS.PRIMARY }}
                        >
                          {!record.imageUrl && record.activityName.charAt(0)}
                        </Avatar>
                        <Typography sx={{ color: THEME_COLORS.TEXT_PRIMARY }}>
                          {record.activityName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: THEME_COLORS.TEXT_PRIMARY }}>
                      {record.location}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={record.status === 'open' ? '開放' : '關閉'}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(record.status),
                          color: 'white',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={record.targetAudience === 'user' ? '一般使用者' : '個案'}
                        size="small"
                        sx={{
                          backgroundColor: getAudienceColor(record.targetAudience),
                          color: 'white',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: THEME_COLORS.TEXT_PRIMARY }}>
                      {record.currentParticipants}/{record.maxParticipants}
                    </TableCell>
                    <TableCell sx={{ color: THEME_COLORS.TEXT_SECONDARY }}>
                      {formatDate(record.startDate)}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(record);
                          }}
                          sx={{ color: THEME_COLORS.PRIMARY }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRowExpansion(record.activityId);
                          }}
                          sx={{ color: THEME_COLORS.TEXT_SECONDARY }}
                        >
                          {expandedRows.includes(record.activityId) ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>

                  {/* 詳細資料展開行 */}
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                      <Collapse in={expandedRows.includes(record.activityId)} timeout="auto" unmountOnExit>
                        <Box sx={{ 
                          margin: 2, 
                          p: 3, 
                          bgcolor: THEME_COLORS.BACKGROUND_PRIMARY, 
                          borderRadius: 2,
                          border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
                        }}>
                          <Typography variant="h6" gutterBottom sx={{ color: THEME_COLORS.TEXT_PRIMARY }}>
                            詳細資料
                          </Typography>
                          
                          {editingRow === record.activityId && editFormData ? (
                            // 編輯模式
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
                              <TextField
                                label="活動名稱"
                                value={editFormData.activityName}
                                onChange={(e) => handleEditInputChange('activityName', e.target.value)}
                                error={fieldErrors.activityName}
                                helperText={fieldErrors.activityName ? '請輸入活動名稱' : ''}
                                fullWidth
                              />
                              <TextField
                                label="描述"
                                value={editFormData.description}
                                onChange={(e) => handleEditInputChange('description', e.target.value)}
                                error={fieldErrors.description}
                                helperText={fieldErrors.description ? '請輸入描述' : ''}
                                multiline
                                rows={3}
                                fullWidth
                              />
                              <TextField
                                label="地點"
                                value={editFormData.location}
                                onChange={(e) => handleEditInputChange('location', e.target.value)}
                                error={fieldErrors.location}
                                helperText={fieldErrors.location ? '請輸入地點' : ''}
                                fullWidth
                              />
                              <TextField
                                label="圖片URL"
                                value={editFormData.imageUrl || ''}
                                onChange={(e) => handleEditInputChange('imageUrl', e.target.value)}
                                fullWidth
                              />
                              <TextField
                                label="最大人數"
                                type="number"
                                value={editFormData.maxParticipants}
                                onChange={(e) => handleEditInputChange('maxParticipants', parseInt(e.target.value))}
                                fullWidth
                              />
                              <TextField
                                label="開始日期"
                                type="date"
                                value={formatDateForInput(editFormData.startDate)}
                                onChange={(e) => handleEditInputChange('startDate', e.target.value)}
                                error={fieldErrors.startDate}
                                helperText={fieldErrors.startDate ? '請選擇開始日期' : ''}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                              />
                              <TextField
                                label="結束日期"
                                type="date"
                                value={formatDateForInput(editFormData.endDate)}
                                onChange={(e) => handleEditInputChange('endDate', e.target.value)}
                                error={fieldErrors.endDate}
                                helperText={fieldErrors.endDate ? '請選擇結束日期' : ''}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                              />
                              <TextField
                                label="報名截止日"
                                type="date"
                                value={formatDateForInput(editFormData.signupDeadline)}
                                onChange={(e) => handleEditInputChange('signupDeadline', e.target.value)}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                              />
                              <FormControl fullWidth>
                                <InputLabel>對象</InputLabel>
                                <Select
                                  value={editFormData.targetAudience}
                                  onChange={(e) => handleEditInputChange('targetAudience', e.target.value)}
                                  label="對象"
                                >
                                  <MenuItem value="user">一般使用者</MenuItem>
                                  <MenuItem value="case">個案</MenuItem>
                                </Select>
                              </FormControl>
                              <FormControl fullWidth>
                                <InputLabel>狀態</InputLabel>
                                <Select
                                  value={editFormData.status}
                                  onChange={(e) => handleEditInputChange('status', e.target.value)}
                                  label="狀態"
                                >
                                  <MenuItem value="open">開放</MenuItem>
                                  <MenuItem value="close">關閉</MenuItem>
                                </Select>
                              </FormControl>
                            </Box>
                          ) : (
                            // 檢視模式
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
                              <Box>
                                <Typography variant="subtitle2" color={THEME_COLORS.TEXT_SECONDARY}>描述</Typography>
                                <Typography sx={{ mt: 1 }}>{record.description}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="subtitle2" color={THEME_COLORS.TEXT_SECONDARY}>圖片URL</Typography>
                                <Typography sx={{ mt: 1 }}>{record.imageUrl || '無'}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="subtitle2" color={THEME_COLORS.TEXT_SECONDARY}>最大人數</Typography>
                                <Typography sx={{ mt: 1 }}>{record.maxParticipants}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="subtitle2" color={THEME_COLORS.TEXT_SECONDARY}>結束日期</Typography>
                                <Typography sx={{ mt: 1 }}>{formatDate(record.endDate)}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="subtitle2" color={THEME_COLORS.TEXT_SECONDARY}>報名截止日</Typography>
                                <Typography sx={{ mt: 1 }}>{record.signupDeadline ? formatDate(record.signupDeadline) : '無'}</Typography>
                              </Box>
                            </Box>
                          )}

                          {/* 操作按鈕 */}
                          {editingRow === record.activityId && (
                            <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
                              <Button
                                variant="outlined"
                                onClick={handleCancel}
                                startIcon={<Cancel />}
                              >
                                取消
                              </Button>
                              <Button
                                variant="contained"
                                onClick={handleSave}
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                                sx={{ bgcolor: THEME_COLORS.PRIMARY }}
                              >
                                {loading ? '儲存中...' : '儲存'}
                              </Button>
                            </Box>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ActivityManagement; 