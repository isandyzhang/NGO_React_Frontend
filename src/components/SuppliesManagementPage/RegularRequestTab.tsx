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
} from '@mui/material';
import { 
  Search,
  ExpandMore,
  ExpandLess,
  Person,
} from '@mui/icons-material';
import { THEME_COLORS } from '../../styles/theme';
import { 
  getStatusStyle,
  getResponsiveSpacing
} from '../../styles/commonStyles';

interface RegularSupplyRequest {
  id: number;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  requestedBy: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  estimatedCost: number;
  caseName?: string;
  caseId?: string;
  deliveryMethod?: '自取' | '宅配';
  matched: boolean;
}

const RegularRequestTab: React.FC = () => {
  const [searchType, setSearchType] = useState('物品名稱');
  const [searchContent, setSearchContent] = useState('');
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  // 常駐物資申請資料
  const [requestData] = useState<RegularSupplyRequest[]>([
    {
      id: 1,
      itemName: '影印紙',
      category: '辦公用品',
      quantity: 10,
      unit: '包',
      requestedBy: '張小明',
      requestDate: '2024-01-15',
      status: 'pending',
      estimatedCost: 800,
      caseName: '張小明',
      caseId: 'CASE001',
      deliveryMethod: '自取',
      matched: false
    },
    {
      id: 2,
      itemName: '洗手液',
      category: '清潔用品',
      quantity: 5,
      unit: '瓶',
      requestedBy: '李小花',
      requestDate: '2024-01-14',
      status: 'approved',
      estimatedCost: 250,
      caseName: '李小花',
      caseId: 'CASE002',
      deliveryMethod: '宅配',
      matched: false
    },
    {
      id: 3,
      itemName: '筆記本',
      category: '辦公用品',
      quantity: 15,
      unit: '本',
      requestedBy: '陳小美',
      requestDate: '2024-01-19',
      status: 'completed',
      estimatedCost: 300,
      caseName: '陳小美',
      caseId: 'CASE004',
      deliveryMethod: '自取',
      matched: false
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '待審核';
      case 'approved': return '批准';
      case 'rejected': return '不批准';
      case 'completed': return '已完成';
      default: return '未知';
    }
  };

  // 常駐物資申請不需要自動媒合功能
  // 移除自動媒合相關邏輯

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
            sx={{ minWidth: 120, height: 40 }}
          >
            <MenuItem value="物品名稱">物品名稱</MenuItem>
            <MenuItem value="分類">分類</MenuItem>
            <MenuItem value="申請人">申請人</MenuItem>
          </Select>
          
          <TextField
            value={searchContent}
            onChange={(e) => setSearchContent(e.target.value)}
            placeholder="搜尋常駐物資申請..."
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
              bgcolor: THEME_COLORS.PRIMARY,
              '&:hover': { bgcolor: THEME_COLORS.PRIMARY_DARK }
            }}
          >
            搜尋
          </Button>
        </Box>
      </Paper>

      {/* 統計卡片 */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Paper elevation={1} sx={{ p: 2, flex: 1, minWidth: 200 }}>
          <Typography variant="body2" color="textSecondary">待審核申請</Typography>
          <Typography variant="h4" color={THEME_COLORS.WARNING} sx={{ fontWeight: 600 }}>
            {requestData.filter(item => item.status === 'pending').length}
          </Typography>
        </Paper>
        <Paper elevation={1} sx={{ p: 2, flex: 1, minWidth: 200 }}>
          <Typography variant="body2" color="textSecondary">已批准申請</Typography>
          <Typography variant="h4" color={THEME_COLORS.SUCCESS} sx={{ fontWeight: 600 }}>
            {requestData.filter(item => item.status === 'approved').length}
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
                      <Person sx={{ fontSize: 16, color: THEME_COLORS.PRIMARY }} />
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
                  <TableCell>{request.itemName}</TableCell>
                  <TableCell>{request.category}</TableCell>
                  <TableCell>{request.quantity} {request.unit}</TableCell>
                  <TableCell>{request.requestDate}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(request.status)}
                      size="small"
                      sx={getStatusStyle(request.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
                      {request.status === 'pending' && (
                        <>
                          <Button
                            variant="outlined"
                            size="small"
                            sx={{
                              color: THEME_COLORS.SUCCESS,
                              borderColor: THEME_COLORS.SUCCESS,
                              fontSize: '0.75rem',
                              px: 1.5,
                              '&:hover': {
                                bgcolor: `${THEME_COLORS.SUCCESS}14`,
                                borderColor: THEME_COLORS.SUCCESS,
                              }
                            }}
                            onClick={() => {/* TODO: 批准邏輯 */}}
                          >
                            批准
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            sx={{
                              color: THEME_COLORS.ERROR,
                              borderColor: THEME_COLORS.ERROR,
                              fontSize: '0.75rem',
                              px: 1.5,
                              '&:hover': {
                                bgcolor: `${THEME_COLORS.ERROR}14`,
                                borderColor: THEME_COLORS.ERROR,
                              }
                            }}
                            onClick={() => {/* TODO: 不批准邏輯 */}}
                          >
                            不批准
                          </Button>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
                
                {/* 展開區域 */}
                <TableRow>
                  <TableCell colSpan={7} sx={{ p: 0 }}>
                    <Collapse in={expandedRows.includes(request.id)}>
                      <Box sx={{ p: 3, bgcolor: THEME_COLORS.BACKGROUND_SECONDARY }}>
                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                          運送方式詳情
                        </Typography>
                        <Typography variant="body2">
                          運送方式：{request.deliveryMethod}
                        </Typography>
                        <Typography variant="body2">
                          預估費用：NT$ {request.estimatedCost.toLocaleString()}
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
    </Box>
  );
};

export default RegularRequestTab; 