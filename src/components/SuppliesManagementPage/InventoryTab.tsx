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
  IconButton,
  Collapse,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
} from '@mui/material';
import { 
  Search,
  ExpandMore,
  ExpandLess,
  Edit,
  Delete,
  Inventory,
  Assignment,
} from '@mui/icons-material';
import { THEME_COLORS } from '../../styles/theme';
import { 
  getResponsiveSpacing,
  getButtonStyle,
  getButtonVariant
} from '../../styles/commonStyles';
import { supplyService } from '../../services';

interface SupplyItem {
  id: number;
  name: string;
  category: string;
  categoryId: number;
  currentStock: number;
  unit: string;
  location: string;
  supplier: string;
  cost: number;
  addedDate: string;
  expiryDate?: string;
  description?: string;
}

interface SupplyCategory {
  id: number;
  name: string;
}

interface InventoryStats {
  totalItems: number;
  lowStockItems: number;
  totalValue: number;
}

const InventoryTab: React.FC = () => {
  const [searchType, setSearchType] = useState('物品名稱');
  const [searchContent, setSearchContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  
  // 資料狀態
  const [inventoryData, setInventoryData] = useState<SupplyItem[]>([]);
  const [categories, setCategories] = useState<SupplyCategory[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    totalItems: 0,
    lowStockItems: 0,
    totalValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 編輯對話框狀態
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    item: SupplyItem | null;
  }>({
    open: false,
    item: null
  });

  // 刪除確認對話框
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    item: SupplyItem | null;
  }>({
    open: false,
    item: null
  });

  // 編輯表單狀態
  const [editFormData, setEditFormData] = useState<{
    name: string;
    categoryId: number;
    currentStock: number;
    unit: string;
    location: string;
    supplier: string;
    cost: number;
    expiryDate: string;
    description: string;
  }>({
    name: '',
    categoryId: 0,
    currentStock: 0,
    unit: '',
    location: '',
    supplier: '',
    cost: 0,
    expiryDate: '',
    description: ''
  });
  const [editLoading, setEditLoading] = useState(false);

  // 載入資料
  useEffect(() => {
    loadInventoryData();
    loadCategories();
    loadStats();
  }, []);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const supplies = await supplyService.getSupplies();
      const transformedData: SupplyItem[] = supplies.map(supply => ({
        id: supply.supplyId,
        name: supply.name,
        category: supply.categoryName || '未分類',
        categoryId: supply.categoryId,
        currentStock: supply.currentStock,
        unit: supply.unit,
        location: supply.location,
        supplier: supply.supplier,
        cost: supply.cost,
        addedDate: supply.addedDate,
        expiryDate: supply.expiryDate,
        description: supply.description || '',
      }));
      
      setInventoryData(transformedData);
      calculateStats(transformedData);
    } catch (err) {
      console.error('載入庫存資料失敗:', err);
      setError('載入資料失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categories = await supplyService.getSupplyCategories();
      setCategories(categories);
    } catch (err) {
      console.error('載入分類資料失敗:', err);
      // 使用模擬資料作為備用
      const mockCategories: SupplyCategory[] = [
        { id: 1, name: '辦公用品' },
        { id: 2, name: '清潔用品' },
        { id: 3, name: '醫療用品' },
        { id: 4, name: '食品' },
        { id: 5, name: '衣物' },
        { id: 6, name: '日用品' },
      ];
      setCategories(mockCategories);
    }
  };

  const calculateStats = (data: SupplyItem[]) => {
    const totalItems = data.length;
    const lowStockItems = data.filter(item => item.currentStock < 10).length; // 假設低於10為庫存不足
    const totalValue = data.reduce((sum, item) => sum + (item.currentStock * item.cost), 0);

    setStats({
      totalItems,
      lowStockItems,
      totalValue
    });
  };

  const loadStats = async () => {
    try {
      const statsData = await supplyService.getSupplyStats();
      setStats(statsData);
    } catch (err) {
      console.error('載入統計資料失敗:', err);
      // 如果API失敗，使用本地計算的統計
    }
  };

  // 過濾資料
  const filteredInventoryData = inventoryData.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.categoryId.toString() === selectedCategory;
    const matchesSearch = searchContent === '' || 
      (searchType === '物品名稱' && item.name.toLowerCase().includes(searchContent.toLowerCase())) ||
      (searchType === '分類' && item.category.toLowerCase().includes(searchContent.toLowerCase())) ||
      (searchType === '地點' && item.location.toLowerCase().includes(searchContent.toLowerCase())) ||
      (searchType === '供應商' && item.supplier.toLowerCase().includes(searchContent.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const handleSearch = () => {
    // 搜尋功能已經在 filteredInventoryData 中實現
  };

  const toggleRowExpansion = (id: number) => {
    setExpandedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const handleEdit = (item: SupplyItem) => {
    setEditFormData({
      name: item.name,
      categoryId: item.categoryId,
      currentStock: item.currentStock,
      unit: item.unit,
      location: item.location,
      supplier: item.supplier,
      cost: item.cost,
      expiryDate: item.expiryDate || '',
      description: item.description || ''
    });
    setEditDialog({
      open: true,
      item: item
    });
  };

  const handleDelete = (item: SupplyItem) => {
    setDeleteDialog({
      open: true,
      item: item
    });
  };

  const confirmDelete = async () => {
    if (deleteDialog.item) {
      try {
        // 呼叫刪除API
        await supplyService.deleteSupply(deleteDialog.item.id);
        
        // 重新載入資料
        await loadInventoryData();
        await loadStats();
        
        setDeleteDialog({ open: false, item: null });
      } catch (err) {
        console.error('刪除失敗:', err);
      }
    }
  };

  const handleSaveEdit = async () => {
    if (editDialog.item) {
      try {
        setEditLoading(true);
        
        // 準備更新資料
        const updateData = {
          name: editFormData.name,
          categoryId: editFormData.categoryId,
          currentStock: editFormData.currentStock,
          cost: editFormData.cost,
          description: editFormData.description
        };
        
        // 呼叫更新API
        await supplyService.updateSupply(editDialog.item.id, updateData);
        
        // 重新載入資料
        await loadInventoryData();
        await loadStats();
        
        // 關閉對話框
        setEditDialog({ open: false, item: null });
        
      } catch (err) {
        console.error('更新失敗:', err);
      } finally {
        setEditLoading(false);
      }
    }
  };

  const handleEditFormChange = (field: string, value: any) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : '未分類';
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: 'error', label: '缺貨' };
    if (stock < 10) return { color: 'warning', label: '庫存不足' };
    return { color: 'success', label: '庫存充足' };
  };

  // 統計卡片資料
  const statsCards = [
    {
      title: '總物品種類',
      value: stats.totalItems.toString(),
      icon: <Inventory />,
      color: THEME_COLORS.CHART_COLOR_2  // 藍色
    },
    {
      title: '庫存不足項目',
      value: stats.lowStockItems.toString(),
      icon: <Assignment />,
      color: THEME_COLORS.CHART_COLOR_6  // 紅色 - 警示用
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {/* 統計卡片 */}
      <Box 
        display="flex" 
        flexWrap="wrap" 
        gap={{ xs: 2, sm: 2, md: 3 }}
        sx={{ 
          mb: { xs: 3, md: 4 },
          px: { xs: 1, sm: 0 }
        }}
      >
        {statsCards.map((card, index) => (
          <Box 
            key={index} 
            sx={{
              flexBasis: { 
                xs: '100%', 
                sm: 'calc(50% - 8px)', 
                md: 'calc(33.333% - 12px)'
              },
              minWidth: 0,
              flex: '1 1 auto',
              display: 'flex'
            }}
          >
            <Card sx={{ 
              height: { xs: 120, sm: 140 },
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 2
            }}>
              <CardContent sx={{ 
                p: { xs: 2, sm: 2.5 },
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ height: '100%' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      sx={{ 
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        fontWeight: 500,
                        mb: { xs: 0.5, sm: 1 },
                        color: THEME_COLORS.TEXT_PRIMARY
                      }}
                    >
                      {card.title}
                    </Typography>
                    <Typography 
                      component="div"
                      sx={{ 
                        fontSize: { xs: '1.5rem', sm: '1.75rem' },
                        fontWeight: 700,
                        lineHeight: 1.1,
                        color: THEME_COLORS.TEXT_PRIMARY
                      }}
                    >
                      {card.value}
                    </Typography>
                  </Box>
                  <Box 
                    sx={{ 
                      color: card.color,
                      fontSize: { xs: 32, sm: 36 },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      width: { xs: 40, sm: 44 },
                      height: { xs: 40, sm: 44 }
                    }}
                  >
                    {React.cloneElement(card.icon, { 
                      sx: { fontSize: 'inherit' } 
                    })}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* 搜尋和篩選區域 */}
      <Paper elevation={1} sx={{ 
        p: getResponsiveSpacing('md'),
        mb: 3
      }}>
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          alignItems: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
          flexWrap: 'wrap'
        }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>分類</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="分類"
            >
              <MenuItem value="all">全部分類</MenuItem>
              {categories.map(category => (
                <MenuItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          
          <TextField
            value={searchContent}
            onChange={(e) => setSearchContent(e.target.value)}
            placeholder="搜尋物資庫存..."
            size="small"
            sx={{ 
              flex: 1,
              minWidth: 200
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
            variant={getButtonVariant('primary')}
            onClick={handleSearch}
            sx={{
              ...getButtonStyle('primary'),
              height: 40,
              px: 3,
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
            載入物資庫存資料中...
          </Typography>
        </Box>
      )}

      {/* 錯誤狀態 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* 庫存表格 */}
      {!loading && (
        <TableContainer component={Paper} elevation={1}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: THEME_COLORS.BACKGROUND_SECONDARY }}>
                <TableCell sx={{ fontWeight: 600 }}>物品名稱</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>分類</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>庫存量</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>狀態</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInventoryData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" sx={{ color: THEME_COLORS.TEXT_MUTED }}>
                      目前沒有物資庫存資料
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredInventoryData.map((item) => {
                  const stockStatus = getStockStatus(item.currentStock);
                  return (
                    <React.Fragment key={item.id}>
                      <TableRow hover>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>
                          <Chip 
                            label={getCategoryName(item.categoryId)} 
                            size="small"
                            sx={{
                              bgcolor: THEME_COLORS.BACKGROUND_SECONDARY,
                              color: THEME_COLORS.TEXT_PRIMARY
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {item.currentStock} {item.unit}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={stockStatus.label}
                            size="small"
                            color={stockStatus.color as any}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(item)}
                              sx={{ color: THEME_COLORS.CHART_COLOR_2 }}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(item)}
                              sx={{ color: THEME_COLORS.CHART_COLOR_6 }}
                            >
                              <Delete />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => toggleRowExpansion(item.id)}
                            >
                              {expandedRows.includes(item.id) ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={5} sx={{ p: 0 }}>
                          <Collapse in={expandedRows.includes(item.id)}>
                            <Box sx={{ p: 2, bgcolor: THEME_COLORS.BACKGROUND_SECONDARY }}>
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                <strong>詳細資訊：</strong>
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 0.5 }}>
                                存放位置：{item.location}
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 0.5 }}>
                                供應者：{item.supplier}
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 0.5 }}>
                                單價：NT$ {item.cost.toLocaleString()}
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 0.5 }}>
                                新增日期：{item.addedDate}
                              </Typography>
                              {item.expiryDate && (
                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                  保存期限：{item.expiryDate}
                                </Typography>
                              )}
                              {item.description && (
                                <Typography variant="body2">
                                  描述：{item.description}
                                </Typography>
                              )}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* 編輯對話框 */}
      <Dialog 
        open={editDialog.open} 
        onClose={() => setEditDialog({ open: false, item: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>編輯物資</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="物品名稱"
              value={editFormData.name}
              onChange={(e) => handleEditFormChange('name', e.target.value)}
              variant="outlined"
            />
            
            <FormControl fullWidth>
              <InputLabel>分類</InputLabel>
              <Select
                value={editFormData.categoryId}
                onChange={(e) => handleEditFormChange('categoryId', e.target.value)}
                label="分類"
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="目前庫存"
              type="number"
              value={editFormData.currentStock}
              onChange={(e) => handleEditFormChange('currentStock', parseInt(e.target.value) || 0)}
              variant="outlined"
            />
            
            <TextField
              fullWidth
              label="單位"
              value={editFormData.unit}
              onChange={(e) => handleEditFormChange('unit', e.target.value)}
              variant="outlined"
            />
            
            <TextField
              fullWidth
              label="存放位置"
              value={editFormData.location}
              onChange={(e) => handleEditFormChange('location', e.target.value)}
              variant="outlined"
            />
            
            <TextField
              fullWidth
              label="供應商"
              value={editFormData.supplier}
              onChange={(e) => handleEditFormChange('supplier', e.target.value)}
              variant="outlined"
            />
            
            <TextField
              fullWidth
              label="單價"
              type="number"
              value={editFormData.cost}
              onChange={(e) => handleEditFormChange('cost', parseFloat(e.target.value) || 0)}
              variant="outlined"
              InputProps={{
                startAdornment: <InputAdornment position="start">NT$</InputAdornment>,
              }}
            />
            
            <TextField
              fullWidth
              label="保存期限"
              type="date"
              value={editFormData.expiryDate}
              onChange={(e) => handleEditFormChange('expiryDate', e.target.value)}
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
            />
            
            <TextField
              fullWidth
              label="描述"
              multiline
              rows={3}
              value={editFormData.description}
              onChange={(e) => handleEditFormChange('description', e.target.value)}
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEditDialog({ open: false, item: null })}
            variant={getButtonVariant('secondary')}
            sx={{
              ...getButtonStyle('secondary'),
            }}
          >
            取消
          </Button>
          <Button 
            variant={getButtonVariant('primary')}
            onClick={handleSaveEdit}
            disabled={editLoading}
            sx={{
              ...getButtonStyle('primary'),
            }}
          >
            {editLoading ? <CircularProgress size={24} /> : '儲存'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 刪除確認對話框 */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, item: null })}>
        <DialogTitle>確認刪除</DialogTitle>
        <DialogContent>
          <Typography>
            確定要刪除「{deleteDialog.item?.name}」嗎？此操作無法復原。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ open: false, item: null })}
            variant={getButtonVariant('secondary')}
            sx={{
              ...getButtonStyle('secondary'),
            }}
          >
            取消
          </Button>
          <Button 
            variant={getButtonVariant('danger')}
            onClick={confirmDelete}
            sx={{
              ...getButtonStyle('danger'),
            }}
          >
            刪除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InventoryTab; 