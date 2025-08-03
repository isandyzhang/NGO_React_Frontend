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
  LinearProgress,
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
  PhotoCamera,
} from '@mui/icons-material';
import { THEME_COLORS } from '../../styles/theme';
import activityService from '../../services/activityManagement/activityService';
import { Activity } from '../../services/activityManagement/activityService';
import { formatDate, formatDateForInput } from '../../utils/dateHelper';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-tw';

// 設置 dayjs 為中文
dayjs.locale('zh-tw');

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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
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

  // 清理本地預覽 URL
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

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
    
    // 重置圖片相關狀態
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImageFile(null);
    setImagePreviewUrl(null);
    setUploadProgress(0);
    setIsUploadingImage(false);
    
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
      
      // 清理圖片相關狀態
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      setImageFile(null);
      setImagePreviewUrl(null);
      setUploadProgress(0);
      setIsUploadingImage(false);
      
      // 收起所有展開的 row
      setExpandedRows([]);
      
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
    
    // 清理圖片相關狀態
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImageFile(null);
    setImagePreviewUrl(null);
    setUploadProgress(0);
    setIsUploadingImage(false);
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

  // 處理日期變更
  const handleDateChange = (field: string, value: Dayjs | null) => {
    setEditFormData(prev => 
      prev ? { ...prev, [field]: value ? value.format('YYYY-MM-DD') : '' } : null
    );
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: false
      }));
    }
  };

  // 處理圖片檔案選擇
  const handleImageFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 檢查檔案格式
      if (!file.type.startsWith('image/')) {
        alert('請選擇有效的圖片檔案 (JPG, PNG, GIF)');
        return;
      }

      // 檢查檔案大小 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('圖片檔案大小不能超過 5MB');
        return;
      }

      // 創建本地預覽 URL
      const localPreviewUrl = URL.createObjectURL(file);
      setImageFile(file);
      setImagePreviewUrl(localPreviewUrl);
    }
  };

  // 處理圖片上傳
  const handleImageUpload = async () => {
    if (!imageFile || !editFormData) return;

    try {
      setIsUploadingImage(true);
      setUploadProgress(0);

      // 創建 FormData
      const formData = new FormData();
      formData.append('file', imageFile);

      // 模擬上傳進度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // 上傳到 Azure Blob Storage
      const response = await activityService.uploadImage(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // 更新表單資料
      setEditFormData(prev => 
        prev ? { ...prev, imageUrl: response.imageUrl } : null
      );

      // 清理本地預覽
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      setImageFile(null);
      setImagePreviewUrl(null);
      setUploadProgress(0);

      alert('圖片已成功更新！');
    } catch (error: any) {
      console.error('圖片上傳失敗:', error);
      alert(`圖片上傳失敗：${error.message || '未知錯誤'}`);
    } finally {
      setIsUploadingImage(false);
      setUploadProgress(0);
    }
  };

  // 處理圖片移除
  const handleImageRemove = () => {
    if (editFormData) {
      setEditFormData(prev => 
        prev ? { ...prev, imageUrl: undefined } : null
      );
    }
    
    // 清理本地預覽
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImageFile(null);
    setImagePreviewUrl(null);
    setUploadProgress(0);
  };

  // 處理圖片預覽
  const handleImagePreview = (imageUrl: string) => {
    setImagePreview(imageUrl);
    setShowImageModal(true);
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
      'public': '民眾'
    };
    return audienceMap[audience] || audience;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-tw">
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
              <MenuItem value="open">開放報名</MenuItem>
              <MenuItem value="full">人數已滿</MenuItem>
              <MenuItem value="closed">已關閉</MenuItem>
              <MenuItem value="completed">已完成</MenuItem>
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
              <MenuItem value="public">民眾</MenuItem>
              <MenuItem value="case">個案</MenuItem>
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
                                {/* 圖片預覽和變更區域 */}
                                <Box sx={{ gridColumn: '1 / -1' }}>
                                  <Typography variant="subtitle2" sx={{ mb: 1, color: THEME_COLORS.TEXT_SECONDARY }}>
                                    活動圖片
                                  </Typography>
                                  
                                  {/* 圖片預覽區域 */}
                                  {(editFormData.imageUrl || imagePreviewUrl) && (
                                    <Box sx={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: 2, 
                                      mb: 2,
                                      p: 2,
                                      border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
                                      borderRadius: 1,
                                      bgcolor: THEME_COLORS.BACKGROUND_PRIMARY
                                    }}>
                                      <Box sx={{ 
                                        position: 'relative',
                                        width: 120,
                                        height: 80,
                                        borderRadius: 1,
                                        overflow: 'hidden',
                                        border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                          transform: 'scale(1.05)',
                                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                          borderColor: THEME_COLORS.PRIMARY
                                        }
                                      }}
                                      onClick={() => handleImagePreview(imagePreviewUrl || editFormData.imageUrl!)}
                                    >
                                        <img 
                                          src={imagePreviewUrl || editFormData.imageUrl} 
                                          alt="活動圖片預覽"
                                          style={{ 
                                            width: '100%', 
                                            height: '100%', 
                                            objectFit: 'cover',
                                            display: 'block'
                                          }}
                                          onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.nextElementSibling!.style.display = 'flex';
                                          }}
                                        />
                                        <Box sx={{
                                          display: 'none',
                                          width: '100%',
                                          height: '100%',
                                          bgcolor: THEME_COLORS.BACKGROUND_SECONDARY,
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          color: THEME_COLORS.TEXT_MUTED
                                        }}>
                                          <Typography variant="caption">圖片載入失敗</Typography>
                                        </Box>
                                      </Box>
                                      
                                      <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" sx={{ color: THEME_COLORS.TEXT_SECONDARY, mb: 1 }}>
                                          {imagePreviewUrl ? '新選擇的圖片預覽' : '點擊圖片可放大預覽'}
                                        </Typography>
                                        <TextField
                                          label="圖片URL"
                                          value={editFormData.imageUrl || ''}
                                          onChange={(e) => handleEditInputChange('imageUrl', e.target.value)}
                                          size="small"
                                          fullWidth
                                        />
                                      </Box>
                                      
                                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {imageFile && (
                                          <Box sx={{ width: '100%' }}>
                                            <Button
                                              variant="contained"
                                              onClick={handleImageUpload}
                                              disabled={isUploadingImage}
                                              startIcon={isUploadingImage ? <CircularProgress size={16} /> : <PhotoCamera />}
                                              size="small"
                                              sx={{ 
                                                bgcolor: THEME_COLORS.PRIMARY,
                                                width: '100%',
                                                '&:hover': {
                                                  bgcolor: THEME_COLORS.PRIMARY_HOVER
                                                }
                                              }}
                                            >
                                              {isUploadingImage ? `上傳中 ${uploadProgress}%` : '上傳圖片'}
                                            </Button>
                                            {isUploadingImage && (
                                              <LinearProgress 
                                                variant="determinate" 
                                                value={uploadProgress} 
                                                sx={{ mt: 1 }}
                                              />
                                            )}
                                          </Box>
                                        )}
                                        
                                        <Button
                                          variant="outlined"
                                          component="label"
                                          startIcon={<PhotoCamera />}
                                          size="small"
                                          disabled={isUploadingImage}
                                          sx={{ 
                                            borderColor: THEME_COLORS.PRIMARY,
                                            color: THEME_COLORS.PRIMARY,
                                            '&:hover': {
                                              borderColor: THEME_COLORS.PRIMARY_HOVER,
                                              bgcolor: THEME_COLORS.PRIMARY_LIGHT_BG
                                            }
                                          }}
                                        >
                                          {editFormData.imageUrl ? '變更圖片' : '選擇圖片'}
                                          <input
                                            hidden
                                            accept="image/*"
                                            type="file"
                                            onChange={handleImageFileSelect}
                                          />
                                        </Button>
                                        
                                        {(editFormData.imageUrl || imageFile) && (
                                          <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={handleImageRemove}
                                            size="small"
                                            disabled={isUploadingImage}
                                            sx={{ 
                                              borderColor: THEME_COLORS.ERROR,
                                              color: THEME_COLORS.ERROR,
                                              '&:hover': {
                                                borderColor: THEME_COLORS.ERROR_DARK,
                                                bgcolor: THEME_COLORS.ERROR_LIGHT
                                              }
                                            }}
                                          >
                                            移除圖片
                                          </Button>
                                        )}
                                      </Box>
                                    </Box>
                                  )}
                                  
                                  {/* 無圖片時的顯示 */}
                                  {!editFormData.imageUrl && !imagePreviewUrl && (
                                    <Box sx={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: 2,
                                      p: 2,
                                      border: `2px dashed ${THEME_COLORS.BORDER_LIGHT}`,
                                      borderRadius: 1,
                                      bgcolor: THEME_COLORS.BACKGROUND_SECONDARY
                                    }}>
                                      <Box sx={{ 
                                        width: 120,
                                        height: 80,
                                        borderRadius: 1,
                                        bgcolor: THEME_COLORS.BACKGROUND_PRIMARY,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`
                                      }}>
                                        <Typography variant="body2" sx={{ color: THEME_COLORS.TEXT_MUTED }}>
                                          無圖片
                                        </Typography>
                                      </Box>
                                      
                                      <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" sx={{ color: THEME_COLORS.TEXT_SECONDARY, mb: 1 }}>
                                          尚未設定活動圖片
                                        </Typography>
                                        <TextField
                                          label="圖片URL"
                                          placeholder="請輸入圖片網址"
                                          value={editFormData.imageUrl || ''}
                                          onChange={(e) => handleEditInputChange('imageUrl', e.target.value)}
                                          size="small"
                                          fullWidth
                                        />
                                      </Box>
                                      
                                      <Button
                                        variant="outlined"
                                        component="label"
                                        startIcon={<PhotoCamera />}
                                        size="small"
                                        sx={{ 
                                          borderColor: THEME_COLORS.PRIMARY,
                                          color: THEME_COLORS.PRIMARY,
                                          '&:hover': {
                                            borderColor: THEME_COLORS.PRIMARY_HOVER,
                                            bgcolor: THEME_COLORS.PRIMARY_LIGHT_BG
                                          }
                                        }}
                                      >
                                        選擇圖片
                                        <input
                                          hidden
                                          accept="image/*"
                                          type="file"
                                          onChange={handleImageFileSelect}
                                        />
                                      </Button>
                                    </Box>
                                  )}
                                  
                                  {/* 檔案要求說明 */}
                                  <Typography variant="caption" sx={{ 
                                    color: THEME_COLORS.TEXT_MUTED,
                                    display: 'block',
                                    mt: 1
                                  }}>
                                    支援 JPG、PNG、GIF 格式，檔案大小不超過 5MB
                                  </Typography>
                                </Box>
                                <TextField
                                  label="最大人數"
                                  type="number"
                                  value={editFormData.maxParticipants}
                                  onChange={(e) => handleEditInputChange('maxParticipants', parseInt(e.target.value))}
                                  fullWidth
                                />
                                <DatePicker
                                  label="開始日期"
                                  value={editFormData.startDate ? dayjs(editFormData.startDate) : null}
                                  onChange={(value) => handleDateChange('startDate', value)}
                                  slotProps={{
                                    textField: {
                                      fullWidth: true,
                                      error: fieldErrors.startDate,
                                      helperText: fieldErrors.startDate ? '請選擇開始日期' : '',
                                      required: true,
                                      placeholder: "請選擇開始日期"
                                    },
                                  }}
                                  disablePast={false}
                                  format="YYYY-MM-DD"
                                />
                                <DatePicker
                                  label="結束日期"
                                  value={editFormData.endDate ? dayjs(editFormData.endDate) : null}
                                  onChange={(value) => handleDateChange('endDate', value)}
                                  slotProps={{
                                    textField: {
                                      fullWidth: true,
                                      error: fieldErrors.endDate,
                                      helperText: fieldErrors.endDate ? '請選擇結束日期' : '',
                                      required: true,
                                      placeholder: "請選擇結束日期"
                                    },
                                  }}
                                  disablePast={false}
                                  format="YYYY-MM-DD"
                                />
                                <DatePicker
                                  label="報名截止日"
                                  value={editFormData.signupDeadline ? dayjs(editFormData.signupDeadline) : null}
                                  onChange={(value) => handleDateChange('signupDeadline', value)}
                                  slotProps={{
                                    textField: {
                                      fullWidth: true,
                                      placeholder: "請選擇報名截止日"
                                    },
                                  }}
                                  disablePast={false}
                                  format="YYYY-MM-DD"
                                />
                                <FormControl fullWidth>
                                  <InputLabel>對象</InputLabel>
                                  <Select
                                    value={editFormData.targetAudience}
                                    onChange={(e) => handleEditInputChange('targetAudience', e.target.value)}
                                    label="對象"
                                  >
                                    <MenuItem value="public">民眾</MenuItem>
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
                                    <MenuItem value="open">開放報名</MenuItem>
                                    <MenuItem value="full">人數已滿</MenuItem>
                                    <MenuItem value="closed">已關閉</MenuItem>
                                    <MenuItem value="completed">已完成</MenuItem>
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

      {/* 圖片預覽模態框 */}
      {showImageModal && imagePreview && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            p: 2
          }}
          onClick={() => setShowImageModal(false)}
        >
          <Box
            sx={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              bgcolor: 'white',
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={imagePreview} 
              alt="活動圖片放大預覽" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain', 
                display: 'block', 
                maxWidth: '90vw', 
                maxHeight: '90vh' 
              }} 
            />
            <Button 
              onClick={() => setShowImageModal(false)} 
              sx={{ 
                position: 'absolute', 
                top: 8, 
                right: 8, 
                minWidth: 'auto', 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                bgcolor: 'rgba(0,0,0,0.5)', 
                color: 'white', 
                '&:hover': { 
                  bgcolor: 'rgba(0,0,0,0.7)' 
                } 
              }}
            >
              ×
            </Button>
          </Box>
        </Box>
      )}
      </Box>
    </LocalizationProvider>
  );
};

export default ActivityManagement; 