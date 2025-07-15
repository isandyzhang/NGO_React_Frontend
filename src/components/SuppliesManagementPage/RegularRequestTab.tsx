import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField,
  InputAdornment,
  Paper,
  Button,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Collapse,
  Typography,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { 
  Search,
  ExpandMore,
  ExpandLess,
  Person,
  CheckCircle,
  Cancel,
  Delete,
} from '@mui/icons-material';
import { THEME_COLORS } from '../../styles/theme';
import { 
  getStatusStyle,
  getResponsiveSpacing
} from '../../styles/commonStyles';
import { supplyService, RegularSuppliesNeed } from '../../services';

interface RegularSupplyRequest {
  id: number;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  requestedBy: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  estimatedCost: number;
  caseName?: string;
  caseId?: string;
  deliveryMethod?: '自取' | '宅配';
  matched: boolean;
}

const RegularRequestTab: React.FC = () => {
  const [searchType, setSearchType] = useState('物品名稱');
  const [searchContent, setSearchContent] = useState('');
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  
  // 資料狀態
  const [requestData, setRequestData] = useState<RegularSuppliesNeed[]>([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalEstimatedCost: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 確認對話框狀態
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'approve' | 'reject' | 'delete';
    item: RegularSuppliesNeed | null;
  }>({
    open: false,
    type: 'approve',
    item: null
  });

  // 載入資料
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [requests, requestStats] = await Promise.all([
        supplyService.getRegularSuppliesNeeds(),
        supplyService.getRegularSuppliesNeedStats()
      ]);
      
      setRequestData(requests);
      setStats(requestStats);
    } catch (err) {
      console.error('載入常駐物資需求失敗:', err);
      setError('載入資料失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // TODO: 實作搜尋邏輯
  };

  const toggleRowExpansion = (id: number) => {
    setExpandedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '待審核';
      case 'approved': return '批准';
      case 'rejected': return '不批准';
      case 'completed': return '已完成';
      default: return '未知';
    }
  };

  const handleApprove = (item: RegularSuppliesNeed) => {
    setConfirmDialog({
      open: true,
      type: 'approve',
      item: item
    });
  };

  const handleReject = (item: RegularSuppliesNeed) => {
    setConfirmDialog({
      open: true,
      type: 'reject',
      item: item
    });
  };

  const handleDelete = (item: RegularSuppliesNeed) => {
    setConfirmDialog({
      open: true,
      type: 'delete',
      item: item
    });
  };

  const confirmAction = async () => {
    if (!confirmDialog.item) return;

    try {
      switch (confirmDialog.type) {
        case 'approve':
          await supplyService.approveRegularSuppliesNeed(confirmDialog.item.needId);
          break;
        case 'reject':
          await supplyService.rejectRegularSuppliesNeed(confirmDialog.item.needId);
          break;
        case 'delete':
          await supplyService.deleteRegularSuppliesNeed(confirmDialog.item.needId);
          break;
      }
      
      // 重新載入資料
      await loadData();
      
      // 關閉對話框
      setConfirmDialog({ open: false, type: 'approve', item: null });
    } catch (err) {
      console.error('操作失敗:', err);
      setError('操作失敗，請稍後再試');
    }
  };

  // 篩選和排序資料
  const filteredData = requestData
    .filter(item => {
      if (!searchContent) return true;
      
      switch (searchType) {
        case '物品名稱':
          return item.itemName.toLowerCase().includes(searchContent.toLowerCase());
        case '分類':
          return item.category.toLowerCase().includes(searchContent.toLowerCase());
        case '申請人':
          return item.requestedBy.toLowerCase().includes(searchContent.toLowerCase());
        default:
          return true;
      }
    })
    .sort((a, b) => {
      // 先按狀態排序，pending 優先
      const statusOrder = { 'pending': 0, 'approved': 1, 'rejected': 2, 'completed': 3 };
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      
      if (statusDiff !== 0) {
        return statusDiff;
      }
      
      // 狀態相同時，按日期排序（最近的優先）
      return new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime();
    });

  return (
    <Box sx={{ width: '100%' }}>
      {/* 搜尋區域 */}
      <Paper elevation={1} sx={{ 
        p: getResponsiveSpacing('md'),
        mb: 3,
        bgcolor: THEME_COLORS.BACKGROUND_CARD,
        border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`
      }}>
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          alignItems: 'center',
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          <Select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            size="small"
            sx={{ minWidth: 120, height: 40 }}
          >
            <MenuItem value="物品名稱">物品名稱</MenuItem>
            <MenuItem value="分類">分類</MenuItem>
            <MenuItem value="申請人">申請人</MenuItem>
          </Select>
          
          <TextField
            value={searchContent}
            onChange={(e) => setSearchContent(e.target.value)}
            placeholder="搜尋常駐物資申請..."
            size="small"
            sx={{ flex: 1, minWidth: 200, height: 40 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          
          <Button
            variant="contained"
            onClick={handleSearch}
            sx={{
              height: 40,
              px: 3,
              bgcolor: THEME_COLORS.PRIMARY,
              '&:hover': { bgcolor: THEME_COLORS.PRIMARY_DARK }
            }}
          >
            搜尋
          </Button>
        </Box>
      </Paper>

      {/* 載入狀態 */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* 錯誤訊息 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* 統計卡片 */}
      {!loading && !error && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Paper elevation={1} sx={{ p: 2, flex: 1, minWidth: 200 }}>
            <Typography variant="body2" color="textSecondary">待審核申請</Typography>
            <Typography variant="h4" color={THEME_COLORS.WARNING} sx={{ fontWeight: 600 }}>
              {stats.pendingRequests}
            </Typography>
          </Paper>
          <Paper elevation={1} sx={{ p: 2, flex: 1, minWidth: 200 }}>
            <Typography variant="body2" color="textSecondary">已批准申請</Typography>
            <Typography variant="h4" color={THEME_COLORS.SUCCESS} sx={{ fontWeight: 600 }}>
              {stats.approvedRequests}
            </Typography>
          </Paper>
          <Paper elevation={1} sx={{ p: 2, flex: 1, minWidth: 200 }}>
            <Typography variant="body2" color="textSecondary">總申請金額</Typography>
            <Typography variant="h4" color={THEME_COLORS.PRIMARY} sx={{ fontWeight: 600 }}>
              NT$ {stats.totalEstimatedCost.toLocaleString()}
            </Typography>
          </Paper>
        </Box>
      )}

      {/* 申請表格 */}
      {!loading && !error && (
        <TableContainer component={Paper} elevation={1}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: THEME_COLORS.BACKGROUND_SECONDARY }}>
                <TableCell sx={{ fontWeight: 600 }}>申請人</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>分類</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>物品名稱</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>數量</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>申請時間</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>狀態</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body2" color="textSecondary">
                      暫無常駐物資申請資料
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((request) => (
              <React.Fragment key={request.needId}>
                <TableRow hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person sx={{ fontSize: 16, color: THEME_COLORS.PRIMARY }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {request.caseName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: THEME_COLORS.TEXT_MUTED }}>
                          {request.caseId}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{request.category}</TableCell>
                  <TableCell>{request.itemName}</TableCell>
                  <TableCell>{request.quantity} {request.unit}</TableCell>
                  <TableCell>{request.requestDate}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(request.status)}
                      size="small"
                      sx={getStatusStyle(request.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
                      {request.status === 'pending' && (
                        <>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<CheckCircle />}
                            sx={{
                              color: THEME_COLORS.SUCCESS,
                              borderColor: THEME_COLORS.SUCCESS,
                              fontSize: '0.75rem',
                              px: 1.5,
                              '&:hover': {
                                bgcolor: `${THEME_COLORS.SUCCESS}14`,
                                borderColor: THEME_COLORS.SUCCESS,
                              }
                            }}
                            onClick={() => handleApprove(request)}
                          >
                            批准
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Cancel />}
                            sx={{
                              color: THEME_COLORS.ERROR,
                              borderColor: THEME_COLORS.ERROR,
                              fontSize: '0.75rem',
                              px: 1.5,
                              '&:hover': {
                                bgcolor: `${THEME_COLORS.ERROR}14`,
                                borderColor: THEME_COLORS.ERROR,
                              }
                            }}
                            onClick={() => handleReject(request)}
                          >
                            拒絕
                          </Button>
                        </>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(request)}
                        sx={{ color: THEME_COLORS.ERROR }}
                      >
                        <Delete />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => toggleRowExpansion(request.needId)}
                        sx={{ color: THEME_COLORS.PRIMARY }}
                      >
                        {expandedRows.includes(request.needId) ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
                
                {/* 展開區域 */}
                <TableRow>
                  <TableCell colSpan={7} sx={{ p: 0 }}>
                    <Collapse in={expandedRows.includes(request.needId)}>
                      <Box sx={{ p: 3, bgcolor: THEME_COLORS.BACKGROUND_SECONDARY }}>
                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                          運送方式詳情
                        </Typography>
                        <Typography variant="body2">
                          運送方式：{request.deliveryMethod}
                        </Typography>
                        <Typography variant="body2">
                          預估費用：NT$ {request.estimatedCost.toLocaleString()}
                        </Typography>
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
      )}

      {/* 確認對話框 */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, type: 'approve', item: null })}>
        <DialogTitle>
          {confirmDialog.type === 'approve' && '確認批准'}
          {confirmDialog.type === 'reject' && '確認拒絕'}
          {confirmDialog.type === 'delete' && '確認刪除'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {confirmDialog.type === 'approve' && `確定要批准「${confirmDialog.item?.itemName}」的申請嗎？`}
            {confirmDialog.type === 'reject' && `確定要拒絕「${confirmDialog.item?.itemName}」的申請嗎？`}
            {confirmDialog.type === 'delete' && `確定要刪除「${confirmDialog.item?.itemName}」的申請嗎？此操作無法復原。`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, type: 'approve', item: null })}>
            取消
          </Button>
          <Button 
            variant="contained" 
            color={confirmDialog.type === 'delete' ? 'error' : 'primary'}
            onClick={confirmAction}
          >
            確認
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RegularRequestTab; 