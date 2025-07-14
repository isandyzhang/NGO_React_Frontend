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
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { 
  Search,
  ExpandMore,
  ExpandLess,
  Person,
  Add,
  Delete,
  Inventory,
} from '@mui/icons-material';
import { THEME_COLORS } from '../../styles/theme';
import { 
  getStatusStyle,
  getResponsiveSpacing
} from '../../styles/commonStyles';
import { supplyService, RegularSuppliesNeed, EmergencySupplyNeed } from '../../services';
import { formatDateForInput } from '../../utils/dateHelper';

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
  supplyType: 'regular' | 'emergency';
  caseName?: string;
  caseId?: string;
  deliveryMethod?: '自取' | '宅配';
  deliveryAddress?: string;
  deliveryPhone?: string;
}

interface RequestTabProps {
  isEmergencySupply?: boolean;
}

const RequestTab: React.FC<RequestTabProps> = ({ 
  isEmergencySupply = false 
}) => {
  const [searchType, setSearchType] = useState('物品名稱');
  const [searchContent, setSearchContent] = useState('');
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SupplyRequest | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  
  // 手動媒合相關狀態
  const [matchingItems, setMatchingItems] = useState<{[requestId: number]: any[]}>({});
  const [newMatchingItem, setNewMatchingItem] = useState({
    itemName: '',
    category: '',
    quantity: 1,
    unit: '',
    stockLocation: '',
    notes: ''
  });

  // 真實資料狀態
  const [requestData, setRequestData] = useState<SupplyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 載入資料
  useEffect(() => {
    loadRequestData();
  }, [isEmergencySupply]);

  const loadRequestData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (isEmergencySupply) {
        const emergencyNeeds = await supplyService.getEmergencySupplyNeeds();
        const transformedData: SupplyRequest[] = emergencyNeeds.map(need => ({
          id: need.emergencyNeedId,
          itemName: need.itemName,
          category: need.category,
          quantity: need.quantity,
          unit: need.unit,
          urgency: need.urgency,
          requestedBy: need.requestedBy,
          department: '緊急需求',
          requestDate: need.requestDate,
          status: need.status,
          estimatedCost: need.estimatedCost,
          supplyType: 'emergency' as const,
          caseName: need.caseName,
          caseId: need.caseId,
        }));
        setRequestData(transformedData);
      } else {
        const regularNeeds = await supplyService.getRegularSuppliesNeeds();
        const transformedData: SupplyRequest[] = regularNeeds.map(need => ({
          id: need.needId,
          itemName: need.itemName,
          category: need.category,
          quantity: need.quantity,
          unit: need.unit,
          urgency: 'medium' as const, // 常駐物資預設為中等緊急度
          requestedBy: need.requestedBy,
          department: '常駐需求',
          requestDate: need.requestDate,
          status: need.status,
          estimatedCost: need.estimatedCost,
          supplyType: 'regular' as const,
          caseName: need.caseName,
          caseId: need.caseId,
          deliveryMethod: need.deliveryMethod,
        }));
        setRequestData(transformedData);
      }
    } catch (err) {
      console.error('載入申請資料失敗:', err);
      setError('載入資料失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 根據物資類型過濾資料
  const filteredRequestData = requestData.filter(request => 
    isEmergencySupply ? request.supplyType === 'emergency' : request.supplyType === 'regular'
  );

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

  const handleApproveClick = (request: SupplyRequest) => {
    setSelectedRequest(request);
    
    // 預先填入申請人的運送方式資訊
    if (request.deliveryMethod) {
      setDeliveryMethod(request.deliveryMethod === '自取' ? 'pickup' : 'delivery');
      setDeliveryAddress(request.deliveryAddress || '');
      setDeliveryPhone(request.deliveryPhone || '');
    } else {
      // 如果申請人沒有填寫，設為預設值
      setDeliveryMethod('pickup');
      setDeliveryAddress('');
      setDeliveryPhone('');
    }
    
    setApprovalModalOpen(true);
  };

  const handleApprovalSubmit = () => {
    if (selectedRequest) {
      // 验证宅配时必须填写地址和电话
      if (deliveryMethod === 'delivery') {
        if (!deliveryAddress.trim()) {
          alert('請填寫配送地址');
          return;
        }
        if (!deliveryPhone.trim()) {
          alert('請填寫聯絡電話');
          return;
        }
      }
      
      const approvalData: any = {
        requestId: selectedRequest.id,
        itemName: selectedRequest.itemName,
        deliveryMethod: deliveryMethod === 'pickup' ? '自取' : '宅配'
      };
      
      if (deliveryMethod === 'delivery') {
        approvalData.deliveryAddress = deliveryAddress;
        approvalData.deliveryPhone = deliveryPhone;
      }
      
          console.log('批准申請:', approvalData);
    // TODO: 實作批准邏輯和狀態更新
      setApprovalModalOpen(false);
      setSelectedRequest(null);
    }
  };

  const handleModalClose = () => {
    setApprovalModalOpen(false);
    setSelectedRequest(null);
    setDeliveryMethod('pickup');
    setDeliveryAddress('');
    setDeliveryPhone('');
  };

  const handleDeliveryMethodChange = (value: 'pickup' | 'delivery') => {
    setDeliveryMethod(value);
    
          // 如果选择宅配且有caseID，自动填入地址和电话
      if (value === 'delivery' && selectedRequest?.caseId) {
        // 暫時清空地址和電話，等待真實API資料
        setDeliveryAddress('');
        setDeliveryPhone('');
      }
  };

  // 手動媒合相關處理函數
  const handleAddMatchingItem = (requestId: number) => {
    if (!newMatchingItem.itemName || !newMatchingItem.quantity) {
      alert('請填寫物品名稱和數量');
      return;
    }

    const matchingItem = {
      ...newMatchingItem,
      id: Date.now(),
      matchedDate: formatDateForInput(new Date())
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
            <MenuItem value="物品名稱">物品名稱</MenuItem>
            <MenuItem value="分類">分類</MenuItem>
            <MenuItem value="申請人">申請人</MenuItem>
            <MenuItem value="部門">部門</MenuItem>
            {isEmergencySupply && <MenuItem value="個案">個案</MenuItem>}
          </Select>
          
          <TextField
            value={searchContent}
            onChange={(e) => setSearchContent(e.target.value)}
            placeholder={`搜尋${isEmergencySupply ? '緊急' : '常駐'}物資申請...`}
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
              bgcolor: isEmergencySupply ? THEME_COLORS.ERROR : THEME_COLORS.PRIMARY,
              '&:hover': {
                bgcolor: isEmergencySupply ? THEME_COLORS.ERROR_DARK : THEME_COLORS.PRIMARY_DARK,
              }
            }}
          >
            搜尋
          </Button>
        </Box>
      </Paper>

      {/* 載入狀態 */}
      {loading && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          py: 4 
        }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>
            載入{isEmergencySupply ? '緊急' : '常駐'}物資申請資料中...
          </Typography>
        </Box>
      )}

      {/* 錯誤狀態 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* 申請表格 */}
      {!loading && (
        <TableContainer component={Paper} elevation={1}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: THEME_COLORS.BACKGROUND_SECONDARY }}>
                <TableCell sx={{ fontWeight: 600 }}>申請人</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>物品名稱</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>分類</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>數量</TableCell>
                {/* 只有緊急物資才顯示緊急程度 */}
                {isEmergencySupply && (
                  <TableCell sx={{ fontWeight: 600 }}>緊急程度</TableCell>
                )}
                <TableCell sx={{ fontWeight: 600 }}>申請時間</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>狀態</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRequestData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isEmergencySupply ? 8 : 7} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" sx={{ color: THEME_COLORS.TEXT_MUTED }}>
                      目前沒有{isEmergencySupply ? '緊急' : '常駐'}物資申請
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequestData.map((request) => (
              <React.Fragment key={request.id}>
                <TableRow hover>
                  <TableCell>
                    {request.caseName && request.caseId ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person sx={{ 
                          fontSize: 16, 
                          color: isEmergencySupply ? THEME_COLORS.ERROR : THEME_COLORS.PRIMARY 
                        }} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {request.caseName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: THEME_COLORS.TEXT_MUTED }}>
                            {request.caseId}
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ color: THEME_COLORS.TEXT_MUTED }}>
                        未指定
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{request.itemName}</TableCell>
                  <TableCell>{request.category}</TableCell>
                  <TableCell>{request.quantity} {request.unit}</TableCell>
                  {/* 只有緊急物資才顯示緊急程度 */}
                  {isEmergencySupply && (
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
                  )}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {request.requestDate}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(request.status)}
                      size="small"
                      sx={{
                        bgcolor: getStatusStyle(request.status).bg,
                        color: getStatusStyle(request.status).color,
                        fontWeight: 500,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      {request.status === 'pending' ? (
                        <>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleApproveClick(request)}
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
                            onClick={() => {
                              console.log('不批准申請:', request.id);
                              // TODO: 實作不批准邏輯
                            }}
                            sx={{
                              borderColor: THEME_COLORS.ERROR,
                              color: THEME_COLORS.ERROR,
                              minWidth: 'auto',
                              px: 1.5,
                              fontSize: '0.75rem'
                            }}
                          >
                            不批准
                          </Button>
                        </>
                      ) : null}
                      {/* 展開按鈕 - 常駐物資顯示運送信息，緊急物資顯示完整詳情 */}
                      <IconButton
                        size="small"
                        onClick={() => toggleRowExpansion(request.id)}
                      >
                        {expandedRows.includes(request.id) ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
                
                {/* 展開區域 - 根據物資類型顯示不同內容 */}
                <TableRow>
                  <TableCell colSpan={isEmergencySupply ? 8 : 7} sx={{ p: 0 }}>
                    <Collapse in={expandedRows.includes(request.id)}>
                      <Box sx={{ p: 3, bgcolor: THEME_COLORS.BACKGROUND_SECONDARY }}>
                        {isEmergencySupply ? (
                          // 緊急物資：顯示完整詳情和手動媒合
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
                                color: THEME_COLORS.TEXT_PRIMARY,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                              }}>
                                <Inventory />
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
                                        分類：
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {request.category}
                                      </Typography>
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Typography variant="body2" sx={{ 
                                        minWidth: 80, 
                                        fontWeight: 600, 
                                        color: THEME_COLORS.TEXT_SECONDARY 
                                      }}>
                                        申請數量：
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {request.quantity} {request.unit}
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
                                        NT$ {request.estimatedCost}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </CardContent>
                              </Card>

                              {/* 運送方式資訊 */}
                              {request.deliveryMethod && (
                                <Card variant="outlined">
                                  <CardContent>
                                    <Typography variant="body2" sx={{ 
                                      mb: 2, 
                                      fontWeight: 600,
                                      color: THEME_COLORS.TEXT_PRIMARY 
                                    }}>
                                      申請人填寫的運送方式
                                    </Typography>
                                    
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body2" sx={{ 
                                          minWidth: 60, 
                                          fontWeight: 600, 
                                          color: THEME_COLORS.TEXT_SECONDARY 
                                        }}>
                                          方式：
                                        </Typography>
                                        <Typography variant="body2" sx={{ 
                                          fontWeight: 500,
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 0.5
                                        }}>
                                          🚚 {request.deliveryMethod}
                                        </Typography>
                                      </Box>
                                      
                                      {request.deliveryMethod === '宅配' && (
                                        <>
                                          {request.deliveryAddress && (
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                              <Typography variant="body2" sx={{ 
                                                minWidth: 60, 
                                                fontWeight: 600, 
                                                color: THEME_COLORS.TEXT_SECONDARY 
                                              }}>
                                                地址：
                                              </Typography>
                                              <Typography variant="body2" sx={{ 
                                                fontWeight: 500,
                                                flex: 1,
                                                wordBreak: 'break-all'
                                              }}>
                                                {request.deliveryAddress}
                                              </Typography>
                                            </Box>
                                          )}
                                          {request.deliveryPhone && (
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                              <Typography variant="body2" sx={{ 
                                                minWidth: 60, 
                                                fontWeight: 600, 
                                                color: THEME_COLORS.TEXT_SECONDARY 
                                              }}>
                                                電話：
                                              </Typography>
                                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {request.deliveryPhone}
                                              </Typography>
                                            </Box>
                                          )}
                                        </>
                                      )}
                                    </Box>
                                  </CardContent>
                                </Card>
                              )}
                            </Box>

                            {/* 右側：手動媒合 */}
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" sx={{ 
                                mb: 2, 
                                fontWeight: 600,
                                color: THEME_COLORS.ERROR,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                              }}>
                                <Add />
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
                                        label="分類"
                                        value={newMatchingItem.category}
                                        onChange={(e) => setNewMatchingItem(prev => ({
                                          ...prev,
                                          category: e.target.value
                                        }))}
                                        size="small"
                                        sx={{ flex: 1 }}
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
                                    </Box>
                                    
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
                                    
                                    <TextField
                                      fullWidth
                                      label="備註"
                                      value={newMatchingItem.notes}
                                      onChange={(e) => setNewMatchingItem(prev => ({
                                        ...prev,
                                        notes: e.target.value
                                      }))}
                                      size="small"
                                      multiline
                                      rows={2}
                                    />
                                    
                                    <Button
                                      variant="contained"
                                      onClick={() => handleAddMatchingItem(request.id)}
                                      sx={{
                                        bgcolor: THEME_COLORS.ERROR,
                                        '&:hover': {
                                          opacity: 0.8,
                                        }
                                      }}
                                    >
                                      新增媒合物品
                                    </Button>
                                  </Box>
                                </CardContent>
                              </Card>

                              {/* 已媒合的物品列表 */}
                              {matchingItems[request.id] && matchingItems[request.id].length > 0 && (
                                <Card variant="outlined">
                                  <CardContent>
                                    <Typography variant="body2" sx={{ 
                                      mb: 2, 
                                      fontWeight: 600,
                                      color: THEME_COLORS.TEXT_PRIMARY 
                                    }}>
                                      已媒合物品 ({matchingItems[request.id].length} 項)
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
                                            {item.quantity} {item.unit} • {item.stockLocation}
                                          </Typography>
                                        </Box>
                                        <IconButton
                                          size="small"
                                          onClick={() => handleRemoveMatchingItem(request.id, item.id)}
                                          sx={{ color: THEME_COLORS.ERROR }}
                                        >
                                          <Delete sx={{ fontSize: 16 }} />
                                        </IconButton>
                                      </Box>
                                    ))}
                                  </CardContent>
                                </Card>
                              )}

                              {/* 沒有媒合物品時的提示 */}
                              {(!matchingItems[request.id] || matchingItems[request.id].length === 0) && (
                                <Alert severity="info" sx={{ mt: 2 }}>
                                  尚未新增媒合物品，請使用上方表單手動新增
                                </Alert>
                              )}
                            </Box>
                          </Box>
                        ) : (
                          // 常駐物資：只顯示運送方式資訊
                          <Box>
                            <Typography variant="h6" sx={{ 
                              mb: 2, 
                              fontWeight: 600,
                              color: THEME_COLORS.PRIMARY,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }}>
                              🚚 申請人填寫的運送方式
                            </Typography>
                            
                            {request.deliveryMethod ? (
                              <Card variant="outlined">
                                <CardContent>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Typography variant="body2" sx={{ 
                                        minWidth: 80, 
                                        fontWeight: 600, 
                                        color: THEME_COLORS.TEXT_SECONDARY 
                                      }}>
                                        運送方式：
                                      </Typography>
                                      <Typography variant="body2" sx={{ 
                                        fontWeight: 500,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5
                                      }}>
                                        {request.deliveryMethod}
                                      </Typography>
                                    </Box>
                                    
                                    {request.deliveryMethod === '宅配' && (
                                      <>
                                        {request.deliveryAddress && (
                                          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                            <Typography variant="body2" sx={{ 
                                              minWidth: 80, 
                                              fontWeight: 600, 
                                              color: THEME_COLORS.TEXT_SECONDARY 
                                            }}>
                                              配送地址：
                                            </Typography>
                                            <Typography variant="body2" sx={{ 
                                              fontWeight: 500,
                                              flex: 1,
                                              wordBreak: 'break-all'
                                            }}>
                                              {request.deliveryAddress}
                                            </Typography>
                                          </Box>
                                        )}
                                        {request.deliveryPhone && (
                                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography variant="body2" sx={{ 
                                              minWidth: 80, 
                                              fontWeight: 600, 
                                              color: THEME_COLORS.TEXT_SECONDARY 
                                            }}>
                                              聯絡電話：
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                              {request.deliveryPhone}
                                            </Typography>
                                          </Box>
                                        )}
                                      </>
                                    )}
                                    
                                    <Divider sx={{ my: 1 }} />
                                    
                                    <Typography variant="body2" sx={{ 
                                      color: THEME_COLORS.TEXT_MUTED,
                                      fontStyle: 'italic'
                                    }}>
                                      點擊「批准」按鈕可確認或修改運送方式
                                    </Typography>
                                  </Box>
                                </CardContent>
                              </Card>
                            ) : (
                              <Alert severity="warning">
                                申請人尚未填寫運送方式，請聯絡申請人補充資訊
                              </Alert>
                            )}
                          </Box>
                        )}
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* 批准申請Modal */}
      <Modal
        open={approvalModalOpen}
        onClose={handleModalClose}
        aria-labelledby="approval-modal-title"
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
          <Typography id="approval-modal-title" variant="h6" sx={{ 
            mb: 3,
            fontWeight: 600,
            color: isEmergencySupply ? THEME_COLORS.ERROR : THEME_COLORS.PRIMARY
          }}>
            確認物資申請 - 運送方式
          </Typography>
          
          {selectedRequest && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, color: THEME_COLORS.TEXT_SECONDARY }}>
                申請項目：<strong>{selectedRequest.itemName}</strong>
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, color: THEME_COLORS.TEXT_SECONDARY }}>
                數量：{selectedRequest.quantity} {selectedRequest.unit}
              </Typography>
              {selectedRequest.caseName && selectedRequest.caseId && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Person sx={{ 
                    fontSize: 16, 
                    color: isEmergencySupply ? THEME_COLORS.ERROR : THEME_COLORS.PRIMARY 
                  }} />
                  <Typography variant="body2" sx={{ color: THEME_COLORS.TEXT_SECONDARY }}>
                    申請人：{selectedRequest.caseName} ({selectedRequest.caseId})
                  </Typography>
                </Box>
              )}
              
              {/* 顯示申請人原始填寫的運送方式 */}
              {selectedRequest.deliveryMethod && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    申請人填寫的運送方式：{selectedRequest.deliveryMethod}
                    {selectedRequest.deliveryMethod === '宅配' && selectedRequest.deliveryAddress && (
                      <>
                        <br />地址：{selectedRequest.deliveryAddress}
                        {selectedRequest.deliveryPhone && (
                          <>
                            <br />電話：{selectedRequest.deliveryPhone}
                          </>
                        )}
                      </>
                    )}
                  </Typography>
                </Alert>
              )}
            </Box>
          )}

          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <FormLabel component="legend" sx={{ 
              mb: 2,
              fontWeight: 500,
              color: THEME_COLORS.TEXT_PRIMARY
            }}>
              {selectedRequest?.deliveryMethod 
                ? '確認或修改運送方式' 
                : '請選擇運送方式（申請人未填寫）'
              }
            </FormLabel>
            <RadioGroup
              value={deliveryMethod}
              onChange={(e) => handleDeliveryMethodChange(e.target.value as 'pickup' | 'delivery')}
            >
              <FormControlLabel 
                value="pickup" 
                control={<Radio sx={{
                  color: isEmergencySupply ? THEME_COLORS.ERROR : THEME_COLORS.PRIMARY,
                  '&.Mui-checked': {
                    color: isEmergencySupply ? THEME_COLORS.ERROR : THEME_COLORS.PRIMARY,
                  }
                }} />} 
                label="自取" 
              />
              <FormControlLabel 
                value="delivery" 
                control={<Radio sx={{
                  color: isEmergencySupply ? THEME_COLORS.ERROR : THEME_COLORS.PRIMARY,
                  '&.Mui-checked': {
                    color: isEmergencySupply ? THEME_COLORS.ERROR : THEME_COLORS.PRIMARY,
                  }
                }} />} 
                label="宅配" 
              />
            </RadioGroup>

            {/* 宅配資訊輸入 */}
            {deliveryMethod === 'delivery' && (
              <Box sx={{ mt: 2, p: 2, bgcolor: THEME_COLORS.BACKGROUND_SECONDARY, borderRadius: 1 }}>
                <Typography variant="body2" sx={{ 
                  mb: 2, 
                  fontWeight: 500,
                  color: THEME_COLORS.TEXT_PRIMARY
                }}>
                  宅配資訊
                </Typography>
                
                <TextField
                  fullWidth
                  label="配送地址"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: isEmergencySupply ? THEME_COLORS.ERROR : THEME_COLORS.PRIMARY,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      '&.Mui-focused': {
                        color: isEmergencySupply ? THEME_COLORS.ERROR : THEME_COLORS.PRIMARY,
                      },
                    },
                  }}
                  multiline
                  rows={2}
                  placeholder="請輸入配送地址"
                />
                
                <TextField
                  fullWidth
                  label="聯絡電話"
                  value={deliveryPhone}
                  onChange={(e) => setDeliveryPhone(e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: isEmergencySupply ? THEME_COLORS.ERROR : THEME_COLORS.PRIMARY,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      '&.Mui-focused': {
                        color: isEmergencySupply ? THEME_COLORS.ERROR : THEME_COLORS.PRIMARY,
                      },
                    },
                  }}
                  placeholder="請輸入聯絡電話"
                />
                
                {selectedRequest?.caseId && (
                  <Typography variant="caption" sx={{ 
                    mt: 1, 
                    display: 'block',
                    color: THEME_COLORS.TEXT_MUTED,
                    fontStyle: 'italic'
                  }}>
                    * 已自動填入 {selectedRequest.caseId} 的聯絡資訊
                  </Typography>
                )}
              </Box>
            )}
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={handleModalClose}
              sx={{
                borderColor: THEME_COLORS.TEXT_MUTED,
                color: THEME_COLORS.TEXT_MUTED,
                '&:hover': {
                  borderColor: THEME_COLORS.TEXT_SECONDARY,
                  bgcolor: 'transparent',
                }
              }}
            >
              取消
            </Button>
            <Button
              variant="contained"
              onClick={handleApprovalSubmit}
              sx={{
                bgcolor: isEmergencySupply ? THEME_COLORS.ERROR : THEME_COLORS.PRIMARY,
                color: 'white',
                '&:hover': {
                  opacity: 0.8,
                }
              }}
            >
              確認並批准
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default RequestTab; 