import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  Search,
  Check,
  Close,
  Refresh,
} from '@mui/icons-material';
import { THEME_COLORS } from '../../styles/theme';
import registrationService, { PublicRegistration } from '../../services/registrationService';

const PublicRegistrationReview: React.FC = () => {
  const [searchContent, setSearchContent] = useState('');
  const [registrations, setRegistrations] = useState<PublicRegistration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<PublicRegistration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());

  // 載入民眾報名資料
  const loadRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('載入民眾報名資料...');
      const data = await registrationService.getPublicRegistrations();
      console.log('民眾報名資料:', data);
      console.log('第一筆資料結構:', data[0]);
      console.log('資料欄位:', data[0] ? Object.keys(data[0]) : '無資料');
      
      if (Array.isArray(data)) {
        // 驗證資料完整性
        const validData = data.filter(item => {
          const isValid = item && typeof item.Id !== 'undefined' && item.Id !== null;
          if (!isValid) {
            console.warn('發現無效的資料項目:', item);
          }
          return isValid;
        });
        
        console.log(`原始資料: ${data.length} 筆，有效資料: ${validData.length} 筆`);
        
        setRegistrations(validData);
        setFilteredRegistrations(validData);
      } else {
        console.warn('民眾報名資料格式不正確');
        setRegistrations([]);
        setFilteredRegistrations([]);
      }
    } catch (err) {
      console.error('載入民眾報名資料錯誤:', err);
      setError(err instanceof Error ? err.message : '載入資料時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  // 組件載入時取得資料
  useEffect(() => {
    loadRegistrations();
  }, []);

  // 搜尋功能
  const handleSearch = () => {
    if (!searchContent.trim()) {
      setFilteredRegistrations(registrations);
      return;
    }

    const filtered = registrations.filter(reg =>
      reg.UserName.toLowerCase().includes(searchContent.toLowerCase()) ||
      reg.ActivityName.toLowerCase().includes(searchContent.toLowerCase())
    );
    setFilteredRegistrations(filtered);
  };

  // 處理狀態更新
  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      setProcessingIds(prev => new Set(prev).add(id));
      
      await registrationService.updatePublicRegistrationStatus(id, status);
      
      // 更新本地狀態
      setRegistrations(prev => 
        prev.map(reg => 
          reg.Id === id ? { ...reg, Status: status } : reg
        )
      );
      setFilteredRegistrations(prev => 
        prev.map(reg => 
          reg.Id === id ? { ...reg, Status: status } : reg
        )
      );
      
      alert(`民眾報名已${status === 'Approved' ? '批准' : '拒絕'}`);
    } catch (err) {
      console.error('更新狀態失敗:', err);
      alert('更新狀態失敗，請稍後再試');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // 狀態標籤顏色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return THEME_COLORS.SUCCESS;
      case 'Cancelled': return THEME_COLORS.ERROR;
      case 'Pending': return THEME_COLORS.WARNING;
      default: return THEME_COLORS.TEXT_MUTED;
    }
  };

  // 狀態標籤文字
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Approved': return '已批准';
      case 'Cancelled': return '已拒絕';
      case 'Pending': return '待審核';
      default: return status;
    }
  };

  return (
    <Box>
      {/* 錯誤訊息 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 搜尋區域 */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: THEME_COLORS.BACKGROUND_CARD }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="請輸入民眾姓名或活動名稱"
            value={searchContent}
            onChange={(e) => setSearchContent(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: THEME_COLORS.TEXT_SECONDARY }} />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, minWidth: 200 }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading}
            startIcon={<Search />}
            sx={{ minWidth: 100, bgcolor: THEME_COLORS.PRIMARY }}
          >
            查詢
          </Button>
          <Button
            variant="outlined"
            onClick={loadRegistrations}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
            sx={{ minWidth: 100 }}
          >
            重新載入
          </Button>
        </Box>
      </Paper>

      {/* 資料表格 */}
      <TableContainer component={Paper} sx={{ bgcolor: THEME_COLORS.BACKGROUND_CARD }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: THEME_COLORS.BACKGROUND_SECONDARY }}>
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>報名ID</TableCell>
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>民眾姓名</TableCell>
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>活動名稱</TableCell>
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>同行人數</TableCell>
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>狀態</TableCell>
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY, textAlign: 'center' }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && filteredRegistrations.length === 0 ? (
              <TableRow key="loading">
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress />
                  <Typography sx={{ mt: 2 }}>載入中...</Typography>
                </TableCell>
              </TableRow>
            ) : filteredRegistrations.length === 0 ? (
              <TableRow key="no-data">
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="textSecondary">
                    {searchContent ? '查無符合條件的資料' : '暫無報名資料'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredRegistrations.map((registration, index) => (
                <TableRow 
                  key={registration.Id ? `public-registration-${registration.Id}` : `public-registration-${index}`}
                  hover
                  sx={{ 
                    '&:hover': { backgroundColor: THEME_COLORS.HOVER_LIGHT }
                  }}
                >
                  <TableCell sx={{ color: THEME_COLORS.TEXT_PRIMARY }}>
                    {registration.Id}
                  </TableCell>
                  <TableCell sx={{ color: THEME_COLORS.TEXT_PRIMARY }}>
                    {registration.UserName}
                  </TableCell>
                  <TableCell sx={{ color: THEME_COLORS.TEXT_PRIMARY }}>
                    {registration.ActivityName}
                  </TableCell>
                  <TableCell sx={{ color: THEME_COLORS.TEXT_PRIMARY }}>
                    {registration.NumberOfCompanions}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusLabel(registration.Status)}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(registration.Status),
                        color: 'white',
                        fontWeight: 500
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      {registration.Status === 'Pending' && (
                        <>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleStatusUpdate(registration.Id, 'Approved')}
                            disabled={processingIds.has(registration.Id)}
                            startIcon={processingIds.has(registration.Id) ? <CircularProgress size={16} /> : <Check />}
                            sx={{ 
                              bgcolor: THEME_COLORS.SUCCESS,
                              '&:hover': { bgcolor: THEME_COLORS.SUCCESS },
                              minWidth: 80
                            }}
                          >
                            批准
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleStatusUpdate(registration.Id, 'Cancelled')}
                            disabled={processingIds.has(registration.Id)}
                            startIcon={processingIds.has(registration.Id) ? <CircularProgress size={16} /> : <Close />}
                            sx={{ 
                              bgcolor: THEME_COLORS.ERROR,
                              '&:hover': { bgcolor: THEME_COLORS.ERROR },
                              minWidth: 80
                            }}
                          >
                            拒絕
                          </Button>
                        </>
                      )}
                      {registration.Status !== 'Pending' && (
                        <Typography variant="body2" color={THEME_COLORS.TEXT_SECONDARY}>
                          已處理
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PublicRegistrationReview; 