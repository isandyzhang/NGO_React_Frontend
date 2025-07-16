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
  DialogContentText,
  FormControl,
  InputLabel,
} from '@mui/material';
import { 
  Search,
  ExpandMore,
  ExpandLess,
  Person,
  CheckCircle,
  Cancel,
  Delete,
  Warning,
  PriorityHigh,
} from '@mui/icons-material';
import { THEME_COLORS } from '../../styles/theme';
import { 
  getStatusStyle,
  getResponsiveSpacing
} from '../../styles/commonStyles';
import { supplyService, EmergencySupplyNeed } from '../../services';

const EmergencyRequestTab: React.FC = () => {
  const [searchType, setSearchType] = useState('物品名稱');
  const [searchContent, setSearchContent] = useState('');
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  
  // 資料狀態
  const [requestData, setRequestData] = useState<EmergencySupplyNeed[]>([]);
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
    item: EmergencySupplyNeed | null;
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
        supplyService.getEmergencySupplyNeeds(),
        supplyService.getEmergencySupplyNeedStats()
      ]);
      
      setRequestData(requests);
      setStats(requestStats);
    } catch (err) {
      console.error('載入緊急物資需求失敗:', err);
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

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return '未知';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return THEME_COLORS.ERROR;
      case 'medium': return THEME_COLORS.WARNING;
      case 'low': return THEME_COLORS.SUCCESS;
      default: return THEME_COLORS.TEXT_MUTED;
    }
  };

  const handleApprove = (item: EmergencySupplyNeed) => {
    setConfirmDialog({
      open: true,
      type: 'approve',
      item: item
    });
  };

  const handleReject = (item: EmergencySupplyNeed) => {
    setConfirmDialog({
      open: true,
      type: 'reject',
      item: item
    });
  };

  const handleDelete = (item: EmergencySupplyNeed) => {
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
          await supplyService.approveEmergencySupplyNeed(confirmDialog.item.emergencyNeedId);
          break;
        case 'reject':
          await supplyService.rejectEmergencySupplyNeed(confirmDialog.item.emergencyNeedId);
          break;
        case 'delete':
          await supplyService.deleteEmergencySupplyNeed(confirmDialog.item.emergencyNeedId);
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
        case '個案名稱':
          return item.caseName.toLowerCase().includes(searchContent.toLowerCase());
        default:
          return true;
      }
    })
    .sort((a, b) => {
      // 按緊急程度排序：高 > 中 > 低
      const urgencyOrder = { high: 3, medium: 2, low: 1 };
      return urgencyOrder[b.urgency as keyof typeof urgencyOrder] - urgencyOrder[a.urgency as keyof typeof urgencyOrder];
    });

  const getActionText = (type: 'approve' | 'reject' | 'delete') => {
    switch (type) {
      case 'approve': return '批准';
      case 'reject': return '拒絕';
      case 'delete': return '刪除';
      default: return '操作';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* 錯誤訊息 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 統計卡片 */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 3, 
          backgroundColor: THEME_COLORS.BACKGROUND_CARD,
          borderRadius: 2
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ color: THEME_COLORS.TEXT_PRIMARY }}>
          📊 緊急物資需求統計
        </Typography>
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="body2" sx={{ color: THEME_COLORS.TEXT_SECONDARY }}>
              總申請數
            </Typography>
            <Typography variant="h4" sx={{ color: THEME_COLORS.PRIMARY }}>
              {stats.totalRequests}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: THEME_COLORS.TEXT_SECONDARY }}>
              待審核
            </Typography>
            <Typography variant="h4" sx={{ color: THEME_COLORS.WARNING }}>
              {stats.pendingRequests}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: THEME_COLORS.TEXT_SECONDARY }}>
              已批准
            </Typography>
            <Typography variant="h4" sx={{ color: THEME_COLORS.SUCCESS }}>
              {stats.approvedRequests}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: THEME_COLORS.TEXT_SECONDARY }}>
              已拒絕
            </Typography>
            <Typography variant="h4" sx={{ color: THEME_COLORS.ERROR }}>
              {stats.rejectedRequests}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: THEME_COLORS.TEXT_SECONDARY }}>
              總預估成本
            </Typography>
            <Typography variant="h4" sx={{ color: THEME_COLORS.INFO }}>
              ${stats.totalEstimatedCost.toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* 搜尋區域 */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2, 
          mb: 3, 
          backgroundColor: THEME_COLORS.BACKGROUND_CARD,
          borderRadius: 1
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>搜尋類型</InputLabel>
            <Select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              label="搜尋類型"
            >
              <MenuItem value="物品名稱">物品名稱</MenuItem>
              <MenuItem value="分類">分類</MenuItem>
              <MenuItem value="申請人">申請人</MenuItem>
              <MenuItem value="個案名稱">個案名稱</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            placeholder={`請輸入${searchType}關鍵字`}
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
            sx={{ flex: 1 }}
          />
          
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Search />}
            sx={{
              minWidth: 100,
              backgroundColor: THEME_COLORS.ERROR,
              color: 'white',
              '&:hover': {
                backgroundColor: THEME_COLORS.ERROR_DARK,
              },
            }}
          >
            {loading ? '搜尋中...' : '搜尋'}
          </Button>
        </Box>
      </Paper>

      {/* 資料表格 */}
      <TableContainer 
        component={Paper} 
        elevation={1}
        sx={{ 
          backgroundColor: THEME_COLORS.BACKGROUND_CARD,
          borderRadius: 1
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: THEME_COLORS.BACKGROUND_SECONDARY }}>
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>
                物品名稱
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>
                分類
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>
                數量
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>
                緊急程度
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>
                申請人
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>
                個案名稱
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>
                申請日期
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>
                狀態
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>
                操作
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress />
                  <Typography sx={{ mt: 2 }}>載入中...</Typography>
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="textSecondary">
                    暫無緊急物資需求資料
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row) => (
                <React.Fragment key={row.emergencyNeedId}>
                  <TableRow 
                    hover
                    sx={{ 
                      '&:hover': { backgroundColor: THEME_COLORS.HOVER_LIGHT },
                      cursor: 'pointer'
                    }}
                    onClick={() => toggleRowExpansion(row.emergencyNeedId)}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {row.urgency === 'high' && (
                          <PriorityHigh sx={{ color: THEME_COLORS.ERROR, fontSize: 20 }} />
                        )}
                        <Typography sx={{ color: THEME_COLORS.TEXT_PRIMARY, fontWeight: 500 }}>
                          {row.itemName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: THEME_COLORS.TEXT_PRIMARY }}>
                      {row.category}
                    </TableCell>
                    <TableCell sx={{ color: THEME_COLORS.TEXT_PRIMARY }}>
                      {row.quantity} {row.unit}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getUrgencyLabel(row.urgency)}
                        size="small"
                        sx={{
                          backgroundColor: getUrgencyColor(row.urgency),
                          color: 'white',
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person sx={{ color: THEME_COLORS.TEXT_SECONDARY, fontSize: 18 }} />
                        <Typography sx={{ color: THEME_COLORS.TEXT_PRIMARY }}>
                          {row.requestedBy}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: THEME_COLORS.TEXT_PRIMARY }}>
                      {row.caseName}
                    </TableCell>
                    <TableCell sx={{ color: THEME_COLORS.TEXT_SECONDARY }}>
                      {new Date(row.requestDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(row.status)}
                        size="small"
                        sx={getStatusStyle(row.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {row.status === 'pending' && (
                          <>
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprove(row);
                              }}
                              sx={{ color: THEME_COLORS.SUCCESS }}
                            >
                              <CheckCircle />
                            </IconButton>
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReject(row);
                              }}
                              sx={{ color: THEME_COLORS.ERROR }}
                            >
                              <Cancel />
                            </IconButton>
                          </>
                        )}
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(row);
                          }}
                          sx={{ color: THEME_COLORS.TEXT_MUTED }}
                        >
                          <Delete />
                        </IconButton>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRowExpansion(row.emergencyNeedId);
                          }}
                          sx={{ color: THEME_COLORS.TEXT_SECONDARY }}
                        >
                          {expandedRows.includes(row.emergencyNeedId) ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>

                  {/* 展開的詳細資訊 */}
                  <TableRow>
                    <TableCell colSpan={9} sx={{ py: 0 }}>
                      <Collapse 
                        in={expandedRows.includes(row.emergencyNeedId)} 
                        timeout="auto" 
                        unmountOnExit
                      >
                        <Box sx={{ py: 2 }}>
                          <Typography 
                            variant="h6" 
                            gutterBottom 
                            sx={{ 
                              color: THEME_COLORS.TEXT_PRIMARY,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }}
                          >
                            <Warning sx={{ color: THEME_COLORS.WARNING }} />
                            緊急物資需求詳細資訊
                          </Typography>
                          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
                            <Box>
                              <Typography variant="subtitle2" sx={{ color: THEME_COLORS.TEXT_SECONDARY, fontWeight: 600 }}>
                                緊急原因
                              </Typography>
                              <Typography sx={{ mt: 1, color: THEME_COLORS.TEXT_PRIMARY }}>
                                {row.emergencyReason || '無'}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" sx={{ color: THEME_COLORS.TEXT_SECONDARY, fontWeight: 600 }}>
                                預估成本
                              </Typography>
                              <Typography sx={{ mt: 1, color: THEME_COLORS.TEXT_PRIMARY }}>
                                ${row.estimatedCost.toLocaleString()}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" sx={{ color: THEME_COLORS.TEXT_SECONDARY, fontWeight: 600 }}>
                                個案編號
                              </Typography>
                              <Typography sx={{ mt: 1, color: THEME_COLORS.TEXT_PRIMARY }}>
                                {row.caseId}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" sx={{ color: THEME_COLORS.TEXT_SECONDARY, fontWeight: 600 }}>
                                配對狀態
                              </Typography>
                              <Typography sx={{ mt: 1, color: THEME_COLORS.TEXT_PRIMARY }}>
                                {row.matched ? '已配對' : '未配對'}
                              </Typography>
                            </Box>
                          </Box>
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

      {/* 確認對話框 */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, type: 'approve', item: null })}>
        <DialogTitle>
          確認{getActionText(confirmDialog.type)}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.item && (
              <>
                確定要{getActionText(confirmDialog.type)}物品「{confirmDialog.item.itemName}」的申請嗎？
                {confirmDialog.type === 'delete' && (
                  <Typography color="error" sx={{ mt: 1 }}>
                    此操作無法復原！
                  </Typography>
                )}
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, type: 'approve', item: null })}>
            取消
          </Button>
          <Button 
            onClick={confirmAction}
            variant="contained"
            color={confirmDialog.type === 'delete' ? 'error' : 'primary'}
            autoFocus
          >
            確認{getActionText(confirmDialog.type)}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmergencyRequestTab; 