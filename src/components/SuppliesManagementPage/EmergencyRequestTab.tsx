import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Tooltip,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
  Person,
  Inventory,
  CalendarToday,
  PriorityHigh,
  Description,
  Image,
} from '@mui/icons-material';
import { emergencySupplyNeedService, EmergencySupplyNeed } from '../../services/emergencySupplyNeedService';
import { useUserRole } from '../../hooks/useUserRole';

const EmergencyRequestTab: React.FC = () => {
  const [requests, setRequests] = useState<EmergencySupplyNeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<EmergencySupplyNeed | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [alert, setAlert] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const userRole = useUserRole();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await emergencySupplyNeedService.getAll();
      
      if (Array.isArray(data)) {
        setRequests(data);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error('載入緊急物資需求失敗:', error);
      showAlert('載入資料失敗', 'error');
      setRequests([]); // 設定為空陣列以避免 undefined 錯誤
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setAlert({ open: true, message, severity });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Fundraising':
        return 'primary';
      case 'Reviewing':
        return 'warning';
      case 'Completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'Fundraising':
        return '募集中';
      case 'Reviewing':
        return '審核中';
      case 'Completed':
        return '已完成';
      default:
        return '未知';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'Urgent':
        return 'error';
      case 'High':
        return 'warning';
      case 'Normal':
        return 'info';
      case 'Low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityText = (priority?: string) => {
    switch (priority) {
      case 'Urgent':
        return '緊急';
      case 'High':
        return '高';
      case 'Normal':
        return '一般';
      case 'Low':
        return '低';
      default:
        return '未知';
    }
  };

  const handleReviewRequest = (request: EmergencySupplyNeed, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setReviewAction(action);
    setReviewNote('');
    setReviewDialogOpen(true);
  };

  const handleViewDetail = (request: EmergencySupplyNeed) => {
    console.log('查看詳情:', request);
    console.log('圖片URL:', request.imageUrl);
    setSelectedRequest(request);
    setDetailDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedRequest || !reviewAction) return;

    try {
      const newStatus = reviewAction === 'approve' ? 'Fundraising' : 'Completed';
      
      await emergencySupplyNeedService.update(selectedRequest.emergencyNeedId, {
        status: newStatus
      });

      showAlert(
        reviewAction === 'approve' ? '申請已批准，狀態已更新為募集中' : '申請已拒絕',
        'success'
      );

      setReviewDialogOpen(false);
      loadRequests(); // 重新載入資料
    } catch (error) {
      console.error('審核失敗:', error);
      showAlert('審核操作失敗', 'error');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('zh-TW');
  };

  const getCompletionRate = (quantity: number, collectedQuantity: number) => {
    return Math.round((collectedQuantity / quantity) * 100);
  };

  return (
    <Box sx={{ p: 3 }}>

      {/* 統計卡片 */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              總申請數
            </Typography>
            <Typography variant="h4">
              {requests.length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              待審核
            </Typography>
            <Typography variant="h4" color="warning.main">
              {requests.filter(r => r.status === 'Reviewing').length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              募集中
            </Typography>
            <Typography variant="h4" color="primary.main">
              {requests.filter(r => r.status === 'Fundraising').length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              已完成
            </Typography>
            <Typography variant="h4" color="success.main">
              {requests.filter(r => r.status === 'Completed').length}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* 申請列表 */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>物品名稱</TableCell>
                <TableCell>個案</TableCell>
                <TableCell>申請人</TableCell>
                <TableCell>數量</TableCell>
                <TableCell>進度</TableCell>
                <TableCell>優先級</TableCell>
                <TableCell>狀態</TableCell>
                <TableCell>申請日期</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    載入中...
                  </TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    暫無申請記錄
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.emergencyNeedId}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {request.imageUrl && (
                          <Avatar
                            src={request.imageUrl}
                            sx={{ width: 40, height: 40 }}
                            variant="rounded"
                          />
                        )}
                        <Typography variant="body2" fontWeight="medium">
                          {request.supplyName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {request.caseName || `ID: ${request.caseId}`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {request.workerName || `ID: ${request.workerId}`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {request.collectedQuantity} / {request.quantity}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          {getCompletionRate(request.quantity, request.collectedQuantity)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getPriorityText(request.priority)}
                        color={getPriorityColor(request.priority)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(request.status)}
                        color={getStatusColor(request.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(request.createdDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="查看詳情">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetail(request)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        
                        {/* 只有 supervisor 且狀態為 Reviewing 時才顯示審核按鈕 */}
                        {userRole.isSupervisor && request.status === 'Reviewing' && (
                          <>
                            <Tooltip title="批准">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleReviewRequest(request, 'approve')}
                              >
                                <CheckCircle />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="拒絕">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleReviewRequest(request, 'reject')}
                              >
                                <Cancel />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 審核對話框 */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {reviewAction === 'approve' ? '批准申請' : '拒絕申請'}
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>物品：</strong>{selectedRequest.supplyName}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>申請數量：</strong>{selectedRequest.quantity}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>個案：</strong>{selectedRequest.caseName}
              </Typography>
            </Box>
          )}
          <TextField
            fullWidth
            label="審核備註"
            multiline
            rows={4}
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            placeholder="請輸入審核意見..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>
            取消
          </Button>
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            color={reviewAction === 'approve' ? 'success' : 'error'}
          >
            確認{reviewAction === 'approve' ? '批准' : '拒絕'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 詳情對話框 */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          申請詳情
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {/* 左側：基本資訊 */}
                <Box sx={{ flex: 1, minWidth: 300 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Inventory />
                    <Typography variant="h6">基本資訊</Typography>
                  </Box>
                  <Box sx={{ ml: 4 }}>
                    <Typography variant="body1" gutterBottom>
                      <strong>物品名稱：</strong>{selectedRequest.supplyName}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>申請數量：</strong>{selectedRequest.quantity}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>已募集：</strong>{selectedRequest.collectedQuantity}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>完成度：</strong>
                      {getCompletionRate(selectedRequest.quantity, selectedRequest.collectedQuantity)}%
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Person />
                    <Typography variant="h6">相關人員</Typography>
                  </Box>
                  <Box sx={{ ml: 4 }}>
                    <Typography variant="body1" gutterBottom>
                      <strong>個案：</strong>{selectedRequest.caseName || `ID: ${selectedRequest.caseId}`}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>申請人：</strong>{selectedRequest.workerName || `ID: ${selectedRequest.workerId}`}
                    </Typography>
                  </Box>
                </Box>

                {/* 右側：狀態和時間 */}
                <Box sx={{ flex: 1, minWidth: 300 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <PriorityHigh />
                    <Typography variant="h6">狀態資訊</Typography>
                  </Box>
                  <Box sx={{ ml: 4 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary">優先級</Typography>
                      <Chip
                        label={getPriorityText(selectedRequest.priority)}
                        color={getPriorityColor(selectedRequest.priority)}
                        size="small"
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary">狀態</Typography>
                      <Chip
                        label={getStatusText(selectedRequest.status)}
                        color={getStatusColor(selectedRequest.status)}
                        size="small"
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CalendarToday />
                    <Typography variant="h6">時間記錄</Typography>
                  </Box>
                  <Box sx={{ ml: 4 }}>
                    <Typography variant="body1" gutterBottom>
                      <strong>申請時間：</strong>{formatDate(selectedRequest.createdDate)}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>更新時間：</strong>{formatDate(selectedRequest.updatedDate)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* 描述 */}
              {selectedRequest.description && (
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Description />
                    <Typography variant="h6">申請說明</Typography>
                  </Box>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="body1">
                      {selectedRequest.description}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* 圖片 */}
              {selectedRequest.imageUrl ? (
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Image />
                    <Typography variant="h6">物品圖片</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <img
                      src={selectedRequest.imageUrl}
                      alt={selectedRequest.supplyName}
                      style={{
                        maxWidth: '100%',
                        maxHeight: 300,
                        objectFit: 'contain',
                        borderRadius: 8,
                      }}
                      onLoad={() => console.log('圖片載入成功:', selectedRequest.imageUrl)}
                      onError={(e) => console.error('圖片載入失敗:', selectedRequest.imageUrl, e)}
                    />
                  </Box>
                </Box>
              ) : (
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Image />
                    <Typography variant="h6">物品圖片</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'grey.100', borderRadius: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      此申請沒有上傳圖片
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>
            關閉
          </Button>
        </DialogActions>
      </Dialog>

      {/* 提示訊息 */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert
          onClose={() => setAlert({ ...alert, open: false })}
          severity={alert.severity}
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmergencyRequestTab; 