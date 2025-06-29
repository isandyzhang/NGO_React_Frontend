import React, { useState } from 'react';
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
  Button,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { THEME_COLORS } from '../../styles/theme';
import { commonStyles, getStatusStyle, getResponsiveSpacing } from '../../styles/commonStyles';

/**
 * 報名申請資料介面
 */
interface RegistrationApplication {
  id: number;
  applicantName: string;
  applicantType: 'volunteer' | 'participant';
  eventName: string;
  eventDate: string;
  applicationDate: string;
  status: 'pending' | 'approved' | 'rejected';
  phone: string;
  email: string;
  experience?: string;
  motivation: string;
  notes?: string;
  avatarUrl?: string; // 申請人頭像URL，可選
}

/**
 * 報名審核組件 Props
 */
interface RegistrationReviewProps {
  onApprove?: (applicationId: number, notes?: string) => void;
  onReject?: (applicationId: number, reason: string) => void;
}

/**
 * 報名審核組件 (RegistrationReview)
 * 
 * 主要功能：
 * 1. 報名申請列表顯示（統一列表顯示所有申請）
 * 2. 申請詳情查看和審核
 * 3. 批准和拒絕報名申請
 * 4. 審核備註記錄
 * 5. 志工與個案申請分類管理
 * 
 * 特色功能：
 * - 統一審核界面
 * - 快速批准/拒絕操作
 * - 詳細申請資訊彈窗
 * - 審核備註功能
 * - 申請狀態管理
 */
const RegistrationReview: React.FC<RegistrationReviewProps> = ({ 
  onApprove, 
  onReject 
}) => {
  const theme = useTheme();

  // 詳情彈窗狀態
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    application: RegistrationApplication | null;
  }>({
    open: false,
    application: null,
  });

  // 審核彈窗狀態
  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean;
    application: RegistrationApplication | null;
    action: 'approve' | 'reject' | null;
    notes: string;
  }>({
    open: false,
    application: null,
    action: null,
    notes: '',
  });

  // 模擬報名申請資料
  const [applications] = useState<RegistrationApplication[]>([
    {
      id: 1,
      applicantName: '王小明',
      applicantType: 'volunteer',
      eventName: '雜貨旅遊 x 台積電二手作甜點體驗營',
      eventDate: '2024-06-26',
      applicationDate: '2024-06-15',
      status: 'pending',
      phone: '0912-345-678',
      email: 'wang@email.com',
      experience: '曾參與多次社區志工服務，有烘焙經驗',
      motivation: '希望能夠貢獻自己的烘焙技能，幫助長者體驗製作甜點的樂趣，同時學習與不同年齡層的人交流溝通。'
    },
    {
      id: 2,
      applicantName: '李奶奶',
      applicantType: 'participant',
      eventName: '雜貨旅遊 x 台積電二手作甜點體驗營',
      eventDate: '2024-06-26',
      applicationDate: '2024-06-16',
      status: 'pending',
      phone: '0987-654-321',
      email: 'li@email.com',
      motivation: '很久沒有做過甜點了，想要重新學習並與年輕人交流，分享過去的烘焙經驗。'
    },
    {
      id: 3,
      applicantName: '張志華',
      applicantType: 'volunteer',
      eventName: '青少年職涯探索工作坊',
      eventDate: '2024-07-05',
      applicationDate: '2024-06-10',
      status: 'approved',
      phone: '0923-456-789',
      email: 'zhang@email.com',
      experience: '從事教育工作5年，有青少年輔導經驗',
      motivation: '希望能分享職場經驗，協助青少年找到人生方向。',
      notes: '經驗豐富，適合擔任工作坊講師'
    },
    {
      id: 4,
      applicantName: '陳小華',
      applicantType: 'participant',
      eventName: '社區關懷訪問活動',
      eventDate: '2024-06-20',
      applicationDate: '2024-06-05',
      status: 'rejected',
      phone: '0956-789-012',
      email: 'chen@email.com',
      motivation: '想要參與社區服務',
      notes: '活動已額滿，建議參加下次活動'
    },
    {
      id: 5,
      applicantName: '林美玲',
      applicantType: 'volunteer',
      eventName: '長者關懷服務',
      eventDate: '2024-07-10',
      applicationDate: '2024-06-20',
      status: 'pending',
      phone: '0934-567-890',
      email: 'lin@email.com',
      experience: '護理背景，有照護長者經驗',
      motivation: '希望運用專業技能服務社區長者，給予他們溫暖和關懷。'
    },
    {
      id: 6,
      applicantName: '黃爺爺',
      applicantType: 'participant',
      eventName: '數位學習體驗課程',
      eventDate: '2024-07-15',
      applicationDate: '2024-06-22',
      status: 'approved',
      phone: '0912-876-543',
      email: 'huang@email.com',
      motivation: '想要學習使用智慧型手機和電腦，跟上時代潮流。',
      notes: '學習意願強烈，適合參與數位課程'
    }
  ]);

  /**
   * 取得狀態標籤
   */
  const getStatusLabel = (status: RegistrationApplication['status']) => {
    switch (status) {
      case 'pending': return '待審核';
      case 'approved': return '已通過';
      case 'rejected': return '已拒絕';
      default: return '未知';
    }
  };

  /**
   * 渲染申請人頭像
   */
  const renderApplicantAvatar = (application: RegistrationApplication) => {
    if (application.avatarUrl) {
      return (
        <Avatar
          src={application.avatarUrl}
          sx={{ 
            width: 36,
            height: 36,
            bgcolor: THEME_COLORS.BACKGROUND_SECONDARY,
            border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
            color: THEME_COLORS.TEXT_MUTED,
            ...theme.typography.caption,
            fontWeight: 500
          }}
        >
          {/* 如果圖片載入失敗，顯示姓名首字 */}
          {application.applicantName.charAt(0)}
        </Avatar>
      );
    } else {
      // 沒有頭像時，顯示空白 Avatar
      return (
        <Avatar sx={{ 
          width: 36,
          height: 36,
          bgcolor: THEME_COLORS.BACKGROUND_SECONDARY,
          border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`
        }}>
          {/* 完全空白的頭像 */}
        </Avatar>
      );
    }
  };

  /**
   * 打開詳情彈窗
   */
  const openDetailDialog = (application: RegistrationApplication) => {
    setDetailDialog({
      open: true,
      application,
    });
  };

  /**
   * 關閉詳情彈窗
   */
  const closeDetailDialog = () => {
    setDetailDialog({
      open: false,
      application: null,
    });
  };

  /**
   * 打開審核彈窗
   */
  const openReviewDialog = (application: RegistrationApplication, action: 'approve' | 'reject') => {
    setReviewDialog({
      open: true,
      application,
      action,
      notes: '',
    });
  };

  /**
   * 關閉審核彈窗
   */
  const closeReviewDialog = () => {
    setReviewDialog({
      open: false,
      application: null,
      action: null,
      notes: '',
    });
  };

  /**
   * 確認審核
   */
  const handleReviewConfirm = () => {
    if (reviewDialog.application) {
      if (reviewDialog.action === 'approve') {
        onApprove?.(reviewDialog.application.id, reviewDialog.notes);
      } else if (reviewDialog.action === 'reject') {
        onReject?.(reviewDialog.application.id, reviewDialog.notes);
      }
      console.log(`${reviewDialog.action === 'approve' ? '批准' : '拒絕'}申請:`, reviewDialog.application.id);
      closeReviewDialog();
    }
  };

  /**
   * 取得狀態統計
   */
  const getStatusCounts = () => {
    const pending = applications.filter(app => app.status === 'pending').length;
    const approved = applications.filter(app => app.status === 'approved').length;
    const rejected = applications.filter(app => app.status === 'rejected').length;
    return { pending, approved, rejected, total: applications.length };
  };

  const statusCounts = getStatusCounts();

  return (
    <Box>
      {/* 統計卡片 */}
      <Box sx={{ 
        display: 'flex', 
        gap: getResponsiveSpacing('md'), 
        mb: getResponsiveSpacing('lg'),
        flexWrap: 'wrap'
      }}>
        <Paper elevation={1} sx={{ 
          ...commonStyles.formSection,
          flex: 1, 
          minWidth: 200,
          textAlign: 'center'
        }}>
          <Typography variant="h6" sx={{ color: THEME_COLORS.WARNING, mb: 1, ...theme.customTypography.cardValue }}>
            {statusCounts.pending}
          </Typography>
          <Typography variant="body2" sx={{ color: THEME_COLORS.TEXT_SECONDARY, ...theme.customTypography.cardLabel }}>
            待審核申請
          </Typography>
        </Paper>
        <Paper elevation={1} sx={{ 
          ...commonStyles.formSection,
          flex: 1, 
          minWidth: 200,
          textAlign: 'center'
        }}>
          <Typography variant="h6" sx={{ color: THEME_COLORS.SUCCESS, mb: 1, ...theme.customTypography.cardValue }}>
            {statusCounts.approved}
          </Typography>
          <Typography variant="body2" sx={{ color: THEME_COLORS.TEXT_SECONDARY, ...theme.customTypography.cardLabel }}>
            已通過申請
          </Typography>
        </Paper>
        <Paper elevation={1} sx={{ 
          ...commonStyles.formSection,
          flex: 1, 
          minWidth: 200,
          textAlign: 'center'
        }}>
          <Typography variant="h6" sx={{ color: THEME_COLORS.ERROR, mb: 1, ...theme.customTypography.cardValue }}>
            {statusCounts.rejected}
          </Typography>
          <Typography variant="body2" sx={{ color: THEME_COLORS.TEXT_SECONDARY, ...theme.customTypography.cardLabel }}>
            已拒絕申請
          </Typography>
        </Paper>
        <Paper elevation={1} sx={{ 
          ...commonStyles.formSection,
          flex: 1, 
          minWidth: 200,
          textAlign: 'center'
        }}>
          <Typography variant="h6" sx={{ color: THEME_COLORS.PRIMARY, mb: 1, ...theme.customTypography.cardValue }}>
            {statusCounts.total}
          </Typography>
          <Typography variant="body2" sx={{ color: THEME_COLORS.TEXT_SECONDARY, ...theme.customTypography.cardLabel }}>
            總申請數
          </Typography>
        </Paper>
      </Box>

      {/* 申請列表 */}
      <Paper elevation={1} sx={{ borderRadius: 2 }}>
        <Box sx={{ 
          p: getResponsiveSpacing('lg'), 
          borderBottom: `1px solid ${THEME_COLORS.BORDER_LIGHT}` 
        }}>
          <Typography variant="h6" sx={{ ...commonStyles.formHeader, ...theme.customTypography.cardTitle }}>
            報名申請審核 ({applications.length} 筆申請)
          </Typography>
        </Box>
        <TableContainer sx={{ 
          maxWidth: '100%',
          overflowX: 'auto',
          '& .MuiTable-root': {
            minWidth: { xs: 700, sm: 800, md: 900 },
            width: '100%'
          }
        }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: THEME_COLORS.BACKGROUND_PRIMARY }}>
                <TableCell sx={{ ...commonStyles.tableHeader }}>申請人</TableCell>
                <TableCell sx={{ ...commonStyles.tableHeader }}>類型</TableCell>
                <TableCell sx={{ ...commonStyles.tableHeader }}>活動名稱</TableCell>
                <TableCell sx={{ ...commonStyles.tableHeader }}>活動日期</TableCell>
                <TableCell sx={{ ...commonStyles.tableHeader }}>申請日期</TableCell>
                <TableCell sx={{ ...commonStyles.tableHeader }}>狀態</TableCell>
                <TableCell sx={{ ...commonStyles.tableHeader }} align="center">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map((application) => (
                <TableRow 
                  key={application.id} 
                  hover
                  sx={{
                    '&:hover': {
                      bgcolor: THEME_COLORS.BACKGROUND_SECONDARY,
                    }
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {renderApplicantAvatar(application)}
                      <Box>
                        <Typography variant="body2" sx={{ 
                          ...theme.typography.subtitle1,
                          color: THEME_COLORS.TEXT_PRIMARY 
                        }}>
                          {application.applicantName}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          color: THEME_COLORS.TEXT_MUTED,
                          ...theme.typography.caption
                        }}>
                          {application.phone}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={application.applicantType === 'volunteer' ? '志工' : '個案'} 
                      size="small"
                      sx={{
                        bgcolor: application.applicantType === 'volunteer' 
                          ? THEME_COLORS.SUCCESS_LIGHT 
                          : '#e3f2fd',
                        color: application.applicantType === 'volunteer' 
                          ? THEME_COLORS.SUCCESS 
                          : THEME_COLORS.INFO,
                        ...theme.customTypography.cardLabel
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200 }}>
                    <Typography variant="body2" sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: THEME_COLORS.TEXT_PRIMARY,
                      ...theme.typography.body2
                    }}>
                      {application.eventName.length > 25
                        ? `${application.eventName.substring(0, 25)}...`
                        : application.eventName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ 
                      color: THEME_COLORS.TEXT_SECONDARY,
                      ...theme.typography.body2
                    }}>
                      {new Date(application.eventDate).toLocaleDateString('zh-TW')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ 
                      color: THEME_COLORS.TEXT_SECONDARY,
                      ...theme.typography.body2
                    }}>
                      {new Date(application.applicationDate).toLocaleDateString('zh-TW')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusLabel(application.status)} 
                      size="small"
                      sx={{
                        ...getStatusStyle(application.status === 'pending' ? 'pending' : 
                                       application.status === 'approved' ? 'active' : 'rejected'),
                        ...theme.customTypography.cardLabel
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => openDetailDialog(application)}
                        sx={{
                          ...commonStyles.secondaryButton,
                          minWidth: 'auto',
                          px: 1.5,
                          py: 0.5,
                          ...theme.typography.caption
                        }}
                      >
                        詳情
                      </Button>
                      {application.status === 'pending' && (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<CheckCircle sx={{ fontSize: theme.typography.caption.fontSize }} />}
                            onClick={() => openReviewDialog(application, 'approve')}
                            sx={{
                              ...commonStyles.primaryButton,
                              minWidth: 'auto',
                              px: 1.5,
                              py: 0.5,
                              fontSize: theme.typography.caption.fontSize,
                              fontWeight: theme.typography.caption.fontWeight,
                              color: 'white !important', // 確保字體是白色
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                ...commonStyles.primaryButton['&:hover'],
                                color: 'white !important', // hover 時也保持白色
                                transform: 'scale(1.05)'
                              }
                            }}
                          >
                            通過
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<Cancel sx={{ fontSize: theme.typography.caption.fontSize }} />}
                            onClick={() => openReviewDialog(application, 'reject')}
                            sx={{
                              ...commonStyles.dangerButton,
                              px: 1.5,
                              py: 0.5,
                              fontSize: theme.typography.caption.fontSize,
                              fontWeight: theme.typography.caption.fontWeight,
                              color: 'white !important', // 確保字體是白色
                              minWidth: 'auto',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                ...commonStyles.dangerButton['&:hover'],
                                color: 'white !important', // hover 時也保持白色
                                transform: 'scale(1.05)'
                              }
                            }}
                          >
                            拒絕
                          </Button>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 申請詳情彈窗 */}
      <Dialog
        open={detailDialog.open}
        onClose={closeDetailDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: THEME_COLORS.SUCCESS_LIGHT,
          color: THEME_COLORS.PRIMARY,
          ...theme.customTypography.cardTitle
        }}>
          申請詳情
        </DialogTitle>
        <DialogContent sx={{ p: getResponsiveSpacing('lg') }}>
          {detailDialog.application && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: getResponsiveSpacing('md') }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: getResponsiveSpacing('md') }}>
                <Box>
                  <Typography variant="body2" sx={{ 
                    color: THEME_COLORS.TEXT_SECONDARY,
                    ...theme.typography.body2
                  }} gutterBottom>
                    <strong>申請人姓名：</strong>{detailDialog.application.applicantName}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: THEME_COLORS.TEXT_SECONDARY,
                    ...theme.typography.body2
                  }} gutterBottom>
                    <strong>申請類型：</strong>{detailDialog.application.applicantType === 'volunteer' ? '志工' : '個案'}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: THEME_COLORS.TEXT_SECONDARY,
                    ...theme.typography.body2
                  }} gutterBottom>
                    <strong>聯絡電話：</strong>{detailDialog.application.phone}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: THEME_COLORS.TEXT_SECONDARY,
                    ...theme.typography.body2
                  }} gutterBottom>
                    <strong>電子信箱：</strong>{detailDialog.application.email}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ 
                    color: THEME_COLORS.TEXT_SECONDARY,
                    ...theme.typography.body2
                  }} gutterBottom>
                    <strong>活動名稱：</strong>{detailDialog.application.eventName}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: THEME_COLORS.TEXT_SECONDARY,
                    ...theme.typography.body2
                  }} gutterBottom>
                    <strong>活動日期：</strong>
                    {new Date(detailDialog.application.eventDate).toLocaleDateString('zh-TW')}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: THEME_COLORS.TEXT_SECONDARY,
                    ...theme.typography.body2
                  }} gutterBottom>
                    <strong>申請日期：</strong>
                    {new Date(detailDialog.application.applicationDate).toLocaleDateString('zh-TW')}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: THEME_COLORS.TEXT_SECONDARY,
                    ...theme.typography.body2
                  }} gutterBottom>
                    <strong>審核狀態：</strong>
                    <Chip 
                      label={getStatusLabel(detailDialog.application.status)} 
                      size="small"
                      sx={{ 
                        ml: 1,
                        ...getStatusStyle(detailDialog.application.status === 'pending' ? 'pending' : 
                                       detailDialog.application.status === 'approved' ? 'active' : 'rejected'),
                        ...theme.customTypography.cardLabel
                      }}
                    />
                  </Typography>
                </Box>
              </Box>
              
              {detailDialog.application.experience && (
                <Box>
                  <Typography variant="body2" sx={{ 
                    color: THEME_COLORS.TEXT_SECONDARY,
                    ...theme.customTypography.cardLabel
                  }} gutterBottom>
                    <strong>相關經驗：</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    p: getResponsiveSpacing('md'), 
                    bgcolor: THEME_COLORS.BACKGROUND_SECONDARY, 
                    borderRadius: 1,
                    border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
                    color: THEME_COLORS.TEXT_PRIMARY,
                    ...theme.typography.body1
                  }}>
                    {detailDialog.application.experience}
                  </Typography>
                </Box>
              )}
              
              <Box>
                <Typography variant="body2" sx={{ 
                  color: THEME_COLORS.TEXT_SECONDARY,
                  ...theme.customTypography.cardLabel
                }} gutterBottom>
                  <strong>參與動機：</strong>
                </Typography>
                <Typography variant="body2" sx={{ 
                  p: getResponsiveSpacing('md'), 
                  bgcolor: THEME_COLORS.BACKGROUND_SECONDARY, 
                  borderRadius: 1,
                  border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
                  color: THEME_COLORS.TEXT_PRIMARY,
                  ...theme.typography.body1
                }}>
                  {detailDialog.application.motivation}
                </Typography>
              </Box>
              
              {detailDialog.application.notes && (
                <Box>
                  <Typography variant="body2" sx={{ 
                    color: THEME_COLORS.TEXT_SECONDARY,
                    ...theme.customTypography.cardLabel
                  }} gutterBottom>
                    <strong>審核備註：</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    p: getResponsiveSpacing('md'), 
                    bgcolor: '#fff3e0', 
                    borderRadius: 1,
                    border: `1px solid ${THEME_COLORS.WARNING}`,
                    color: THEME_COLORS.TEXT_PRIMARY,
                    ...theme.typography.body1
                  }}>
                    {detailDialog.application.notes}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: getResponsiveSpacing('lg') }}>
          <Button onClick={closeDetailDialog} sx={{ 
            ...commonStyles.secondaryButton,
            ...theme.typography.body2
          }}>
            關閉
          </Button>
        </DialogActions>
      </Dialog>

      {/* 審核確認彈窗 */}
      <Dialog
        open={reviewDialog.open}
        onClose={closeReviewDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: reviewDialog.action === 'approve' 
            ? THEME_COLORS.SUCCESS_LIGHT 
            : THEME_COLORS.ERROR_LIGHT,
          color: reviewDialog.action === 'approve' 
            ? THEME_COLORS.SUCCESS 
            : THEME_COLORS.ERROR,
          ...theme.customTypography.cardTitle
        }}>
          {reviewDialog.action === 'approve' ? '通過申請' : '拒絕申請'}
        </DialogTitle>
        <DialogContent sx={{ p: getResponsiveSpacing('lg') }}>
          {reviewDialog.application && (
            <Box sx={{ mb: getResponsiveSpacing('lg') }}>
              <Typography variant="body2" sx={{ 
                color: THEME_COLORS.TEXT_SECONDARY,
                ...theme.typography.body2
              }} gutterBottom>
                申請人：{reviewDialog.application.applicantName} ({reviewDialog.application.applicantType === 'volunteer' ? '志工' : '個案'})
              </Typography>
              <Typography variant="body2" sx={{ 
                color: THEME_COLORS.TEXT_SECONDARY,
                ...theme.typography.body2
              }} gutterBottom>
                活動：{reviewDialog.application?.eventName}
              </Typography>
            </Box>
          )}
          <TextField
            fullWidth
            multiline
            rows={4}
            label={reviewDialog.action === 'approve' ? '審核備註' : '拒絕原因'}
            placeholder={reviewDialog.action === 'approve' 
              ? '請輸入審核備註...' 
              : '請說明拒絕原因...'}
            value={reviewDialog.notes}
            onChange={(e) => setReviewDialog(prev => ({ ...prev, notes: e.target.value }))}
            required={reviewDialog.action === 'reject'}
            sx={{ ...commonStyles.formInput }}
          />
        </DialogContent>
        <DialogActions sx={{ p: getResponsiveSpacing('lg'), gap: getResponsiveSpacing('md') }}>
          <Button sx={{ 
            ...commonStyles.secondaryButton,
            ...theme.typography.body2
          }} onClick={closeReviewDialog}>
            取消
          </Button>
          <Button
            variant="contained"
            onClick={handleReviewConfirm}
            disabled={reviewDialog.action === 'reject' && !reviewDialog.notes.trim()}
            sx={{
              ...(reviewDialog.action === 'approve' 
                ? commonStyles.primaryButton 
                : commonStyles.dangerButton),
              fontSize: theme.typography.body2.fontSize,
              fontWeight: theme.typography.body2.fontWeight,
              color: 'white !important', // 確保字體是白色
              '&:hover': {
                ...(reviewDialog.action === 'approve' 
                  ? commonStyles.primaryButton['&:hover'] 
                  : commonStyles.dangerButton['&:hover']),
                color: 'white !important', // hover 時也保持白色
              },
              '&:disabled': {
                bgcolor: THEME_COLORS.BORDER_DEFAULT,
                color: THEME_COLORS.TEXT_MUTED
              }
            }}
          >
            確認{reviewDialog.action === 'approve' ? '通過' : '拒絕'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RegistrationReview; 