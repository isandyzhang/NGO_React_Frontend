import React, { useState } from 'react';
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
  Card,
  CardContent,
  Divider,
  Alert,
} from '@mui/material';
import { 
  Search,
  ExpandMore,
  ExpandLess,
  Calculate,
  CheckCircle,
  Cancel,
  Person,
  CalendarToday,
  Warning,
} from '@mui/icons-material';
import { THEME_COLORS } from '../../styles/theme';
import { 
  getStatusStyle,
  getResponsiveSpacing
} from '../../styles/commonStyles';

interface DistributionRecord {
  id: number;
  distributionDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  totalCases: number;
  totalItems: number;
  createdBy: string;
  approvedBy?: string;
  completedDate?: string;
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

interface DistributionTabProps {
  isEmergencySupply?: boolean;
}

const DistributionTab: React.FC<DistributionTabProps> = ({ 
  isEmergencySupply = false 
}) => {
  const [searchType, setSearchType] = useState(isEmergencySupply ? '個案姓名' : '分配日期');
  const [searchContent, setSearchContent] = useState('');
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [distributionModalOpen, setDistributionModalOpen] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // 模擬發放記錄資料（常駐物資）
  const [distributionRecords] = useState<DistributionRecord[]>([
    {
      id: 1,
      distributionDate: '2024-01-15',
      status: 'completed',
      totalCases: 8,
      totalItems: 25,
      createdBy: '張管理員',
      approvedBy: '李主管',
      completedDate: '2024-01-16'
    },
    {
      id: 2,
      distributionDate: '2024-01-01',
      status: 'completed',
      totalCases: 12,
      totalItems: 35,
      createdBy: '王管理員',
      approvedBy: '李主管',
      completedDate: '2024-01-02'
    }
  ]);

  // 模擬媒合記錄資料（緊急物資）
  const [matchingRecords] = useState<MatchingRecord[]>([
    {
      id: 1,
      emergencyRequestId: 'EMG001',
      caseName: '張小明',
      caseId: 'CASE001',
      requestedItem: 'A4 白紙',
      requestedQuantity: 5,
      unit: '包',
      urgencyLevel: 'high',
      availableStock: 12,
      stockLocation: '倉庫A-架位3',
      matchingScore: 95,
      status: 'pending',
      requestDate: '2024-01-18',
      matchedDate: '2024-01-18'
    },
    {
      id: 2,
      emergencyRequestId: 'EMG002',
      caseName: '李小花',
      caseId: 'CASE002',
      requestedItem: '清潔用酒精',
      requestedQuantity: 2,
      unit: '瓶',
      urgencyLevel: 'high',
      availableStock: 8,
      stockLocation: '倉庫B-架位1',
      matchingScore: 88,
      status: 'approved',
      requestDate: '2024-01-17',
      matchedDate: '2024-01-17'
    },
    {
      id: 3,
      emergencyRequestId: 'EMG003',
      caseName: '王小強',
      caseId: 'CASE005',
      requestedItem: '原子筆',
      requestedQuantity: 10,
      unit: '支',
      urgencyLevel: 'medium',
      availableStock: 15,
      stockLocation: '倉庫A-架位1',
      matchingScore: 92,
      status: 'pending',
      requestDate: '2024-01-16',
      matchedDate: '2024-01-16'
    },
    {
      id: 4,
      emergencyRequestId: 'EMG004',
      caseName: '陳小美',
      caseId: 'CASE003',
      requestedItem: '洗手乳',
      requestedQuantity: 3,
      unit: '瓶',
      urgencyLevel: 'low',
      availableStock: 5,
      stockLocation: '倉庫B-架位2',
      matchingScore: 75,
      status: 'rejected',
      requestDate: '2024-01-15',
      matchedDate: '2024-01-15'
    }
  ]);

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
    
    setTimeout(() => {
      setIsCalculating(false);
      alert('分配計算完成，請查看結果！');
    }, 2000);
  };

  const handleMatchingDecision = (matchingId: number, decision: 'approved' | 'rejected') => {
    console.log(`媒合決定: ${matchingId} - ${decision}`);
    // TODO: 發送到後端更新媒合狀態
    alert(`媒合已${decision === 'approved' ? '批准' : '拒絕'}！`);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '待審核';
      case 'approved': return '已批准';
      case 'rejected': return '已拒絕';
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



  const getCurrentMonth = () => {
    const date = new Date();
    return `${date.getFullYear()}年${date.getMonth() + 1}月`;
  };

  // 根據物資類型過濾資料
  const filteredRecords = isEmergencySupply ? [] : distributionRecords;
  const filteredMatchingRecords = isEmergencySupply ? matchingRecords : [];

  return (
    <Box sx={{ width: '100%' }}>
      {isEmergencySupply ? (
        // 緊急物資媒合功能
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
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Card variant="outlined" sx={{ p: 2, textAlign: 'center', minWidth: 80 }}>
                  <Typography variant="h6" sx={{ color: THEME_COLORS.ERROR }}>
                    {filteredMatchingRecords.filter(r => r.status === 'pending').length}
                  </Typography>
                  <Typography variant="caption">待審核</Typography>
                </Card>
                <Card variant="outlined" sx={{ p: 2, textAlign: 'center', minWidth: 80 }}>
                  <Typography variant="h6" sx={{ color: THEME_COLORS.SUCCESS }}>
                    {filteredMatchingRecords.filter(r => r.status === 'approved').length}
                  </Typography>
                  <Typography variant="caption">已批准</Typography>
                </Card>
              </Box>
            </Box>
          </Paper>

          {/* 搜尋區域 */}
          <Paper elevation={1} sx={{ 
            p: getResponsiveSpacing('md'),
            mb: 3
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
                sx={{ 
                  minWidth: 120,
                  height: 40
                }}
              >
                <MenuItem value="個案姓名">個案姓名</MenuItem>
                <MenuItem value="物資名稱">物資名稱</MenuItem>
                <MenuItem value="緊急程度">緊急程度</MenuItem>
                <MenuItem value="狀態">狀態</MenuItem>
              </Select>
              
              <TextField
                value={searchContent}
                onChange={(e) => setSearchContent(e.target.value)}
                placeholder="搜尋物資媒合記錄..."
                size="small"
                sx={{ 
                  flex: 1,
                  minWidth: 200,
                  height: 40
                }}
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
                  bgcolor: THEME_COLORS.ERROR,
                  '&:hover': {
                    opacity: 0.8,
                  }
                }}
              >
                搜尋
              </Button>
            </Box>
          </Paper>

          {/* 媒合記錄表格 */}
          <TableContainer component={Paper} elevation={1}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: THEME_COLORS.BACKGROUND_SECONDARY }}>
                  <TableCell sx={{ fontWeight: 600 }}>個案資訊</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>需求物資</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>庫存狀況</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>媒合評分</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>緊急程度</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>狀態</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMatchingRecords.map((matching) => (
                  <React.Fragment key={matching.id}>
                    <TableRow hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person sx={{ fontSize: 16, color: THEME_COLORS.ERROR }} />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {matching.caseName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: THEME_COLORS.TEXT_MUTED }}>
                              {matching.caseId}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {matching.requestedItem}
                          </Typography>
                          <Typography variant="caption" sx={{ color: THEME_COLORS.TEXT_MUTED }}>
                            需求: {matching.requestedQuantity} {matching.unit}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ 
                            fontWeight: 500,
                            color: matching.availableStock >= matching.requestedQuantity 
                              ? THEME_COLORS.SUCCESS 
                              : THEME_COLORS.ERROR 
                          }}>
                            庫存: {matching.availableStock} {matching.unit}
                          </Typography>
                          <Typography variant="caption" sx={{ color: THEME_COLORS.TEXT_MUTED }}>
                            {matching.stockLocation}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 600,
                            color: matching.matchingScore >= 90 ? THEME_COLORS.SUCCESS : 
                                   matching.matchingScore >= 70 ? THEME_COLORS.WARNING : THEME_COLORS.ERROR
                          }}>
                            {matching.matchingScore}
                          </Typography>
                          <Typography variant="caption" sx={{ color: THEME_COLORS.TEXT_MUTED }}>
                            分
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ 
                          display: 'block',
                          color: THEME_COLORS.TEXT_MUTED,
                          fontStyle: 'italic'
                        }}>
                          {matching.matchingScore >= 90 ? '極佳匹配' : 
                           matching.matchingScore >= 70 ? '良好匹配' : '一般匹配'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getUrgencyLabel(matching.urgencyLevel)}
                          size="small"
                          sx={{
                            bgcolor: getUrgencyColor(matching.urgencyLevel),
                            color: 'white',
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(matching.status)}
                          size="small"
                          sx={{
                            bgcolor: getStatusStyle(matching.status).bg,
                            color: getStatusStyle(matching.status).color,
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {matching.status === 'pending' ? (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleMatchingDecision(matching.id, 'approved')}
                              sx={{
                                borderColor: THEME_COLORS.SUCCESS,
                                color: THEME_COLORS.SUCCESS,
                                minWidth: 'auto',
                                px: 1.5,
                                fontSize: '0.75rem'
                              }}
                            >
                              批准
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleMatchingDecision(matching.id, 'rejected')}
                              sx={{
                                borderColor: THEME_COLORS.ERROR,
                                color: THEME_COLORS.ERROR,
                                minWidth: 'auto',
                                px: 1.5,
                                fontSize: '0.75rem'
                              }}
                            >
                              拒絕
                            </Button>
                          </Box>
                        ) : (
                          <IconButton
                            size="small"
                            onClick={() => toggleRowExpansion(matching.id)}
                          >
                            {expandedRows.includes(matching.id) ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={7} sx={{ p: 0 }}>
                        <Collapse in={expandedRows.includes(matching.id)}>
                          <Box sx={{ p: 2, bgcolor: THEME_COLORS.BACKGROUND_SECONDARY }}>
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                              📋 自動媒合詳情
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                              申請編號：{matching.emergencyRequestId}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                              申請日期：{matching.requestDate}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                              媒合日期：{matching.matchedDate}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: THEME_COLORS.TEXT_MUTED,
                              fontStyle: 'italic'
                            }}>
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
                  bgcolor: THEME_COLORS.PRIMARY,
                  color: 'white'
                }}>
                  <Calculate sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{
                    fontWeight: 600,
                    color: THEME_COLORS.PRIMARY,
                    mb: 0.5
                  }}>
                    {getCurrentMonth()} 物資分配
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: THEME_COLORS.TEXT_MUTED,
                    fontSize: '0.875rem'
                  }}>
                    根據個案需求和物資庫存進行自動分配
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<Calculate />}
                  onClick={() => setDistributionModalOpen(true)}
                  sx={{
                    bgcolor: THEME_COLORS.PRIMARY,
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                  }}
                >
                  🚀 啟動自動分配
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* 搜尋區域 */}
          <Paper elevation={1} sx={{ 
            p: getResponsiveSpacing('md'),
            mb: 3
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
                sx={{ 
                  minWidth: 120,
                  height: 40
                }}
              >
                <MenuItem value="分配日期">分配日期</MenuItem>
                <MenuItem value="狀態">狀態</MenuItem>
                <MenuItem value="創建者">創建者</MenuItem>
                <MenuItem value="核准者">核准者</MenuItem>
              </Select>
              
              <TextField
                value={searchContent}
                onChange={(e) => setSearchContent(e.target.value)}
                placeholder="搜尋物資發放記錄..."
                size="small"
                sx={{ 
                  flex: 1,
                  minWidth: 200,
                  height: 40
                }}
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
                  '&:hover': {
                    opacity: 0.8,
                  }
                }}
              >
                搜尋
              </Button>
            </Box>
          </Paper>

          {/* 發放記錄表格 */}
          <TableContainer component={Paper} elevation={1}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: THEME_COLORS.BACKGROUND_SECONDARY }}>
                  <TableCell sx={{ fontWeight: 600 }}>分配日期</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>受惠個案數</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>物資總數</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>創建者</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>狀態</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRecords.map((record) => (
                  <React.Fragment key={record.id}>
                    <TableRow hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarToday sx={{ fontSize: 16, color: THEME_COLORS.PRIMARY }} />
                          <Typography variant="body2">
                            {record.distributionDate}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{record.totalCases} 個案</TableCell>
                      <TableCell>{record.totalItems} 項</TableCell>
                      <TableCell>{record.createdBy}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(record.status)}
                          size="small"
                          sx={{
                            bgcolor: getStatusStyle(record.status).bg,
                            color: getStatusStyle(record.status).color,
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => toggleRowExpansion(record.id)}
                        >
                          {expandedRows.includes(record.id) ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={6} sx={{ p: 0 }}>
                        <Collapse in={expandedRows.includes(record.id)}>
                          <Box sx={{ p: 2, bgcolor: THEME_COLORS.BACKGROUND_SECONDARY }}>
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                              分配詳情
                            </Typography>
                            {record.approvedBy && (
                              <Typography variant="body2" sx={{ mb: 0.5 }}>
                                核准者：{record.approvedBy}
                              </Typography>
                            )}
                            {record.completedDate && (
                              <Typography variant="body2" sx={{ mb: 0.5 }}>
                                完成日期：{record.completedDate}
                              </Typography>
                            )}
                            <Typography variant="body2" sx={{ color: THEME_COLORS.TEXT_MUTED }}>
                              本次分配共服務 {record.totalCases} 個個案，發放 {record.totalItems} 項物資
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

      {/* 分配確認Modal */}
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
          p: 4,
        }}>
          <Typography variant="h6" sx={{ 
            mb: 3,
            fontWeight: 600,
            color: THEME_COLORS.PRIMARY
          }}>
            📋 啟動自動物資分配
          </Typography>
          
          <Typography variant="body2" sx={{ 
            mb: 3,
            color: THEME_COLORS.TEXT_SECONDARY,
            lineHeight: 1.6
          }}>
            系統將根據以下條件進行自動分配：
            <br />• 📊 個案需求優先級分析
            <br />• 📦 實時庫存狀況追蹤
            <br />• 📈 歷史分配成功率統計
            <br />• ⚖️ 公平性權重計算
            <br />• 🎯 最優路徑配送規劃
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
            本次自動計算將針對 {getCurrentMonth()} 進行物資分配規劃
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => setDistributionModalOpen(false)}
            >
              取消
            </Button>
            <Button
              variant="contained"
              onClick={handleStartDistribution}
              sx={{
                bgcolor: THEME_COLORS.PRIMARY,
                color: 'white',
              }}
            >
              🚀 開始自動計算
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* 計算中Modal */}
      <Modal open={isCalculating}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 300 },
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          textAlign: 'center'
        }}>
          <Calculate sx={{ 
            fontSize: 48, 
            color: THEME_COLORS.PRIMARY,
            mb: 2,
            animation: 'spin 1s linear infinite',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' }
            }
          }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            📋 系統正在計算最佳分配方案
          </Typography>
          <Typography variant="body2" sx={{ color: THEME_COLORS.TEXT_MUTED }}>
            系統正在分析所有變數，請稍候...
          </Typography>
        </Box>
      </Modal>
    </Box>
  );
};

export default DistributionTab; 