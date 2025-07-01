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
  Divider,
} from '@mui/material';
import { 
  Search,
  ExpandMore,
  ExpandLess,
  Person,
  Warning,
  Add,
  Delete,
} from '@mui/icons-material';
import { THEME_COLORS } from '../../styles/theme';
import { 
  getStatusStyle,
  getResponsiveSpacing
} from '../../styles/commonStyles';

interface EmergencySupplyRequest {
  id: number;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  urgency: 'low' | 'medium' | 'high';
  requestedBy: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  estimatedCost: number;
  caseName: string;
  caseId: string;
}

const EmergencyRequestTab: React.FC = () => {
  const [searchType, setSearchType] = useState('物品名稱');
  const [searchContent, setSearchContent] = useState('');
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [matchingItems, setMatchingItems] = useState<{[requestId: number]: any[]}>({});
  const [newMatchingItem, setNewMatchingItem] = useState({
    itemName: '',
    category: '',
    quantity: 1,
    unit: '',
    stockLocation: '',
    notes: ''
  });

  // 緊急物資申請資料
  const [requestData] = useState<EmergencySupplyRequest[]>([
    {
      id: 1,
      itemName: '體溫計',
      category: '緊急醫療用品',
      quantity: 3,
      unit: '個',
      urgency: 'high',
      requestedBy: '張小明',
      requestDate: '2024-01-16',
      status: 'pending',
      estimatedCost: 450,
      caseName: '張小明',
      caseId: 'CASE001'
    },
    {
      id: 2,
      itemName: '急救包',
      category: '緊急醫療用品',
      quantity: 1,
      unit: '套',
      urgency: 'high',
      requestedBy: '李小花',
      requestDate: '2024-01-18',
      status: 'approved',
      estimatedCost: 800,
      caseName: '李小花',
      caseId: 'CASE002'
    },
    {
      id: 3,
      itemName: '應急照明燈',
      category: '照明設備',
      quantity: 2,
      unit: '個',
      urgency: 'medium',
      requestedBy: '王小華',
      requestDate: '2024-01-17',
      status: 'pending',
      estimatedCost: 900,
      caseName: '王小華',
      caseId: 'CASE003'
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

  const handleAddMatchingItem = (requestId: number) => {
    if (!newMatchingItem.itemName || !newMatchingItem.quantity) {
      alert('請填寫物品名稱和數量');
      return;
    }

    const matchingItem = {
      ...newMatchingItem,
      id: Date.now(),
      matchedDate: new Date().toISOString().split('T')[0]
    };

    setMatchingItems(prev => ({
      ...prev,
      [requestId]: [...(prev[requestId] || []), matchingItem]
    }));

    // 重設表單
    setNewMatchingItem({
      itemName: '',
      category: '',
      quantity: 1,
      unit: '',
      stockLocation: '',
      notes: ''
    });
  };

  const handleRemoveMatchingItem = (requestId: number, itemId: number) => {
    setMatchingItems(prev => ({
      ...prev,
      [requestId]: prev[requestId]?.filter(item => item.id !== itemId) || []
    }));
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return THEME_COLORS.ERROR;
      case 'medium': return THEME_COLORS.WARNING;
      case 'low': return THEME_COLORS.SUCCESS;
      default: return THEME_COLORS.TEXT_MUTED;
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '待審核';
      case 'approved': return '批准';
      case 'rejected': return '不批准';
      case 'completed': return '已完成';
      default: return '未知';
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* 搜尋區域 */}
      <Paper elevation={1} sx={{ 
        p: getResponsiveSpacing('md'),
        mb: 3,
        bgcolor: THEME_COLORS.ERROR_LIGHT,
        border: `1px solid ${THEME_COLORS.ERROR}`
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
            <MenuItem value="個案">個案</MenuItem>
            <MenuItem value="緊急程度">緊急程度</MenuItem>
          </Select>
          
          <TextField
            value={searchContent}
            onChange={(e) => setSearchContent(e.target.value)}
            placeholder="搜尋緊急物資申請..."
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
              bgcolor: THEME_COLORS.ERROR,
              '&:hover': { bgcolor: THEME_COLORS.ERROR_DARK }
            }}
          >
            搜尋
          </Button>
        </Box>
      </Paper>

      {/* 統計卡片 */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Paper elevation={1} sx={{ p: 2, flex: 1, minWidth: 200 }}>
          <Typography variant="body2" color="textSecondary">高優先度申請</Typography>
          <Typography variant="h4" color={THEME_COLORS.ERROR} sx={{ fontWeight: 600 }}>
            {requestData.filter(item => item.urgency === 'high').length}
          </Typography>
        </Paper>
        <Paper elevation={1} sx={{ p: 2, flex: 1, minWidth: 200 }}>
          <Typography variant="body2" color="textSecondary">待審核申請</Typography>
          <Typography variant="h4" color={THEME_COLORS.WARNING} sx={{ fontWeight: 600 }}>
            {requestData.filter(item => item.status === 'pending').length}
          </Typography>
        </Paper>
        <Paper elevation={1} sx={{ p: 2, flex: 1, minWidth: 200 }}>
          <Typography variant="body2" color="textSecondary">總申請金額</Typography>
          <Typography variant="h4" color={THEME_COLORS.PRIMARY} sx={{ fontWeight: 600 }}>
            ${requestData.reduce((total, item) => total + item.estimatedCost, 0).toLocaleString()}
          </Typography>
        </Paper>
      </Box>

      {/* 申請表格 */}
      <TableContainer component={Paper} elevation={1}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: THEME_COLORS.BACKGROUND_SECONDARY }}>
              <TableCell sx={{ fontWeight: 600 }}>申請人</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>物品名稱</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>分類</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>數量</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>緊急程度</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>申請時間</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>狀態</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requestData.map((request) => (
              <React.Fragment key={request.id}>
                <TableRow hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person sx={{ fontSize: 16, color: THEME_COLORS.ERROR }} />
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
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {request.urgency === 'high' && (
                        <Warning sx={{ fontSize: 16, color: THEME_COLORS.ERROR }} />
                      )}
                      {request.itemName}
                    </Box>
                  </TableCell>
                  <TableCell>{request.category}</TableCell>
                  <TableCell>{request.quantity} {request.unit}</TableCell>
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
                  <TableCell>{request.requestDate}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(request.status)}
                      size="small"
                      sx={getStatusStyle(request.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      {request.status === 'pending' && (
                        <>
                          <Button
                            variant="outlined"
                            size="small"
                            sx={{
                              color: THEME_COLORS.SUCCESS,
                              borderColor: THEME_COLORS.SUCCESS,
                              '&:hover': {
                                bgcolor: `${THEME_COLORS.SUCCESS}14`,
                                borderColor: THEME_COLORS.SUCCESS,
                              }
                            }}
                          >
                            批准
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            sx={{
                              color: THEME_COLORS.ERROR,
                              borderColor: THEME_COLORS.ERROR,
                              '&:hover': {
                                bgcolor: `${THEME_COLORS.ERROR}14`,
                                borderColor: THEME_COLORS.ERROR,
                              }
                            }}
                          >
                            不批准
                          </Button>
                        </>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => toggleRowExpansion(request.id)}
                      >
                        {expandedRows.includes(request.id) ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
                
                {/* 展開區域 - 手動媒合 */}
                <TableRow>
                  <TableCell colSpan={8} sx={{ p: 0 }}>
                    <Collapse in={expandedRows.includes(request.id)}>
                      <Box sx={{ p: 3, bgcolor: THEME_COLORS.ERROR_LIGHT }}>
                        <Box sx={{ 
                          display: 'flex',
                          flexDirection: { xs: 'column', md: 'row' },
                          gap: 3
                        }}>
                          {/* 左側：申請詳情 */}
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ 
                              mb: 2, 
                              fontWeight: 600,
                              color: THEME_COLORS.TEXT_PRIMARY
                            }}>
                              申請詳情
                            </Typography>
                            
                            <Card variant="outlined" sx={{ mb: 2 }}>
                              <CardContent>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="body2" sx={{ 
                                      minWidth: 80, 
                                      fontWeight: 600, 
                                      color: THEME_COLORS.TEXT_SECONDARY 
                                    }}>
                                      物品：
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      {request.itemName}
                                    </Typography>
                                  </Box>
                                  
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="body2" sx={{ 
                                      minWidth: 80, 
                                      fontWeight: 600, 
                                      color: THEME_COLORS.TEXT_SECONDARY 
                                    }}>
                                      緊急程度：
                                    </Typography>
                                    <Chip
                                      label={getUrgencyLabel(request.urgency)}
                                      size="small"
                                      sx={{
                                        bgcolor: getUrgencyColor(request.urgency),
                                        color: 'white',
                                        fontSize: '0.75rem',
                                        fontWeight: 500
                                      }}
                                    />
                                  </Box>
                                  
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="body2" sx={{ 
                                      minWidth: 80, 
                                      fontWeight: 600, 
                                      color: THEME_COLORS.TEXT_SECONDARY 
                                    }}>
                                      預估費用：
                                    </Typography>
                                    <Typography variant="body2" sx={{ 
                                      fontWeight: 500,
                                      color: THEME_COLORS.SUCCESS
                                    }}>
                                      NT$ {request.estimatedCost.toLocaleString()}
                                    </Typography>
                                  </Box>
                                </Box>
                              </CardContent>
                            </Card>
                          </Box>

                          {/* 右側：手動媒合 */}
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ 
                              mb: 2, 
                              fontWeight: 600,
                              color: THEME_COLORS.ERROR
                            }}>
                              手動媒合物資
                            </Typography>

                            {/* 新增媒合物品表單 */}
                            <Card variant="outlined" sx={{ mb: 2 }}>
                              <CardContent>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                  <TextField
                                    fullWidth
                                    label="物品名稱"
                                    value={newMatchingItem.itemName}
                                    onChange={(e) => setNewMatchingItem(prev => ({
                                      ...prev,
                                      itemName: e.target.value
                                    }))}
                                    size="small"
                                  />
                                  
                                  <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField
                                      label="數量"
                                      type="number"
                                      value={newMatchingItem.quantity}
                                      onChange={(e) => setNewMatchingItem(prev => ({
                                        ...prev,
                                        quantity: parseInt(e.target.value) || 1
                                      }))}
                                      size="small"
                                      sx={{ width: 100 }}
                                      inputProps={{ min: 1 }}
                                    />
                                    
                                    <TextField
                                      label="單位"
                                      value={newMatchingItem.unit}
                                      onChange={(e) => setNewMatchingItem(prev => ({
                                        ...prev,
                                        unit: e.target.value
                                      }))}
                                      size="small"
                                      sx={{ width: 100 }}
                                    />
                                    
                                    <TextField
                                      label="庫存位置"
                                      value={newMatchingItem.stockLocation}
                                      onChange={(e) => setNewMatchingItem(prev => ({
                                        ...prev,
                                        stockLocation: e.target.value
                                      }))}
                                      size="small"
                                      sx={{ flex: 1 }}
                                    />
                                  </Box>
                                  
                                  <Button
                                    variant="contained"
                                    onClick={() => handleAddMatchingItem(request.id)}
                                    startIcon={<Add />}
                                    sx={{
                                      bgcolor: THEME_COLORS.ERROR,
                                      '&:hover': { bgcolor: THEME_COLORS.ERROR_DARK }
                                    }}
                                  >
                                    添加媒合物品
                                  </Button>
                                </Box>
                              </CardContent>
                            </Card>

                            {/* 已媒合物品列表 */}
                            {matchingItems[request.id]?.length > 0 && (
                              <Card variant="outlined">
                                <CardContent>
                                  <Typography variant="body2" sx={{ 
                                    mb: 2, 
                                    fontWeight: 600,
                                    color: THEME_COLORS.TEXT_PRIMARY 
                                  }}>
                                    已媒合物品
                                  </Typography>
                                  
                                  {matchingItems[request.id].map((item: any) => (
                                    <Box key={item.id} sx={{ 
                                      display: 'flex', 
                                      justifyContent: 'space-between', 
                                      alignItems: 'center',
                                      p: 1,
                                      bgcolor: THEME_COLORS.BACKGROUND_SECONDARY,
                                      borderRadius: 1,
                                      mb: 1
                                    }}>
                                      <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                          {item.itemName}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: THEME_COLORS.TEXT_MUTED }}>
                                          {item.quantity} {item.unit} - {item.stockLocation}
                                        </Typography>
                                      </Box>
                                      <IconButton
                                        size="small"
                                        onClick={() => handleRemoveMatchingItem(request.id, item.id)}
                                        sx={{ color: THEME_COLORS.ERROR }}
                                      >
                                        <Delete />
                                      </IconButton>
                                    </Box>
                                  ))}
                                </CardContent>
                              </Card>
                            )}
                          </Box>
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
    </Box>
  );
};

export default EmergencyRequestTab; 