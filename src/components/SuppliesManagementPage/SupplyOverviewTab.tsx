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
  Card,
  CardContent,
  LinearProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { 
  Search,
  Edit,
  ExpandMore,
  ExpandLess,
  Inventory,
  Warning,
  CheckCircle,
  Schedule,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { THEME_COLORS } from '../../styles/theme';
import { 
  commonStyles,
  getStatusStyle,
  getValidationStyle,
  getResponsiveSpacing
} from '../../styles/commonStyles';

interface SupplyItem {
  id: number;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  status: 'sufficient' | 'low' | 'critical';
  lastUpdated: string;
  location: string;
  supplier: string;
  cost: number;
}

interface SupplyRequest {
  id: number;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  urgency: 'low' | 'medium' | 'high';
  requestedBy: string;
  department: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  estimatedCost: number;
}

const SupplyOverviewTab: React.FC = () => {
  const [searchType, setSearchType] = useState('物品名稱');
  const [searchContent, setSearchContent] = useState('');
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  
  // 模擬庫存資料
  const [inventoryData] = useState<SupplyItem[]>([
    {
      id: 1,
      name: 'A4 白紙',
      category: '辦公用品',
      currentStock: 50,
      minStock: 20,
      maxStock: 100,
      unit: '包',
      status: 'sufficient',
      lastUpdated: '2024-01-15',
      location: '倉庫A-01',
      supplier: '辦公用品商店',
      cost: 80
    },
    {
      id: 2,
      name: '清潔用酒精',
      category: '清潔用品',
      currentStock: 5,
      minStock: 10,
      maxStock: 30,
      unit: '瓶',
      status: 'low',
      lastUpdated: '2024-01-14',
      location: '倉庫B-03',
      supplier: '醫療用品公司',
      cost: 150
    },
    {
      id: 3,
      name: '口罩',
      category: '醫療用品',
      currentStock: 2,
      minStock: 15,
      maxStock: 50,
      unit: '盒',
      status: 'critical',
      lastUpdated: '2024-01-13',
      location: '倉庫C-01',
      supplier: '防疫用品商',
      cost: 300
    },
    {
      id: 4,
      name: '原子筆',
      category: '辦公用品',
      currentStock: 80,
      minStock: 30,
      maxStock: 120,
      unit: '支',
      status: 'sufficient',
      lastUpdated: '2024-01-16',
      location: '倉庫A-02',
      supplier: '文具批發商',
      cost: 25
    }
  ]);

  // 模擬申請資料
  const [requestData] = useState<SupplyRequest[]>([
    {
      id: 1,
      itemName: '影印紙',
      category: '辦公用品',
      quantity: 10,
      unit: '包',
      urgency: 'medium',
      requestedBy: '張小明',
      department: '行政部',
      requestDate: '2024-01-15',
      status: 'pending',
      estimatedCost: 800
    },
    {
      id: 2,
      itemName: '洗手液',
      category: '清潔用品',
      quantity: 5,
      unit: '瓶',
      urgency: 'high',
      requestedBy: '李小花',
      department: '社工部',
      requestDate: '2024-01-14',
      status: 'approved',
      estimatedCost: 250
    },
    {
      id: 3,
      itemName: '體溫計',
      category: '醫療用品',
      quantity: 2,
      unit: '個',
      urgency: 'high',
      requestedBy: '王小華',
      department: '醫務室',
      requestDate: '2024-01-13',
      status: 'completed',
      estimatedCost: 600
    }
  ]);

  const handleSearch = () => {
    console.log('搜尋條件:', { searchType, searchContent });
    // TODO: 實作搜尋邏輯
  };

  const toggleRowExpansion = (id: number) => {
    setExpandedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // 搜尋類型選項
  const searchTypeOptions = ['物品名稱', '類別', '供應商', '位置'];

  // 狀態顏色配置
  const getInventoryStatusColor = (status: string) => {
    switch (status) {
      case 'sufficient': return THEME_COLORS.SUCCESS;
      case 'low': return THEME_COLORS.WARNING;
      case 'critical': return THEME_COLORS.ERROR;
      case 'pending': return THEME_COLORS.INFO;
      case 'approved': return THEME_COLORS.SUCCESS;
      case 'rejected': return THEME_COLORS.ERROR;
      case 'completed': return THEME_COLORS.DISABLED_TEXT;
      default: return THEME_COLORS.DISABLED_TEXT;
    }
  };

  const getStatusLabel = (status: string, type: 'inventory' | 'request') => {
    if (type === 'inventory') {
      switch (status) {
        case 'sufficient': return '充足';
        case 'low': return '偏低';
        case 'critical': return '緊急';
        default: return '未知';
      }
    } else {
      switch (status) {
        case 'pending': return '待審核';
        case 'approved': return '已核准';
        case 'rejected': return '已拒絕';
        case 'completed': return '已完成';
        default: return '未知';
      }
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return THEME_COLORS.ERROR;
      case 'medium': return THEME_COLORS.WARNING;
      case 'low': return THEME_COLORS.SUCCESS;
      default: return THEME_COLORS.DISABLED_TEXT;
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'high': return '緊急';
      case 'medium': return '一般';
      case 'low': return '不急';
      default: return '一般';
    }
  };

  // 計算庫存進度百分比
  const getStockPercentage = (current: number, min: number, max: number) => {
    return Math.min(100, (current / max) * 100);
  };

  // 統計資料
  const stats = {
    totalItems: inventoryData.length,
    lowStock: inventoryData.filter(item => item.status === 'low').length,
    criticalStock: inventoryData.filter(item => item.status === 'critical').length,
    pendingRequests: requestData.filter(req => req.status === 'pending').length,
  };

  return (
    <Box>
      {/* 統計卡片 */}
      <Box 
        display="flex" 
        flexWrap="wrap" 
        gap={3} 
        sx={{ mb: 4 }}
      >
        <Card sx={{ ...commonStyles.statsCard, flex: '1 1 200px', minWidth: 200 }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom sx={commonStyles.cardLabel}>
                  總物品數
                </Typography>
                <Typography variant="h4" component="div" sx={commonStyles.cardValue}>
                  {stats.totalItems}
                </Typography>
              </Box>
              <Inventory sx={{ fontSize: 40, color: THEME_COLORS.INFO }} />
            </Box>
          </CardContent>
        </Card>



        <Card sx={{ ...commonStyles.statsCard, flex: '1 1 200px', minWidth: 200 }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom sx={commonStyles.cardLabel}>
                  待審申請
                </Typography>
                <Typography variant="h4" component="div" sx={commonStyles.cardValue}>
                  {stats.pendingRequests}
                </Typography>
              </Box>
              <Schedule sx={{ fontSize: 40, color: THEME_COLORS.INFO }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* 分頁標籤 */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              minHeight: 48,
            },
            '& .MuiTabs-indicator': {
              backgroundColor: THEME_COLORS.PRIMARY,
              height: 3,
            },
            '& .Mui-selected': {
              color: `${THEME_COLORS.PRIMARY} !important`,
              fontWeight: 600,
            },
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Tab label="庫存管理" />
          <Tab label="申請記錄" />
        </Tabs>
      </Box>

      {/* 搜尋區域 */}
      <Paper elevation={1} sx={{ ...commonStyles.formSection }}>
        <Typography variant="h6" sx={{ ...commonStyles.formHeader, mb: 3 }}>
          搜尋條件
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <Select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            size="small"
            sx={{ ...commonStyles.formSelect, minWidth: 120 }}
          >
            {searchTypeOptions.map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
          <TextField
            placeholder={`請輸入${searchType}`}
            value={searchContent}
            onChange={(e) => setSearchContent(e.target.value)}
            size="small"
            sx={{ ...commonStyles.formInput, flex: 1, minWidth: 250 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Search sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            size="small"
            startIcon={<Search />}
            sx={{
              ...commonStyles.primaryButton,
              px: 3,
              py: 1
            }}
          >
            搜尋
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setSearchContent('');
              setSearchType('物品名稱');
            }}
            size="small"
            sx={{
              ...commonStyles.secondaryButton,
              px: 3,
              py: 1
            }}
          >
            重置
          </Button>
        </Box>
      </Paper>

      {/* 內容區域 */}
      {activeTab === 0 ? (
        // 庫存管理表格
        <Paper elevation={1} sx={{ ...commonStyles.formSection, borderRadius: 2 }}>
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ ...commonStyles.cardTitle }}>
              庫存管理 ({inventoryData.length} 項物品)
            </Typography>
          </Box>
          <TableContainer sx={{ 
            maxWidth: '100%',
            overflowX: 'auto',
            '& .MuiTable-root': {
              minWidth: { xs: 700, sm: 800, md: 900 },
              width: '100%'
            }
          }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell width="50" sx={commonStyles.tableHeader}>
                    展開
                  </TableCell>
                  <TableCell sx={commonStyles.tableHeader}>
                    物品名稱
                  </TableCell>
                  <TableCell sx={commonStyles.tableHeader}>
                    類別
                  </TableCell>
                  <TableCell sx={commonStyles.tableHeader}>
                    庫存狀況
                  </TableCell>
                  <TableCell sx={commonStyles.tableHeader}>
                    當前數量
                  </TableCell>
                  <TableCell sx={commonStyles.tableHeader}>
                    狀態
                  </TableCell>
                  <TableCell sx={commonStyles.tableHeader} width="100">
                    操作
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inventoryData.map((item) => (
                  <React.Fragment key={item.id}>
                    <TableRow hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => toggleRowExpansion(item.id)}
                          sx={{ 
                            color: 'text.secondary',
                            '&:hover': { bgcolor: 'action.selected' }
                          }}
                        >
                          {expandedRows.includes(item.id) ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500} color="text.primary">
                          {item.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {item.category}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ width: 100 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={getStockPercentage(item.currentStock, item.minStock, item.maxStock)}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: 'action.selected',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: getInventoryStatusColor(item.status),
                                borderRadius: 4,
                              }
                            }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                            {item.currentStock}/{item.maxStock}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {item.currentStock} {item.unit}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(item.status, 'inventory')}
                          size="small"
                          sx={{
                            bgcolor: getInventoryStatusColor(item.status),
                            color: 'white',
                            fontWeight: 500,
                            minWidth: 60,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          sx={{ 
                            color: THEME_COLORS.PRIMARY,
                            '&:hover': { bgcolor: THEME_COLORS.PRIMARY_TRANSPARENT }
                          }}
                        >
                          <Edit />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                        <Collapse in={expandedRows.includes(item.id)} timeout="auto" unmountOnExit>
                          <Box sx={{ 
                            margin: 2, 
                            p: 3, 
                            bgcolor: 'action.hover', 
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider'
                          }}>
                            <Typography variant="subtitle2" gutterBottom sx={{ 
                              ...commonStyles.cardTitle,
                              mb: 2
                            }}>
                              詳細資訊
                            </Typography>
                            <Box sx={{ 
                              display: 'grid', 
                              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                              gap: 2
                            }}>
                              <Typography variant="body2" color="text.secondary">
                                <strong>最低庫存：</strong>{item.minStock} {item.unit}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <strong>最高庫存：</strong>{item.maxStock} {item.unit}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <strong>存放位置：</strong>{item.location}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <strong>供應商：</strong>{item.supplier}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <strong>單價：</strong>NT$ {item.cost}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <strong>最後更新：</strong>{item.lastUpdated}
                              </Typography>
                            </Box>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        // 申請記錄表格
        <Paper elevation={1} sx={{ ...commonStyles.formSection, borderRadius: 2 }}>
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ ...commonStyles.cardTitle }}>
              申請記錄 ({requestData.length} 筆申請)
            </Typography>
          </Box>
          <TableContainer sx={{ 
            maxWidth: '100%',
            overflowX: 'auto',
            '& .MuiTable-root': {
              minWidth: { xs: 600, sm: 700, md: 800 },
              width: '100%'
            }
          }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={commonStyles.tableHeader}>
                    物品名稱
                  </TableCell>
                  <TableCell sx={commonStyles.tableHeader}>
                    數量
                  </TableCell>
                  <TableCell sx={commonStyles.tableHeader}>
                    緊急程度
                  </TableCell>
                  <TableCell sx={commonStyles.tableHeader}>
                    申請人
                  </TableCell>
                  <TableCell sx={commonStyles.tableHeader}>
                    申請日期
                  </TableCell>
                  <TableCell sx={commonStyles.tableHeader}>
                    狀態
                  </TableCell>
                  <TableCell sx={commonStyles.tableHeader}>
                    預估費用
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requestData.map((request) => (
                  <TableRow key={request.id} hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500} color="text.primary">
                        {request.itemName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {request.category}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {request.quantity} {request.unit}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getUrgencyLabel(request.urgency)}
                        size="small"
                        sx={{
                          bgcolor: getUrgencyColor(request.urgency),
                          color: 'white',
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {request.requestedBy}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {request.department}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {request.requestDate}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(request.status, 'request')}
                        size="small"
                        sx={{
                          bgcolor: getInventoryStatusColor(request.status),
                          color: 'white',
                          fontWeight: 500,
                          minWidth: 60,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        NT$ {request.estimatedCost.toLocaleString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default SupplyOverviewTab; 