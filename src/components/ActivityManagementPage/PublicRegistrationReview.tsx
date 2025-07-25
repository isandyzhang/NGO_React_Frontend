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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import {
  Search,
  Check,
  Close,
  Refresh,
} from '@mui/icons-material';
import { THEME_COLORS } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import registrationService, { PublicRegistration } from '../../services/registrationService';

const PublicRegistrationReview: React.FC = () => {
  const [searchContent, setSearchContent] = useState('');
  const [registrations, setRegistrations] = useState<PublicRegistration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<PublicRegistration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  
  // 確認對話框狀態
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    registrationId: number | null;
    action: 'approve' | 'reject' | null;
    registrationName: string;
  }>({
    open: false,
    registrationId: null,
    action: null,
    registrationName: ''
  });

  // 載入民眾報名資料
  const loadRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await registrationService.getPublicRegistrations();
      
      if (Array.isArray(data)) {
        // 資料驗證和轉換
        const validData = data.map((item: any) => {
          // 檢查必需欄位 - 支援小寫和大寫兩種格式
          const hasRequiredFields = item && (
            (typeof item.Id !== 'undefined' && item.Id !== null) || 
            (typeof item.id !== 'undefined' && item.id !== null)
          ) && (
            item.UserName || item.userName
          ) && (
            item.ActivityName || item.activityName
          ) && (
            item.Status || item.status
          );
          
          if (!hasRequiredFields) {
            return null;
          }
          
          // 確保資料格式正確 - 統一轉換成大寫開頭格式
          return {
            Id: Number(item.Id || item.id),
            UserId: Number(item.UserId || item.userId || 0),
            UserName: String(item.UserName || item.userName || '未知用戶'),
            ActivityName: String(item.ActivityName || item.activityName || '未知活動'),
            NumberOfCompanions: Number(item.NumberOfCompanions || item.numberOfCompanions || 0),
            Status: String(item.Status || item.status || 'Pending')
          };
        }).filter(item => item !== null) as PublicRegistration[];
        
        setRegistrations(validData);
        setFilteredRegistrations(validData);
      } else {
        setRegistrations([]);
        setFilteredRegistrations([]);
        setError('API回應格式不正確');
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

  // 開啟確認對話框
  const handleOpenConfirmDialog = (id: number, action: 'approve' | 'reject', registrationName: string) => {
    setConfirmDialog({
      open: true,
      registrationId: id,
      action,
      registrationName
    });
  };

  // 關閉確認對話框
  const handleCloseConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      registrationId: null,
      action: null,
      registrationName: ''
    });
  };

  // 確認並執行狀態更新
  const handleConfirmStatusUpdate = async () => {
    if (!confirmDialog.registrationId || !confirmDialog.action) return;

    try {
      setProcessingIds(prev => new Set(prev).add(confirmDialog.registrationId!));
      
      const status = confirmDialog.action === 'approve' ? 'Approved' : 'Cancelled';
      await registrationService.updatePublicRegistrationStatus(confirmDialog.registrationId, status);
      
      // 更新本地狀態
      setRegistrations(prev => 
        prev.map(reg => 
          reg.Id === confirmDialog.registrationId ? { ...reg, Status: status } : reg
        )
      );
      setFilteredRegistrations(prev => 
        prev.map(reg => 
          reg.Id === confirmDialog.registrationId ? { ...reg, Status: status } : reg
        )
      );
      
      alert(`民眾報名已${status === 'Approved' ? '同意' : '不同意'}`);
      handleCloseConfirmDialog();
    } catch (err) {
      console.error('更新狀態失敗:', err);
      alert('更新狀態失敗，請稍後再試');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(confirmDialog.registrationId!);
        return newSet;
      });
    }
  };

  // 狀態標籤顏色
  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'approved': 
      case '已同意':
      case '已審核':
        return THEME_COLORS.SUCCESS;
      case 'cancelled': 
      case 'rejected':
      case '已不同意':
      case '取消報名':
      case '已取消':
        return THEME_COLORS.ERROR;
      case 'pending':
      case '待審核':
      case '已報名':
      case 'registered':
        return THEME_COLORS.WARNING;
      default: 
        return THEME_COLORS.TEXT_MUTED;
    }
  };

  // 狀態標籤文字
  const getStatusLabel = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'approved': 
      case '已同意':
      case '已審核':
        return '已同意';
      case 'cancelled': 
      case 'rejected':
      case '已不同意':
      case '取消報名':
      case '已取消':
        return '已不同意';
      case 'pending':
      case '待審核':
      case '已報名':
      case 'registered':
        return '待審核';
      default: 
        return status;
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
            sx={{ 
              minWidth: 100, 
              bgcolor: THEME_COLORS.SUCCESS,
              color: 'white',
              '&:hover': { bgcolor: THEME_COLORS.SUCCESS }
            }}
          >
            查詢
          </Button>
          <Button
            variant="contained"
            onClick={loadRegistrations}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
            sx={{ 
              minWidth: 100,
              bgcolor: THEME_COLORS.SUCCESS,
              color: 'white',
              '&:hover': { bgcolor: THEME_COLORS.SUCCESS }
            }}
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
                      {(() => {
                        const normalizedStatus = registration.Status.toLowerCase();
                        const isPending = normalizedStatus === 'pending' || 
                                        normalizedStatus === '待審核' || 
                                        normalizedStatus === '已報名' || 
                                        normalizedStatus === 'registered';
                        
                        // 強制所有「已報名」狀態顯示按鈕
                        const shouldShowButtons = isPending || normalizedStatus === '已報名';
                        
                        return shouldShowButtons ? (
                          <>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleOpenConfirmDialog(registration.Id, 'approve', `${registration.UserName} - ${registration.ActivityName}`)}
                              disabled={processingIds.has(registration.Id)}
                              startIcon={processingIds.has(registration.Id) ? <CircularProgress size={16} /> : <Check />}
                              sx={{ 
                                ...commonStyles.approveButton,
                                fontSize: '0.875rem'
                              }}
                            >
                              同意
                            </Button>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleOpenConfirmDialog(registration.Id, 'reject', `${registration.UserName} - ${registration.ActivityName}`)}
                              disabled={processingIds.has(registration.Id)}
                              startIcon={processingIds.has(registration.Id) ? <CircularProgress size={16} /> : <Close />}
                              sx={{ 
                                ...commonStyles.rejectButton,
                                fontSize: '0.875rem'
                              }}
                            >
                              不同意
                            </Button>
                          </>
                        ) : (
                          <Typography variant="body2" color={THEME_COLORS.TEXT_SECONDARY}>
                            已處理
                          </Typography>
                        );
                      })()}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 確認對話框 */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">
          確認操作
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            您確定要{confirmDialog.action === 'approve' ? '同意' : '不同意'}以下報名嗎？
            <br />
            <strong>{confirmDialog.registrationName}</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseConfirmDialog}
            variant="contained"
            sx={{
              ...commonStyles.secondaryButton
            }}
          >
            取消
          </Button>
          <Button 
            onClick={handleConfirmStatusUpdate} 
            variant="contained"
            autoFocus
            sx={{
              ...(confirmDialog.action === 'approve' ? commonStyles.approveButton : commonStyles.rejectButton)
            }}
          >
            確定{confirmDialog.action === 'approve' ? '同意' : '不同意'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PublicRegistrationReview; 