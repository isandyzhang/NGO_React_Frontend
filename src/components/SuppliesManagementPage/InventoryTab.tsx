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
  
  // 模擬庫存資料
  const [inventoryData] = useState<SupplyItem[]>([
    // 常駐物資
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
      id: 4,
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
    // 緊急物資
    {
      id: 3,
      name: '口罩',
      category: '緊急醫療用品',
      currentStock: 2,
      unit: '盒',
      location: '倉庫C-01',
      supplier: '防疫用品商',
      cost: 300,
      supplyType: 'emergency',
      addedDate: '2024-01-13',
      expiryDate: '2027-01-13'
    },
    {
      id: 5,
      name: '應急照明燈',
      category: '照明設備',
      currentStock: 15,
      unit: '個',
      location: '倉庫D-01',
      supplier: '緊急設備商',
      cost: 450,
      supplyType: 'emergency',
      addedDate: '2024-01-17'
    },
    {
      id: 6,
      name: '急救包',
      category: '緊急醫療用品',
      currentStock: 3,
      unit: '套',
      location: '倉庫C-02',
      supplier: '醫療用品公司',
      cost: 800,
      supplyType: 'emergency',
      addedDate: '2024-01-12',
      expiryDate: '2026-01-12'
    }
  ]);

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

      {/* 庫存表格 */}
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
            {filteredInventoryData.map((item) => (
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
    </Box>
  );
};

export default InventoryTab; 