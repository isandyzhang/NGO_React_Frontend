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
  Modal,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { 
  Search,
  ExpandMore,
  ExpandLess,
  Calculate,
  CheckCircle,
  Warning,
  GetApp,
  Assignment,
  Inventory,
  Visibility,
} from '@mui/icons-material';
import { THEME_COLORS } from '../../styles/theme';
import { 
  getStatusStyle,
  getResponsiveSpacing
} from '../../styles/commonStyles';
import { 
  supplyService, 
  RegularSuppliesNeed, 
  RegularSupplyMatch,
  distributionBatchService,
  CreateDistributionBatchRequest,
  DistributionBatch,
  DistributionBatchDetail
} from '../../services';

interface DistributionTabProps {
  isEmergencySupply?: boolean;
}

interface MatchingResult {
  needId: number;
  caseName: string;
  itemName: string;
  requestedQuantity: number;
  matchedQuantity: number;
  status: 'fully_matched' | 'partially_matched' | 'not_matched';
  matchDate: string;
  notes?: string;
}

interface MatchingRecord {
  id: number;
  emergencyRequestId: string;
  caseName: string;
  caseId: string;
  requestedItem: string;
  requestedQuantity: number;
  unit: string;
  urgencyLevel: 'high' | 'medium' | 'low';
  availableStock: number;
  stockLocation: string;
  matchingScore: number;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  matchedDate: string;
}

const DistributionTab: React.FC<DistributionTabProps> = ({ 
  isEmergencySupply = false 
}) => {
  const [searchType, setSearchType] = useState('');
  const [searchContent, setSearchContent] = useState('');
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [orderConfirmationOpen, setOrderConfirmationOpen] = useState(false);
  const [matchingResults, setMatchingResults] = useState<MatchingResult[]>([]);
  const [distributionModalOpen, setDistributionModalOpen] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [batchHistoryRefresh, setBatchHistoryRefresh] = useState(0);
  
  // 媒合記錄資料
  const [matchingRecords, setMatchingRecords] = useState<MatchingRecord[]>([]);

  // 分發批次歷史記錄相關狀態
  const [batches, setBatches] = useState<DistributionBatch[]>([]);
  const [batchLoading, setBatchLoading] = useState(true);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [batchExpandedRows, setBatchExpandedRows] = useState<number[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<DistributionBatchDetail | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // 獲取當前月份
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}年${now.getMonth() + 1}月`;
  };

  // 載入真實資料
  useEffect(() => {
    loadRealData();
    loadBatches();
  }, []);

  // 載入分發批次歷史記錄
  const loadBatches = async () => {
    try {
      setBatchLoading(true);
      setBatchError(null);
      const data = await distributionBatchService.getDistributionBatches();
      setBatches(data);
    } catch (err) {
      console.error('載入分發批次列表失敗:', err);
      setBatchError('載入分發批次列表失敗，請稍後重試');
    } finally {
      setBatchLoading(false);
    }
  };

  // 刷新分發批次歷史記錄
  useEffect(() => {
    if (batchHistoryRefresh > 0) {
      loadBatches();
    }
  }, [batchHistoryRefresh]);

  // 載入真實資料
  const loadRealData = async () => {
    try {
      const needs = await supplyService.getRegularSuppliesNeeds();
      
      const matchingRecordsData = needs.map((need) => ({
        id: need.needId,
        emergencyRequestId: `REQ${need.needId.toString().padStart(3, '0')}`,
        caseName: need.caseName || '未知個案',
        caseId: need.caseId?.toString() || 'UNKNOWN',
        requestedItem: need.itemName,
        requestedQuantity: need.quantity,
        unit: need.unit,
        urgencyLevel: 'medium' as const,
        availableStock: 0,
        stockLocation: '待確認',
        matchingScore: 0,
        status: need.status === 'completed' ? 'approved' : need.status as 'pending' | 'approved' | 'rejected',
        requestDate: need.requestDate,
        matchedDate: need.requestDate
      }));
      
      setMatchingRecords(matchingRecordsData);
    } catch (error) {
      console.error('載入真實資料失敗:', error);
    }
  };

  // 切換批次行展開狀態
  const toggleBatchRowExpansion = (id: number) => {
    setBatchExpandedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  // 查看批次詳細信息
  const handleViewBatchDetail = async (batchId: number) => {
    try {
      setLoadingDetail(true);
      const detail = await distributionBatchService.getDistributionBatch(batchId);
      setSelectedBatch(detail);
      setDetailDialogOpen(true);
    } catch (err) {
      console.error('載入分發批次詳情失敗:', err);
      alert('載入分發批次詳情失敗，請稍後重試');
    } finally {
      setLoadingDetail(false);
    }
  };

  // 下載分發報告
  const handleDownloadReport = (batch: DistributionBatch) => {
    const reportData = {
      '分發批次ID': batch.distributionBatchId,
      '分發日期': batch.distributionDate,
      '處理個案數': batch.caseCount,
      '總物資件數': batch.totalSupplyItems,
      '狀態': batch.status === 'pending' ? '等待批准' : '已完成',
      '創建者': batch.createdByWorker,
      '創建時間': batch.createdAt,
      '批准者': batch.approvedByWorker || '未批准',
      '批准時間': batch.approvedAt || '未批准',
      '配對記錄數': batch.matchCount,
    };

    const csvContent = [
      Object.keys(reportData).join(','),
      Object.values(reportData).join(',')
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `分發批次報告_${batch.distributionBatchId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 獲取批次狀態樣式
  const getBatchStatusChip = (status: string) => {
    const statusConfig = {
      pending: { label: '等待批准', color: 'warning' as const },
      completed: { label: '已完成', color: 'success' as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                   { label: '未知', color: 'default' as const };
    
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        sx={{ fontWeight: 500 }}
      />
    );
  };

  const handleSearch = () => {
    console.log('搜尋條件:', { searchType, searchContent });
  };

  const toggleRowExpansion = (id: number) => {
    setExpandedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const handleStartDistribution = async () => {
    setIsCalculating(true);
    setDistributionModalOpen(false);
    
    try {
      const allNeeds = await supplyService.getRegularSuppliesNeeds();
      const approvedRequests = allNeeds.filter(need => need.status === 'approved');
      
      if (approvedRequests.length === 0) {
        alert('目前沒有已批准的申請可供分配');
      setIsCalculating(false);
        return;
      }

      const allSupplies = await supplyService.getSupplies();
      const matchingResults: MatchingResult[] = [];
      
      for (const need of approvedRequests) {
        const matchingSupplies = allSupplies.filter(supply => 
          supply.name.toLowerCase().includes(need.itemName.toLowerCase()) &&
          supply.currentStock > 0
        );
        
        if (matchingSupplies.length > 0) {
          const bestMatch = matchingSupplies.reduce((best, current) => 
            current.currentStock > best.currentStock ? current : best
          );
          
          const matchedQuantity = Math.min(need.quantity, bestMatch.currentStock);
          
          if (matchedQuantity > 0) {
            matchingResults.push({
              needId: need.needId,
              caseName: need.caseName || '未知個案',
              itemName: need.itemName,
              requestedQuantity: need.quantity,
              matchedQuantity: matchedQuantity,
              status: matchedQuantity === need.quantity ? 'fully_matched' : 'partially_matched',
              matchDate: new Date().toISOString(),
              notes: `從 ${bestMatch.name} 分配`
            });
          }
        } else {
          matchingResults.push({
            needId: need.needId,
            caseName: need.caseName || '未知個案',
            itemName: need.itemName,
            requestedQuantity: need.quantity,
            matchedQuantity: 0,
            status: 'not_matched',
            matchDate: new Date().toISOString(),
            notes: '無匹配庫存'
          });
        }
      }
      
      setMatchingResults(matchingResults);
      setOrderConfirmationOpen(true);
      
    } catch (error) {
      console.error('自動分配失敗:', error);
      alert('自動分配失敗，請稍後重試');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleConfirmOrder = async () => {
    const results = {
      matchCreated: 0,
      stockUpdated: 0,
      needStatusUpdated: 0,
      batchCreated: false,
      errors: [] as string[]
    };

    try {
      // 1. 創建 RegularSupplyMatch 記錄
      for (const result of matchingResults.filter(r => r.status !== 'not_matched')) {
        try {
          const allSupplies = await supplyService.getSupplies();
          const matchingSupply = allSupplies.find(supply => 
            supply.name.toLowerCase().includes(result.itemName.toLowerCase())
          );

          if (matchingSupply) {
            const matchData: Omit<RegularSupplyMatch, 'regularMatchId'> = {
              regularNeedId: result.needId,
              supplyId: matchingSupply.supplyId,
              matchDate: result.matchDate,
              matchedByWorkerId: 1,
              note: result.notes,
              status: 'matched'
            };

            await supplyService.createRegularSupplyMatch(matchData);
            results.matchCreated++;
          }
        } catch (error) {
          console.error(`創建配對記錄失敗 (需求ID: ${result.needId}):`, error);
          results.errors.push(`創建配對記錄失敗: ${result.itemName}`);
        }
      }

      // 2. 更新庫存數量
      for (const result of matchingResults.filter(r => r.status !== 'not_matched')) {
        try {
          const allSupplies = await supplyService.getSupplies();
          const matchingSupply = allSupplies.find(supply => 
            supply.name.toLowerCase().includes(result.itemName.toLowerCase())
          );

          if (matchingSupply) {
            const updatedSupply = {
              ...matchingSupply,
              currentStock: matchingSupply.currentStock - result.matchedQuantity
            };
            await supplyService.updateSupply(matchingSupply.supplyId, updatedSupply);
            results.stockUpdated++;
          }
        } catch (error) {
          console.error(`更新庫存失敗 (物資: ${result.itemName}):`, error);
          results.errors.push(`更新庫存失敗: ${result.itemName}`);
        }
      }

      // 3. 更新需求狀態
      for (const result of matchingResults) {
        try {
          await supplyService.approveRegularSuppliesNeed(result.needId);
          results.needStatusUpdated++;
        } catch (error) {
          console.error(`更新需求狀態失敗 (需求ID: ${result.needId}):`, error);
          results.errors.push(`更新需求狀態失敗: ${result.itemName}`);
        }
      }

      // 4. 創建分發批次記錄
      try {
        const matchIds = matchingResults
          .filter(r => r.status !== 'not_matched')
          .map((_, index) => index + 1);
        
        const createBatchRequest: CreateDistributionBatchRequest = {
          distributionDate: new Date().toISOString(),
          caseCount: matchingResults.length,
          totalSupplyItems: matchingResults.reduce((sum, r) => sum + r.matchedQuantity, 0),
          createdByWorkerId: 1,
          notes: `${getCurrentMonth()} 自動分發批次，共處理 ${matchingResults.length} 個申請`,
          matchIds: matchIds
        };
        
        const batchResult = await distributionBatchService.createDistributionBatch(createBatchRequest);
        await distributionBatchService.approveDistributionBatch(batchResult.id, {
          approvedByWorkerId: 1
        });
        
        results.batchCreated = true;
      } catch (error) {
        console.error('創建分發批次記錄失敗:', error);
        results.errors.push('創建分發批次記錄失敗');
      }

      // 重新載入資料
      try {
        await loadRealData();
      } catch (error) {
        console.error('重新載入資料失敗:', error);
      }
      
      // 顯示結果
      const fullyMatchedCount = matchingResults.filter(r => r.status === 'fully_matched').length;
      const partialCount = matchingResults.filter(r => r.status === 'partially_matched').length;
      const failedCount = matchingResults.filter(r => r.status === 'not_matched').length;
      
      const message = `
📊 分發完成統計：
• 完全配對：${fullyMatchedCount} 項
• 部分配對：${partialCount} 項（保持批准狀態，等待下次配發）
• 無法配對：${failedCount} 項（保持批准狀態，等待下次配發）

🔄 系統操作結果：
• 配對記錄創建：${results.matchCreated} 筆
• 庫存更新：${results.stockUpdated} 筆
• 需求狀態更新：${results.needStatusUpdated} 筆
• 分發批次記錄：${results.batchCreated ? '成功' : '失敗'}

${results.errors.length > 0 ? `❌ 錯誤：\n${results.errors.join('\n')}` : ''}
      `;
      
      alert(message);
      setOrderConfirmationOpen(false);
      
      // 刷新分發批次歷史記錄
      setBatchHistoryRefresh(prev => prev + 1);
    } catch (error) {
      console.error('確認訂單失敗:', error);
      alert('確認訂單失敗，請稍後重試');
    }
  };

  const handleMatchingDecision = (matchingId: number, decision: 'approved' | 'rejected') => {
    console.log(`媒合決定: ${matchingId} - ${decision}`);
    alert(`媒合已${decision === 'approved' ? '批准' : '拒絕'}！`);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待處理';
      case 'approved': return '已批准';
      case 'rejected': return '已拒絕';
      case 'completed': return '已完成';
      default: return status;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return THEME_COLORS.ERROR;
      case 'medium': return THEME_COLORS.WARNING;
      case 'low': return THEME_COLORS.SUCCESS;
      default: return THEME_COLORS.TEXT_SECONDARY;
    }
  };

  const getMatchingScoreColor = (score: number) => {
    if (score >= 90) return THEME_COLORS.SUCCESS;
    if (score >= 70) return THEME_COLORS.WARNING;
    return THEME_COLORS.ERROR;
  };

  const filteredMatchingRecords = isEmergencySupply ? matchingRecords : [];

  return (
    <Box sx={{ width: '100%', p: getResponsiveSpacing('md') }}>
      {isCalculating ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '400px',
          textAlign: 'center'
        }}>
          <CircularProgress size={60} sx={{ mb: 3, color: THEME_COLORS.SUCCESS }} />
          <Typography variant="h6" sx={{ color: THEME_COLORS.PRIMARY, mb: 2 }}>
            🔄 執行自動分配中...
          </Typography>
          <Typography variant="body1" sx={{ color: THEME_COLORS.TEXT_MUTED }}>
            請稍候，系統正在分析所有變數...
          </Typography>
        </Box>
      ) : (
        <>
          {/* 分配操作區域 */}
          <Paper elevation={1} sx={{ 
            p: getResponsiveSpacing('md'),
            mb: 3,
            bgcolor: THEME_COLORS.PRIMARY_LIGHT_BG,
            border: `1px solid ${THEME_COLORS.PRIMARY}`,
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: THEME_COLORS.SUCCESS,
                  color: 'white'
                }}>
                  <Calculate sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{
                    fontWeight: 600,
                    color: THEME_COLORS.SUCCESS,
                    mb: 0.5
                  }}>
                    {getCurrentMonth()} 物資分配
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: THEME_COLORS.TEXT_MUTED,
                    fontSize: '0.875rem'
                  }}>
                    針對已批准的申請進行自動物資配發媒合
                  </Typography>
                </Box>
              </Box>
              
              <Button
                variant="contained"
                startIcon={<Calculate />}
                onClick={() => setDistributionModalOpen(true)}
                sx={{
                  bgcolor: THEME_COLORS.SUCCESS,
                  color: 'white',
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: THEME_COLORS.SUCCESS_DARK,
                  }
                }}
              >
                🚀 啟動自動分配
              </Button>
            </Box>
          </Paper>

          {/* 搜尋和篩選區域 */}
          <Paper elevation={1} sx={{ p: getResponsiveSpacing('md'), mb: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              alignItems: 'center',
              flexDirection: { xs: 'column', sm: 'row' },
              mb: 2
            }}>
              <Select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                displayEmpty
                sx={{ 
                  minWidth: 200,
                  '& .MuiSelect-select': {
                    py: 1.5,
                  }
                }}
              >
                <MenuItem value="">分配日期</MenuItem>
                <MenuItem value="個案姓名">個案姓名</MenuItem>
                <MenuItem value="物資名稱">物資名稱</MenuItem>
                <MenuItem value="媒合狀態">媒合狀態</MenuItem>
              </Select>
              
              <TextField
                placeholder="請輸入分配日期"
                value={searchContent}
                onChange={(e) => setSearchContent(e.target.value)}
                sx={{ 
                  flexGrow: 1,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: THEME_COLORS.TEXT_SECONDARY,
                    },
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: THEME_COLORS.TEXT_MUTED }} />
                    </InputAdornment>
                  ),
                }}
              />
              
              <Button
                variant="contained"
                startIcon={<Search />}
                onClick={handleSearch}
                sx={{
                  bgcolor: THEME_COLORS.PRIMARY,
                  color: 'white',
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: THEME_COLORS.PRIMARY_DARK,
                  }
                }}
              >
                搜尋
              </Button>
            </Box>
          </Paper>

          {/* 緊急物資媒合功能 */}
          {isEmergencySupply && (
            <>
              {/* 媒合統計區域 */}
              <Paper elevation={1} sx={{ 
                p: getResponsiveSpacing('md'),
                mb: 3,
                bgcolor: THEME_COLORS.ERROR_LIGHT,
                border: `1px solid ${THEME_COLORS.ERROR}`,
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: THEME_COLORS.ERROR,
                      color: 'white'
                    }}>
                      <Warning sx={{ fontSize: 24 }} />
                    </Box>
                          <Box>
                      <Typography variant="h6" sx={{
                        fontWeight: 600,
                        color: THEME_COLORS.ERROR,
                        mb: 0.5
                      }}>
                        📋 物資自動媒合
                            </Typography>
                      <Typography variant="body2" sx={{ 
                        color: THEME_COLORS.TEXT_MUTED,
                        fontSize: '0.875rem'
                      }}>
                        系統自動分析需求與庫存，推薦最佳配對方案
                            </Typography>
                          </Box>
                        </Box>
                  
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 700,
                        color: THEME_COLORS.ERROR,
                        mb: 0.5
                      }}>
                        {filteredMatchingRecords.filter(r => r.status === 'pending').length}
                          </Typography>
                      <Typography variant="caption" sx={{ 
                        color: THEME_COLORS.TEXT_MUTED,
                        fontSize: '0.75rem'
                      }}>
                        待處理媒合
                          </Typography>
                        </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 700,
                        color: THEME_COLORS.SUCCESS,
                        mb: 0.5
                      }}>
                        {filteredMatchingRecords.filter(r => r.status === 'approved').length}
                          </Typography>
                      <Typography variant="caption" sx={{ 
                        color: THEME_COLORS.TEXT_MUTED,
                        fontSize: '0.75rem'
                      }}>
                        已批准媒合
                          </Typography>
                        </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 700,
                        color: THEME_COLORS.WARNING,
                        mb: 0.5
                      }}>
                        {(filteredMatchingRecords.reduce((sum, r) => sum + r.matchingScore, 0) / filteredMatchingRecords.length || 0).toFixed(0)}%
                          </Typography>
                        <Typography variant="caption" sx={{ 
                          color: THEME_COLORS.TEXT_MUTED,
                        fontSize: '0.75rem'
                        }}>
                        平均媒合度
                        </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>

              {/* 媒合記錄表格 */}
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>申請編號</TableCell>
                      <TableCell>個案姓名</TableCell>
                      <TableCell>申請物品</TableCell>
                      <TableCell>數量</TableCell>
                      <TableCell>緊急程度</TableCell>
                      <TableCell>媒合度</TableCell>
                      <TableCell>狀態</TableCell>
                      <TableCell>操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredMatchingRecords.map((matching) => (
                      <React.Fragment key={matching.id}>
                        <TableRow hover>
                          <TableCell>{matching.emergencyRequestId}</TableCell>
                          <TableCell>{matching.caseName}</TableCell>
                          <TableCell>{matching.requestedItem}</TableCell>
                          <TableCell>{matching.requestedQuantity} {matching.unit}</TableCell>
                      <TableCell>
                        <Chip
                              label={matching.urgencyLevel} 
                          size="small"
                          sx={{
                            bgcolor: getUrgencyColor(matching.urgencyLevel),
                            color: 'white',
                                fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell>
                            <Typography 
                              variant="body2" 
                          sx={{
                                color: getMatchingScoreColor(matching.matchingScore),
                                fontWeight: 600
                              }}
                            >
                              {matching.matchingScore}%
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={getStatusText(matching.status)} 
                              size="small"
                              sx={getStatusStyle(matching.status)}
                        />
                      </TableCell>
                      <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                                variant="contained"
                                color="success"
                              onClick={() => handleMatchingDecision(matching.id, 'approved')}
                              sx={{
                                  minWidth: 60,
                                  textTransform: 'none',
                                fontSize: '0.75rem'
                              }}
                            >
                              批准
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                                color="error"
                              onClick={() => handleMatchingDecision(matching.id, 'rejected')}
                              sx={{
                                  minWidth: 60,
                                  textTransform: 'none',
                                fontSize: '0.75rem'
                              }}
                            >
                              拒絕
                            </Button>
                          <IconButton
                            size="small"
                            onClick={() => toggleRowExpansion(matching.id)}
                          >
                            {expandedRows.includes(matching.id) ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                            </Box>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                          <TableCell colSpan={8} sx={{ p: 0 }}>
                        <Collapse in={expandedRows.includes(matching.id)}>
                              <Box sx={{ p: 3, bgcolor: THEME_COLORS.BACKGROUND_SECONDARY }}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                              📋 自動媒合詳情
                            </Typography>
                                <Typography variant="body2" sx={{ color: THEME_COLORS.TEXT_MUTED }}>
                              媒合日期：{matching.matchedDate}
                            </Typography>
                                <Typography variant="body2" sx={{ color: THEME_COLORS.TEXT_MUTED }}>
                                  庫存位置：{matching.stockLocation}
                                </Typography>
                                <Typography variant="body2" sx={{ color: THEME_COLORS.TEXT_MUTED }}>
                              媒合依據：緊急程度({matching.urgencyLevel}) + 庫存充足度 + 地理位置 + 歷史配對成功率
                            </Typography>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
          )}
        
          {/* 歷史記錄 */}
          <Box sx={{ mt: 4 }}>
           
            {batchLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Box>
            ) : batchError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {batchError}
              </Alert>
            ) : (
              <TableContainer component={Paper}>
            <Table>
              <TableHead>
                    <TableRow>
                      <TableCell>批次ID</TableCell>
                      <TableCell>分發日期</TableCell>
                      <TableCell>個案數</TableCell>
                      <TableCell>物資件數</TableCell>
                      <TableCell>狀態</TableCell>
                      <TableCell>創建者</TableCell>
                      <TableCell>創建時間</TableCell>
                      <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                    {batches.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <Assignment sx={{ fontSize: 48, color: THEME_COLORS.TEXT_MUTED }} />
                            <Typography variant="h6" sx={{ color: THEME_COLORS.TEXT_MUTED }}>
                              尚無分發歷史記錄
                            </Typography>
                            <Typography variant="body2" sx={{ color: THEME_COLORS.TEXT_MUTED }}>
                              執行自動分配後，這裡將顯示物資分發的歷史記錄
                          </Typography>
                        </Box>
                      </TableCell>
                      </TableRow>
                    ) : (
                      batches.map((batch) => (
                        <React.Fragment key={batch.distributionBatchId}>
                          <TableRow hover>
                            <TableCell>{batch.distributionBatchId}</TableCell>
                      <TableCell>
                              {new Date(batch.distributionDate).toLocaleDateString()}
                      </TableCell>
                            <TableCell>{batch.caseCount}</TableCell>
                            <TableCell>{batch.totalSupplyItems}</TableCell>
                      <TableCell>
                              {getBatchStatusChip(batch.status)}
                            </TableCell>
                            <TableCell>{batch.createdByWorker}</TableCell>
                            <TableCell>
                              {new Date(batch.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                                  onClick={() => handleViewBatchDetail(batch.distributionBatchId)}
                                  disabled={loadingDetail}
                                  title="查看詳情"
                        >
                                  <Visibility />
                        </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDownloadReport(batch)}
                                  title="下載報告"
                                >
                                  <GetApp />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => toggleBatchRowExpansion(batch.distributionBatchId)}
                                >
                                  {batchExpandedRows.includes(batch.distributionBatchId) ? <ExpandLess /> : <ExpandMore />}
                                </IconButton>
                              </Box>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                            <TableCell colSpan={8} sx={{ p: 0 }}>
                              <Collapse in={batchExpandedRows.includes(batch.distributionBatchId)}>
                                <Box sx={{ p: 3, bgcolor: THEME_COLORS.BACKGROUND_SECONDARY }}>
                                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                    📋 批次詳細資訊
                            </Typography>
                                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
                                    <Box>
                                      <Typography variant="body2" color="text.secondary">
                                        批准者: {batch.approvedByWorker || '未批准'}
                              </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        批准時間: {batch.approvedAt ? new Date(batch.approvedAt).toLocaleString() : '未批准'}
                              </Typography>
                                    </Box>
                                    <Box>
                                      <Typography variant="body2" color="text.secondary">
                                        配對記錄數: {batch.matchCount}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        備註: {batch.notes || '無'}
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
            )}
          </Box>
        </>
      )}

      {/* 自動分配確認對話框 */}
      <Modal
        open={distributionModalOpen}
        onClose={() => setDistributionModalOpen(false)}
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 400 },
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4
        }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            🚀 確認啟動自動分配
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: THEME_COLORS.TEXT_MUTED }}>
            系統將處理所有已批准的申請，根據以下條件進行自動分配：
          </Typography>
          <Box component="ul" sx={{ mb: 2, pl: 2 }}>
            <li>庫存充足度 (40%)</li>
            <li>物資匹配度 (30%)</li>
            <li>地理位置 (20%)</li>
            <li>歷史成功率 (10%)</li>
          </Box>
          <Typography variant="body2" sx={{ mb: 3, color: THEME_COLORS.WARNING }}>
            本次自動計算將針對 {getCurrentMonth()} 的<strong>已批准申請</strong>進行物資分配
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            <strong>注意：</strong>只有狀態為「批准」的申請才會被納入自動分配。<br/>
            系統將根據庫存情況進行智能配對，無法完全滿足的申請將保持「批准」狀態。
          </Alert>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => setDistributionModalOpen(false)}
              sx={{ textTransform: 'none' }}
            >
              取消
            </Button>
            <Button
              variant="contained"
              onClick={handleStartDistribution}
              sx={{
                bgcolor: THEME_COLORS.SUCCESS,
                textTransform: 'none',
                '&:hover': {
                  bgcolor: THEME_COLORS.SUCCESS_DARK,
                }
              }}
            >
              確認啟動
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* 訂單確認對話框 */}
      <Dialog
        open={orderConfirmationOpen}
        onClose={() => setOrderConfirmationOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            📋 自動分配結果確認
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            系統已完成自動分配分析，以下是配對結果：
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>個案姓名</TableCell>
                  <TableCell>申請物品</TableCell>
                  <TableCell>申請數量</TableCell>
                  <TableCell>配對數量</TableCell>
                  <TableCell>配對狀態</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {matchingResults.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell>{result.caseName}</TableCell>
                    <TableCell>{result.itemName}</TableCell>
                    <TableCell>{result.requestedQuantity}</TableCell>
                    <TableCell>{result.matchedQuantity}</TableCell>
                    <TableCell>
                      <Chip 
                        label={
                          result.status === 'fully_matched' ? '完全配對' :
                          result.status === 'partially_matched' ? '部分配對' : '無法配對'
                        }
                        size="small"
                        color={
                          result.status === 'fully_matched' ? 'success' :
                          result.status === 'partially_matched' ? 'warning' : 'error'
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOrderConfirmationOpen(false)}
            variant="outlined"
            sx={{ textTransform: 'none' }}
          >
            取消
          </Button>
          <Button
            onClick={handleConfirmOrder}
            variant="contained"
            color="primary"
            startIcon={<CheckCircle />}
          >
            確認訂單
          </Button>
        </DialogActions>
      </Dialog>

      {/* 批次詳細信息對話框 */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            分發批次詳情 #{selectedBatch?.distributionBatchId}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {loadingDetail ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : selectedBatch && (
            <Box>
              <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  📋 批次基本信息
          </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
                  <Box>
                    <Typography variant="body2"><strong>分發日期:</strong> {new Date(selectedBatch.distributionDate).toLocaleDateString()}</Typography>
                    <Typography variant="body2"><strong>處理個案數:</strong> {selectedBatch.caseCount}</Typography>
                    <Typography variant="body2"><strong>總物資件數:</strong> {selectedBatch.totalSupplyItems}</Typography>
        </Box>
                  <Box>
                    <Typography variant="body2"><strong>狀態:</strong> {selectedBatch.status === 'pending' ? '等待批准' : '已完成'}</Typography>
                    <Typography variant="body2"><strong>創建者:</strong> {selectedBatch.createdByWorker}</Typography>
                    <Typography variant="body2"><strong>批准者:</strong> {selectedBatch.approvedByWorker || '未批准'}</Typography>
                  </Box>
                </Box>
                {selectedBatch.notes && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2"><strong>備註:</strong> {selectedBatch.notes}</Typography>
                  </Box>
                )}
              </Paper>

              <Paper elevation={1} sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  📦 配對記錄詳情
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>申請人</TableCell>
                        <TableCell>物品名稱</TableCell>
                        <TableCell>申請數量</TableCell>
                        <TableCell>配對數量</TableCell>
                        <TableCell>申請日期</TableCell>
                        <TableCell>配對日期</TableCell>
                        <TableCell>備註</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedBatch.matches.map((match, index) => (
                        <TableRow key={index}>
                          <TableCell>{match.caseName}</TableCell>
                          <TableCell>{match.supplyName}</TableCell>
                          <TableCell>{match.requestedQuantity}</TableCell>
                          <TableCell>{match.matchedQuantity}</TableCell>
                          <TableCell>{new Date(match.requestedDate).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(match.matchDate).toLocaleDateString()}</TableCell>
                          <TableCell>{match.note || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>
            關閉
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DistributionTab; 