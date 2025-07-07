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
  IconButton,
  Collapse,
  Typography,
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

interface RegularSupplyItem {
  id: number;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  location: string;
  supplier: string;
  cost: number;
  supplyType: 'regular';
  addedDate: string;
  expiryDate?: string;
}

const RegularInventoryTab: React.FC = () => {
  const [searchType, setSearchType] = useState('物品名稱');
  const [searchContent, setSearchContent] = useState('');
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  
  // 常駐物資庫存資料
  const [inventoryData] = useState<RegularSupplyItem[]>([
    {
      id: 1,
      name: 'A4 白紙',
      category: '辦公用品',
      currentStock: 50,
      unit: '包',
      location: '倉庫A-01',
      supplier: '辦公用品商店',
      cost: 80,
      supplyType: 'regular',
      addedDate: '2024-01-15'
    },
    {
      id: 2,
      name: '清潔用酒精',
      category: '清潔用品',
      currentStock: 5,
      unit: '瓶',
      location: '倉庫B-03',
      supplier: '醫療用品公司',
      cost: 150,
      supplyType: 'regular',
      addedDate: '2024-01-14',
      expiryDate: '2025-01-14'
    },
    {
      id: 3,
      name: '原子筆',
      category: '辦公用品',
      currentStock: 80,
      unit: '支',
      location: '倉庫A-02',
      supplier: '文具批發商',
      cost: 25,
      supplyType: 'regular',
      addedDate: '2024-01-16'
    },
    {
      id: 4,
      name: '影印紙',
      category: '辦公用品',
      currentStock: 120,
      unit: '包',
      location: '倉庫A-03',
      supplier: '辦公用品商店',
      cost: 85,
      supplyType: 'regular',
      addedDate: '2024-01-18'
    },
    {
      id: 5,
      name: '洗手液',
      category: '清潔用品',
      currentStock: 15,
      unit: '瓶',
      location: '倉庫B-01',
      supplier: '清潔用品公司',
      cost: 120,
      supplyType: 'regular',
      addedDate: '2024-01-12',
      expiryDate: '2025-12-31'
    },
    {
      id: 6,
      name: '桌上型電腦',
      category: '電子設備',
      currentStock: 8,
      unit: '台',
      location: '倉庫E-01',
      supplier: '電腦設備商',
      cost: 25000,
      supplyType: 'regular',
      addedDate: '2024-01-10'
    }
  ]);

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
            placeholder="搜尋常駐物資庫存..."
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
                bgcolor: THEME_COLORS.PRIMARY_DARK,
              }
            }}
          >
            搜尋
          </Button>
        </Box>
      </Paper>

      {/* 庫存統計卡片 */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Paper elevation={1} sx={{ p: 2, flex: 1, minWidth: 200 }}>
          <Typography variant="body2" color="textSecondary">
            總物品種類
          </Typography>
          <Typography variant="h4" color={THEME_COLORS.PRIMARY} sx={{ fontWeight: 600 }}>
            {inventoryData.length}
          </Typography>
        </Paper>
        <Paper elevation={1} sx={{ p: 2, flex: 1, minWidth: 200 }}>
          <Typography variant="body2" color="textSecondary">
            庫存不足項目
          </Typography>
          <Typography variant="h4" color={THEME_COLORS.ERROR} sx={{ fontWeight: 600 }}>
            {inventoryData.filter(item => item.currentStock <= 5).length}
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
              <TableCell sx={{ fontWeight: 600 }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventoryData.map((item) => (
              <React.Fragment key={item.id}>
                <TableRow hover>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {item.currentStock} {item.unit}
                    </Typography>
                  </TableCell>
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
                  <TableCell colSpan={4} sx={{ p: 0 }}>
                    <Collapse in={expandedRows.includes(item.id)}>
                      <Box sx={{ p: 2, bgcolor: THEME_COLORS.BACKGROUND_SECONDARY }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>詳細資訊：</strong>
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                          <Typography variant="body2">
                            供應者：{item.supplier}
                          </Typography>
                          <Typography variant="body2">
                            單價：NT$ {item.cost.toLocaleString()}
                          </Typography>
                          <Typography variant="body2">
                            總價值：NT$ {(item.cost * item.currentStock).toLocaleString()}
                          </Typography>
                          <Typography variant="body2">
                            新增日期：{item.addedDate}
                          </Typography>
                          <Typography variant="body2">
                            存放位置：{item.location}
                          </Typography>
                          {item.expiryDate && (
                            <Typography variant="body2">
                              保存期限：{item.expiryDate}
                            </Typography>
                          )}
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

export default RegularInventoryTab; 