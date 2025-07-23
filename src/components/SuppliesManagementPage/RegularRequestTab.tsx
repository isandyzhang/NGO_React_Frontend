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
import { useAuth } from '../../hooks/useAuth';
import { useNotificationContext } from '../../contexts/NotificationContext';

interface RegularSupplyRequest {
  id: number;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  requestedBy: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'collected' | 'pending_super';
  estimatedCost: number;
  caseName?: string;
  caseId?: string;
  deliveryMethod?: '自取' | '宅配';
  matched: boolean;
}

const RegularRequestTab: React.FC = () => {
  // 從認證系統獲取用戶資訊
  const { user } = useAuth();
  const { refreshNotifications } = useNotificationContext();
  
  // 根據用戶角色設定權限
  const userRole = user?.role as 'staff' | 'supervisor' | 'admin' || 'staff';
  const currentUser = user?.name || '未知用戶';
  const currentStaffId = user?.workerId || 1;
  
  
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
    type: 'approve' | 'reject' | 'delete' | 'confirm' | 'supervisor-approve' | 'supervisor-reject';
    item: RegularSuppliesNeed | null;
  }>({
    open: false,
    type: 'approve',
    item: null
  });

  // 載入資料 - 當角色切換時重新載入
  useEffect(() => {
    loadData();
  }, [userRole]); // 當 userRole 改變時重新載入資料

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 根據員工權限決定是否傳遞workerId
      const workerId = (userRole === 'staff' && user?.workerId) ? user.workerId : undefined;
      
      const [requests, requestStats] = await Promise.all([
        supplyService.getRegularSuppliesNeeds(workerId),
        supplyService.getRegularSuppliesNeedStats(workerId)
      ]);
      
      // 直接使用API返回的已過濾資料
      const filteredRequests = requests;
      
      setRequestData(filteredRequests);
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
      case 'approved': return '已批准，待確認';
      case 'pending_super': return '等待主管審核';
      case 'rejected': return '不批准';
      case 'completed': return '已完成';
      case 'collected': return '已領取';
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

  const handleConfirm = (item: RegularSuppliesNeed) => {
    setConfirmDialog({
      open: true,
      type: 'confirm',
      item: item
    });
  };

  const handleSupervisorApprove = (item: RegularSuppliesNeed) => {
    setConfirmDialog({
      open: true,
      type: 'supervisor-approve',
      item: item
    });
  };

  const handleSupervisorReject = (item: RegularSuppliesNeed) => {
    setConfirmDialog({
      open: true,
      type: 'supervisor-reject',
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
        case 'confirm':
          await supplyService.confirmRegularSuppliesNeed(confirmDialog.item.needId);
          break;
        case 'supervisor-approve':
          await supplyService.supervisorApproveRegularSuppliesNeed(confirmDialog.item.needId);
          break;
        case 'supervisor-reject':
          await supplyService.supervisorRejectRegularSuppliesNeed(confirmDialog.item.needId);
          break;
        case 'delete':
          await supplyService.deleteRegularSuppliesNeed(confirmDialog.item.needId);
          break;
      }
      
      // 重新載入資料
      await loadData();
      
      // 刷新通知狀態
      refreshNotifications();
      
      // 關閉對話框
      setConfirmDialog({ open: false, type: 'approve', item: null });
    } catch (err) {
      console.error('操作失敗:', err);
      setError('操作失敗，請稍後再試');
    }
  };

  // 篩選和排序資料
  // 根據角色過濾數據 - 已由API層面處理，不需要前端再次過濾
  const getFilteredDataByRole = () => {
    // API已經根據workerId過濾了資料，直接返回
    return requestData;
  };

  const filteredData = getFilteredDataByRole()
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
      // 先按狀態排序，優先顯示需要操作的項目
      const statusOrder = { 
        'pending': 0, 
        'approved': 1, 
        'pending_super': 2, 
        'rejected': 3, 
        'completed': 4, 
        'collected': 5 
      };
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
                      {/* 員工權限：處理自己的申請 */}
                      {userRole === 'staff' && (
                        <>
                          {/* 員工可以批准和拒絕待審核的申請 */}
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
                          {/* 員工可以確認已批准的申請 */}
                          {request.status === 'approved' && (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<CheckCircle />}
                              sx={{
                                bgcolor: THEME_COLORS.PRIMARY,
                                fontSize: '0.75rem',
                                px: 2,
                                '&:hover': {
                                  bgcolor: THEME_COLORS.PRIMARY_DARK,
                                }
                              }}
                              onClick={() => handleConfirm(request)}
                            >
                              確認訂單
                            </Button>
                          )}
                        </>
                      )}

                      {/* 主管權限：審核所有待審核的申請 */}
                      {(userRole === 'supervisor' || userRole === 'admin') && (
                        <>
                          {/* 主管可以批准和拒絕待審核的申請 (所有狀態) */}
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
                          {/* 主管可以確認已批准的申請 */}
                          {request.status === 'approved' && (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<CheckCircle />}
                              sx={{
                                bgcolor: THEME_COLORS.PRIMARY,
                                fontSize: '0.75rem',
                                px: 2,
                                '&:hover': {
                                  bgcolor: THEME_COLORS.PRIMARY_DARK,
                                }
                              }}
                              onClick={() => handleConfirm(request)}
                            >
                              確認訂單
                            </Button>
                          )}
                          {/* 主管可以批准和拒絕等待主管審核的申請 */}
                          {request.status === 'pending_super' && (
                            <>
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<CheckCircle />}
                                sx={{
                                  bgcolor: THEME_COLORS.SUCCESS,
                                  fontSize: '0.75rem',
                                  px: 1.5,
                                  '&:hover': {
                                    bgcolor: THEME_COLORS.SUCCESS,
                                  }
                                }}
                                onClick={() => handleSupervisorApprove(request)}
                              >
                                批准
                              </Button>
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<Cancel />}
                                sx={{
                                  bgcolor: THEME_COLORS.ERROR,
                                  fontSize: '0.75rem',
                                  px: 1.5,
                                  '&:hover': {
                                    bgcolor: THEME_COLORS.ERROR,
                                  }
                                }}
                                onClick={() => handleSupervisorReject(request)}
                              >
                                不批准
                              </Button>
                            </>
                          )}
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
          {confirmDialog.type === 'confirm' && '確認訂單'}
          {confirmDialog.type === 'supervisor-approve' && '主管批准'}
          {confirmDialog.type === 'supervisor-reject' && '主管拒絕'}
          {confirmDialog.type === 'delete' && '確認刪除'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {confirmDialog.type === 'approve' && `確定要批准「${confirmDialog.item?.itemName}」的申請嗎？`}
            {confirmDialog.type === 'reject' && `確定要拒絕「${confirmDialog.item?.itemName}」的申請嗎？`}
            {confirmDialog.type === 'confirm' && `確定要確認「${confirmDialog.item?.itemName}」的訂單並提交給主管審核嗎？`}
            {confirmDialog.type === 'supervisor-approve' && `確定要批准「${confirmDialog.item?.itemName}」的申請並發放物資嗎？`}
            {confirmDialog.type === 'supervisor-reject' && `確定要拒絕「${confirmDialog.item?.itemName}」的申請嗎？`}
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