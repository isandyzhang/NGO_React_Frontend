import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Collapse,
  Avatar,
  Alert,
  CircularProgress,
  Chip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Search,
  Edit,
  ExpandMore,
  ExpandLess,
  Save,
  Cancel,
  Delete,
} from '@mui/icons-material';
import { THEME_COLORS } from '../../styles/theme';
import activityService from '../../services/activityService';
import { Activity } from '../../services/activityService';
import { formatDate, formatDateForInput } from '../../utils/dateHelper';

interface ActivityRecord extends Activity {
  workerName?: string;
}

const ActivityManagement: React.FC = () => {
  const [searchContent, setSearchContent] = useState('');
  const [searchStatus, setSearchStatus] = useState<string>('all'); // 搜尋狀態：all, open, close
  const [searchAudience, setSearchAudience] = useState<string>('all'); // 搜尋對象：all, user, case
  const [searchCategory, setSearchCategory] = useState<string>('all'); // 搜尋分類：all, 生活, 心靈, etc.
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<ActivityRecord | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>({});
  const [activityRecords, setActivityRecords] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<{value: string, label: string}[]>([]);
  
  // 載入活動資料
  const loadActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await activityService.getActivities();
      
      setActivityRecords(response.activities || []);
    } catch (err) {
      console.error('載入活動失敗:', err);
      setError(err instanceof Error ? err.message : '載入資料時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  // 載入分類選項
  const loadCategories = async () => {
    try {
      const categoryData = await activityService.getCategories();
      setCategories(categoryData);
    } catch (error) {
      console.error('載入分類選項失敗:', error);
    }
  };

  // 組件載入時取得資料
  useEffect(() => {
    loadActivities();
    loadCategories();
  }, []);

  // 篩選活動資料
  const filteredActivities = useMemo(() => {
    let filtered = activityRecords;

    // 文字搜尋
    if (searchContent.trim()) {
      const searchTerm = searchContent.toLowerCase();
      filtered = filtered.filter(activity => 
        activity.activityName.toLowerCase().includes(searchTerm) ||
        activity.location.toLowerCase().includes(searchTerm) ||
        activity.description?.toLowerCase().includes(searchTerm)
      );
    }

    // 狀態篩選
    if (searchStatus !== 'all') {
      filtered = filtered.filter(activity => activity.status === searchStatus);
    }

    // 對象篩選
    if (searchAudience !== 'all') {
      filtered = filtered.filter(activity => activity.targetAudience === searchAudience);
    }

    // 分類篩選
    if (searchCategory !== 'all') {
      filtered = filtered.filter(activity => activity.category === searchCategory);
    }

    return filtered;
  }, [activityRecords, searchContent, searchStatus, searchAudience, searchCategory]);

  const handleSearch = () => {
    // 搜尋邏輯已經在 filteredActivities 中處理
    
  };

  const toggleRowExpansion = (id: number) => {
    setExpandedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
    
    // 當展開行時，自動進入編輯模式
    if (!expandedRows.includes(id)) {
      const record = activityRecords.find(r => r.activityId === id);
      if (record) {
        setEditingRow(id);
        setEditFormData({ ...record });
        setFieldErrors({});
      }
    } else {
      // 當收起行時，退出編輯模式
      setEditingRow(null);
      setEditFormData(null);
      setFieldErrors({});
    }
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

  const handleDelete = async (activityId: number, activityName: string) => {
    const confirmDelete = window.confirm(
      `確定要刪除活動「${activityName}」嗎？\n\n此操作無法復原。`
    );
    
    if (!confirmDelete) return;

    try {
      setLoading(true);
      await activityService.deleteActivity(activityId);
      
      // 從列表中移除已刪除的活動
      setActivityRecords(prev => 
        prev.filter(record => record.activityId !== activityId)
      );
      
      // 清除編輯狀態
      setEditingRow(null);
      setEditFormData(null);
      setFieldErrors({});
      
      alert('活動已成功刪除！');
    } catch (err) {
      setError(err instanceof Error ? err.message : '刪除活動時發生錯誤');
      console.error('刪除活動錯誤:', err);
    } finally {
      setLoading(false);
    }
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



  // 狀態標籤顏色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return THEME_COLORS.SUCCESS;
      case 'closed': return THEME_COLORS.ERROR;
      case 'completed': return THEME_COLORS.INFO;
      default: return THEME_COLORS.TEXT_MUTED;
    }
  };

  // 對象標籤顏色
  const getAudienceColor = (aud: string) => aud === 'case' ? THEME_COLORS.PRIMARY : THEME_COLORS.INFO;

  // 狀態中文映射
  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'open': '開放報名',
      'full': '人數已滿',
      'closed': '已關閉',
      'completed': '已完成'
    };
    return statusMap[status] || status;
  };

  // 對象中文映射
  const getAudienceLabel = (audience: string) => {
    const audienceMap: { [key: string]: string } = {
      'case': '個案',
      'public': '一般民眾',
      'user': '志工'
    };
    return audienceMap[audience] || audience;
  };

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
          
          {/* 狀態篩選 */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>狀態</InputLabel>
            <Select
              value={searchStatus}
              onChange={(e) => setSearchStatus(e.target.value)}
              label="狀態"
            >
              <MenuItem value="all">全部狀態</MenuItem>
              <MenuItem value="open">open</MenuItem>
              <MenuItem value="full">full</MenuItem>
              <MenuItem value="closed">closed</MenuItem>
              <MenuItem value="completed">completed</MenuItem>
            </Select>
          </FormControl>
          
          {/* 對象篩選 */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>對象</InputLabel>
            <Select
              value={searchAudience}
              onChange={(e) => setSearchAudience(e.target.value)}
              label="對象"
            >
              <MenuItem value="all">全部對象</MenuItem>
              <MenuItem value="public">public</MenuItem>
              <MenuItem value="case">case</MenuItem>
            </Select>
          </FormControl>
          
          {/* 分類篩選 */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>分類</InputLabel>
            <Select
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              label="分類"
            >
              <MenuItem value="all">全部分類</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.value} value={category.value}>
                  {category.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Search />}
            sx={{ 
              minWidth: 100, 
              bgcolor: THEME_COLORS.SUCCESS,
              color: 'white',
              '&:hover': {
                bgcolor: THEME_COLORS.SUCCESS_DARK || '#2e7d32',
                color: 'white',
              },
              '&:disabled': {
                bgcolor: THEME_COLORS.DISABLED_BG,
                color: THEME_COLORS.DISABLED_TEXT,
              }
            }}
          >
            {loading ? '搜尋中...' : '查詢'}
          </Button>
        </Box>
      </Paper>

      {/* 統計資訊 */}
      {!loading && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: THEME_COLORS.BACKGROUND_CARD }}>
          <Typography variant="body2" sx={{ color: THEME_COLORS.TEXT_SECONDARY }}>
            共 {activityRecords.length} 筆活動資料，篩選後顯示 {filteredActivities.length} 筆
            {(searchContent || searchStatus !== 'all' || searchAudience !== 'all' || searchCategory !== 'all') && (
              <span> (已套用篩選條件)</span>
            )}
          </Typography>
        </Paper>
      )}

      {/* 資料表格 */}
      <TableContainer component={Paper} sx={{ bgcolor: THEME_COLORS.BACKGROUND_CARD }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: THEME_COLORS.BACKGROUND_SECONDARY }}>
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>活動名稱</TableCell>
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>地點</TableCell>
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>分類</TableCell>
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>狀態</TableCell>
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>對象</TableCell>
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>人數</TableCell>
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>開始日期</TableCell>
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY, textAlign: 'center' }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress />
                  <Typography sx={{ mt: 2 }}>載入中...</Typography>
                </TableCell>
              </TableRow>
            ) : (!filteredActivities || filteredActivities.length === 0) ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="textSecondary">
                    {searchContent || searchStatus !== 'all' || searchAudience !== 'all' || searchCategory !== 'all' ? '查無符合條件的資料' : '暫無活動資料'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredActivities.map((record: ActivityRecord) => (
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
                        <Typography sx={{ color: THEME_COLORS.TEXT_PRIMARY }}>
                          {record.activityName}
                        </Typography>
                    </TableCell>
                    <TableCell sx={{ color: THEME_COLORS.TEXT_PRIMARY }}>
                      {record.location}
                    </TableCell>
                    <TableCell>
                      {record.category ? (
                        <Chip 
                          label={record.category}
                          size="small"
                          sx={{ 
                            backgroundColor: THEME_COLORS.PRIMARY_LIGHT_BG,
                            color: THEME_COLORS.PRIMARY,
                            fontSize: '0.75rem'
                          }}
                        />
                      ) : (
                        <Typography variant="body2" sx={{ color: THEME_COLORS.TEXT_MUTED }}>
                          未分類
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(record.status)}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(record.status),
                          color: 'white',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getAudienceLabel(record.targetAudience)}
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
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
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
                            
                            {expandedRows.includes(record.activityId) && editFormData && (
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
                                    <MenuItem value="public">public</MenuItem>
                                    <MenuItem value="case">case</MenuItem>
                                  </Select>
                                </FormControl>
                                <FormControl fullWidth>
                                  <InputLabel>狀態</InputLabel>
                                  <Select
                                    value={editFormData.status}
                                    onChange={(e) => handleEditInputChange('status', e.target.value)}
                                    label="狀態"
                                  >
                                    <MenuItem value="open">open</MenuItem>
                                    <MenuItem value="full">full</MenuItem>
                                    <MenuItem value="closed">closed</MenuItem>
                                    <MenuItem value="completed">completed</MenuItem>
                                  </Select>
                                </FormControl>
                              </Box>
                            )}

                            {/* 操作按鈕 */}
                            {expandedRows.includes(record.activityId) && (
                              <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'space-between' }}>
                                {/* 左側刪除按鈕 */}
                                <Button
                                  variant="contained"
                                  onClick={() => handleDelete(record.activityId, record.activityName)}
                                  disabled={loading}
                                  startIcon={<Delete />}
                                  sx={{ 
                                    bgcolor: THEME_COLORS.ERROR,
                                    color: 'white',
                                    '&:hover': {
                                      bgcolor: THEME_COLORS.ERROR_DARK || '#d32f2f',
                                    },
                                    '&:disabled': {
                                      bgcolor: THEME_COLORS.TEXT_MUTED,
                                    }
                                  }}
                                >
                                  刪除活動
                                </Button>
                                
                                {/* 右側操作按鈕 */}
                                <Box sx={{ display: 'flex', gap: 2 }}>
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