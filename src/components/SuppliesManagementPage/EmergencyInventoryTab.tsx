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
  Chip,
} from '@mui/material';
import { 
  Search,
  ExpandMore,
  ExpandLess,
  Warning,
  AccessTime,
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
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  
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

  const toggleRowExpansion = (id: number) => {
    setExpandedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  // 獲取庫存狀態 (緊急物資閾值更嚴格)
  const getStockStatus = (stock: number) => {
    if (stock <= 2) return { text: '緊急缺貨', color: THEME_COLORS.ERROR };
    if (stock <= 10) return { text: '庫存不足', color: THEME_COLORS.WARNING };
    return { text: '庫存充足', color: THEME_COLORS.SUCCESS };
  };

  // 獲取緊急程度樣式
  const getUrgencyLevel = (level: string) => {
    switch (level) {
      case 'high':
        return { text: '高', color: THEME_COLORS.ERROR, bgcolor: `${THEME_COLORS.ERROR}20` };
      case 'medium':
        return { text: '中', color: THEME_COLORS.WARNING, bgcolor: `${THEME_COLORS.WARNING}20` };
      case 'low':
        return { text: '低', color: THEME_COLORS.SUCCESS, bgcolor: `${THEME_COLORS.SUCCESS}20` };
      default:
        return { text: '未知', color: THEME_COLORS.TEXT_MUTED, bgcolor: `${THEME_COLORS.TEXT_MUTED}20` };
    }
  };

  // 檢查是否即將過期 (3個月內)
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
            <MenuItem value="緊急程度">緊急程度</MenuItem>
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
              <TableCell sx={{ fontWeight: 600 }}>狀態</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>緊急程度</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>過期狀況</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventoryData.map((item) => {
              const stockStatus = getStockStatus(item.currentStock);
              const urgencyLevel = getUrgencyLevel(item.urgencyLevel);
              const expiringSoon = isExpiringSoon(item.expiryDate);
              
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
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: stockStatus.color, 
                          fontWeight: 600 
                        }}
                      >
                        {stockStatus.text}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={urgencyLevel.text}
                        size="small"
                        sx={{
                          color: urgencyLevel.color,
                          bgcolor: urgencyLevel.bgcolor,
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {item.expiryDate ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {expiringSoon && (
                            <AccessTime sx={{ fontSize: 16, color: THEME_COLORS.WARNING }} />
                          )}
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: expiringSoon ? THEME_COLORS.WARNING : THEME_COLORS.SUCCESS,
                              fontWeight: expiringSoon ? 600 : 400
                            }}
                          >
                            {expiringSoon ? '即將過期' : '正常'}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          無期限
                        </Typography>
                      )}
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
                    <TableCell colSpan={7} sx={{ p: 0 }}>
                      <Collapse in={expandedRows.includes(item.id)}>
                        <Box sx={{ p: 2, bgcolor: THEME_COLORS.ERROR_LIGHT }}>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>詳細資訊：</strong>
                          </Typography>
                          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1 }}>
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
                              存放位置：{item.location}
                            </Typography>
                            <Typography variant="body2">
                              新增日期：{item.addedDate}
                            </Typography>
                            {item.expiryDate && (
                              <Typography variant="body2" sx={{ 
                                color: expiringSoon ? THEME_COLORS.WARNING : 'inherit',
                                fontWeight: expiringSoon ? 600 : 400
                              }}>
                                保存期限：{item.expiryDate} {expiringSoon && '⚠️'}
                              </Typography>
                            )}
                            {item.lastUsed && (
                              <Typography variant="body2">
                                最後使用：{item.lastUsed}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Collapse>
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