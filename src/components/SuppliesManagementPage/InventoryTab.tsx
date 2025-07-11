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
} from '@mui/material';
import { 
  Search,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { THEME_COLORS } from '../../styles/theme';
import { 
  getResponsiveSpacing
} from '../../styles/commonStyles';
import { supplyService, Supply } from '../../services';

interface SupplyItem {
  id: number;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  location: string;
  supplier: string;
  cost: number;
  supplyType: 'regular' | 'emergency';
  addedDate: string;
  expiryDate?: string;
}

interface InventoryTabProps {
  isEmergencySupply?: boolean;
}

const InventoryTab: React.FC<InventoryTabProps> = ({ 
  isEmergencySupply = false 
}) => {
  const [searchType, setSearchType] = useState('物品名稱');
  const [searchContent, setSearchContent] = useState('');
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  
  // 真實資料狀態
  const [inventoryData, setInventoryData] = useState<SupplyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 載入資料
  useEffect(() => {
    loadInventoryData();
  }, [isEmergencySupply]);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const supplies = await supplyService.getSupplies();
      const transformedData: SupplyItem[] = supplies.map(supply => ({
        id: supply.supplyId,
        name: supply.name,
        category: supply.categoryName || '未分類',
        currentStock: supply.currentStock,
        unit: supply.unit,
        location: supply.location,
        supplier: supply.supplier,
        cost: supply.cost,
        supplyType: supply.supplyType,
        addedDate: supply.addedDate,
        expiryDate: supply.expiryDate,
      }));
      setInventoryData(transformedData);
    } catch (err) {
      console.error('載入庫存資料失敗:', err);
      setError('載入資料失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 根據物資類型過濾資料
  const filteredInventoryData = inventoryData.filter(item => 
    isEmergencySupply ? item.supplyType === 'emergency' : item.supplyType === 'regular'
  );

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
            <MenuItem value="地點">地點</MenuItem>
            <MenuItem value="供應商">供應商</MenuItem>
          </Select>
          
          <TextField
            value={searchContent}
            onChange={(e) => setSearchContent(e.target.value)}
            placeholder={`搜尋${isEmergencySupply ? '緊急' : '常駐'}物資庫存...`}
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
            載入{isEmergencySupply ? '緊急' : '常駐'}物資庫存資料中...
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
                <TableCell sx={{ fontWeight: 600 }}>存放位置</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInventoryData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" sx={{ color: THEME_COLORS.TEXT_MUTED }}>
                      目前沒有{isEmergencySupply ? '緊急' : '常駐'}物資庫存
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredInventoryData.map((item) => (
              <React.Fragment key={item.id}>
                <TableRow hover>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {item.currentStock} {item.unit}
                    </Typography>
                  </TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => toggleRowExpansion(item.id)}
                    >
                      {expandedRows.includes(item.id) ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
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
                          供應者：{item.supplier}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          單價：NT$ {item.cost.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          新增日期：{item.addedDate}
                        </Typography>
                        {item.expiryDate && (
                          <Typography variant="body2">
                            保存期限：{item.expiryDate}
                          </Typography>
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
    </Box>
  );
};

export default InventoryTab; 