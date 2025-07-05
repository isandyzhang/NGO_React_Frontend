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

  Typography,
} from '@mui/material';
import { 
  Search,
  Warning,
} from '@mui/icons-material';
import { THEME_COLORS } from '../../styles/theme';
import { 
  getResponsiveSpacing
} from '../../styles/commonStyles';

interface EmergencySupplyItem {
  id: number;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  location: string;
  supplier: string;
  cost: number;
  supplyType: 'emergency';
  addedDate: string;
  expiryDate?: string;
  urgencyLevel: 'high' | 'medium' | 'low';
  lastUsed?: string;
}

const EmergencyInventoryTab: React.FC = () => {
  const [searchType, setSearchType] = useState('物品名稱');
  const [searchContent, setSearchContent] = useState('');

  
  // 緊急物資庫存資料
  const [inventoryData] = useState<EmergencySupplyItem[]>([
    {
      id: 1,
      name: '醫用口罩',
      category: '緊急醫療用品',
      currentStock: 2,
      unit: '盒',
      location: '倉庫C-01',
      supplier: '防疫用品商',
      cost: 300,
      supplyType: 'emergency',
      addedDate: '2024-01-13',
      expiryDate: '2027-01-13',
      urgencyLevel: 'high',
      lastUsed: '2024-01-20'
    },
    {
      id: 2,
      name: '應急照明燈',
      category: '照明設備',
      currentStock: 15,
      unit: '個',
      location: '倉庫D-01',
      supplier: '緊急設備商',
      cost: 450,
      supplyType: 'emergency',
      addedDate: '2024-01-17',
      urgencyLevel: 'medium'
    },
    {
      id: 3,
      name: '急救包',
      category: '緊急醫療用品',
      currentStock: 3,
      unit: '套',
      location: '倉庫C-02',
      supplier: '醫療用品公司',
      cost: 800,
      supplyType: 'emergency',
      addedDate: '2024-01-12',
      expiryDate: '2026-01-12',
      urgencyLevel: 'high',
      lastUsed: '2024-01-18'
    },
    {
      id: 4,
      name: '防護面罩',
      category: '防護設備',
      currentStock: 8,
      unit: '個',
      location: '倉庫C-03',
      supplier: '防護設備公司',
      cost: 200,
      supplyType: 'emergency',
      addedDate: '2024-01-15',
      expiryDate: '2028-01-15',
      urgencyLevel: 'medium'
    },
    {
      id: 5,
      name: '緊急食品包',
      category: '應急食品',
      currentStock: 1,
      unit: '箱',
      location: '倉庫F-01',
      supplier: '緊急食品供應商',
      cost: 1200,
      supplyType: 'emergency',
      addedDate: '2024-01-11',
      expiryDate: '2025-06-11',
      urgencyLevel: 'high',
      lastUsed: '2024-01-19'
    },
    {
      id: 6,
      name: '通訊設備',
      category: '通訊設備',
      currentStock: 6,
      unit: '台',
      location: '倉庫G-01',
      supplier: '通訊設備商',
      cost: 2500,
      supplyType: 'emergency',
      addedDate: '2024-01-14',
      urgencyLevel: 'low'
    }
  ]);

  const handleSearch = () => {
    console.log('搜尋緊急物資:', { searchType, searchContent });
    // TODO: 實作搜尋邏輯
  };

  // 檢查是否即將過期 (3個月內) - 僅用於統計
  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return expiry <= threeMonthsFromNow;
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
            placeholder="搜尋緊急物資庫存..."
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
                bgcolor: THEME_COLORS.ERROR_DARK,
              }
            }}
          >
            搜尋
          </Button>
        </Box>
      </Paper>

      {/* 緊急狀況統計卡片 */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Paper elevation={1} sx={{ p: 2, flex: 1, minWidth: 200 }}>
          <Typography variant="body2" color="textSecondary">
            高優先度物資
          </Typography>
          <Typography variant="h4" color={THEME_COLORS.ERROR} sx={{ fontWeight: 600 }}>
            {inventoryData.filter(item => item.urgencyLevel === 'high').length}
          </Typography>
        </Paper>
        <Paper elevation={1} sx={{ p: 2, flex: 1, minWidth: 200 }}>
          <Typography variant="body2" color="textSecondary">
            緊急缺貨項目
          </Typography>
          <Typography variant="h4" color={THEME_COLORS.ERROR} sx={{ fontWeight: 600 }}>
            {inventoryData.filter(item => item.currentStock <= 2).length}
          </Typography>
        </Paper>
        <Paper elevation={1} sx={{ p: 2, flex: 1, minWidth: 200 }}>
          <Typography variant="body2" color="textSecondary">
            即將過期項目
          </Typography>
          <Typography variant="h4" color={THEME_COLORS.WARNING} sx={{ fontWeight: 600 }}>
            {inventoryData.filter(item => isExpiringSoon(item.expiryDate)).length}
          </Typography>
        </Paper>
        <Paper elevation={1} sx={{ p: 2, flex: 1, minWidth: 200 }}>
          <Typography variant="body2" color="textSecondary">
            總庫存價值
          </Typography>
          <Typography variant="h4" color={THEME_COLORS.SUCCESS} sx={{ fontWeight: 600 }}>
            ${inventoryData.reduce((total, item) => total + (item.cost * item.currentStock), 0).toLocaleString()}
          </Typography>
        </Paper>
      </Box>

      {/* 庫存表格 */}
      <TableContainer component={Paper} elevation={1}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: THEME_COLORS.BACKGROUND_SECONDARY }}>
              <TableCell sx={{ fontWeight: 600 }}>物品名稱</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>分類</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>庫存量</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventoryData.map((item) => {
              return (
                <React.Fragment key={item.id}>
                  <TableRow hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {item.urgencyLevel === 'high' && (
                          <Warning sx={{ fontSize: 16, color: THEME_COLORS.ERROR }} />
                        )}
                        {item.name}
                      </Box>
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {item.currentStock} {item.unit}
                      </Typography>
                    </TableCell>
                  </TableRow>

                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EmergencyInventoryTab; 