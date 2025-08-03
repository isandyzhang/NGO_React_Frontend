import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  SupervisorAccount,
  Visibility,
  Warning,
} from '@mui/icons-material';
import { THEME_COLORS } from '../styles/theme';
import { commonStyles, getResponsiveSpacing, getButtonStyle, getButtonVariant } from '../styles/commonStyles';
import PageHeader from '../components/shared/PageHeader';
import PageContainer from '../components/shared/PageContainer';
import { useAuth } from '../hooks/useAuth';
import { accountService, Account, CreateAccountRequest, UpdateAccountRequest } from '../services';
import AddAccountDialog from '../components/AccountManagement/AddAccountDialog';
import EditAccountDialog from '../components/AccountManagement/EditAccountDialog';

// 確認對話框狀態
interface ConfirmDialog {
  open: boolean;
  type: 'delete' | 'edit' | 'add';
  account: Account | null;
  title: string;
  message: string;
}

/**
 * 帳號管理頁面組件
 * 
 * 主要功能：
 * 1. 帳號列表檢視 - 所有用戶都能看到基本資訊
 * 2. 新增帳號 - 僅管理員可用
 * 3. 編輯帳號 - 僅管理員可用
 * 4. 刪除帳號 - 僅管理員可用，需二次確認
 * 
 * 權限控制：
 * - staff: 無法存取此頁面
 * - supervisor: 僅能檢視
 * - admin: 完整功能
 */
const AccountManagement: React.FC = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
    open: false,
    type: 'delete',
    account: null,
    title: '',
    message: '',
  });

  // 用戶權限檢查
  const userRole = user?.role as 'staff' | 'supervisor' | 'admin' || 'staff';
  const canManage = userRole === 'admin'; // 只有管理員能進行新增/編輯/刪除
  const canView = userRole === 'supervisor' || userRole === 'admin'; // 主管和管理員能檢視

  // 如果是員工，顯示無權限訊息
  if (!canView) {
    return (
      <PageContainer>
        <PageHeader
          breadcrumbs={[
            { label: '帳號管理', icon: <SupervisorAccount sx={{ fontSize: 16 }} /> }
          ]}
        />
        <Paper elevation={1} sx={{ 
          p: getResponsiveSpacing('xl'),
          textAlign: 'center',
          bgcolor: THEME_COLORS.ERROR_LIGHT,
          border: `1px solid ${THEME_COLORS.ERROR}`,
        }}>
          <Warning sx={{ fontSize: 64, color: THEME_COLORS.ERROR, mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 2, color: THEME_COLORS.ERROR }}>
            存取受限
          </Typography>
          <Typography variant="body1" sx={{ color: THEME_COLORS.TEXT_MUTED }}>
            您沒有權限存取帳號管理功能。如需協助，請聯絡系統管理員。
          </Typography>
        </Paper>
      </PageContainer>
    );
  }

  // 載入帳號資料
  const loadAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await accountService.getAccounts();
      setAccounts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入帳號資料失敗');
    } finally {
      setLoading(false);
    }
  };

  // 組件載入時取得資料
  useEffect(() => {
    loadAccounts();
  }, []);

  // 取得角色顯示文字和顏色
  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'admin':
        return { label: '管理員', color: THEME_COLORS.ERROR };
      case 'supervisor':
        return { label: '主管', color: THEME_COLORS.WARNING };
      case 'staff':
        return { label: '員工', color: THEME_COLORS.INFO };
      default:
        return { label: role, color: THEME_COLORS.TEXT_MUTED };
    }
  };

  // 取得狀態顯示資訊
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { label: '啟用', color: THEME_COLORS.SUCCESS };
      case 'inactive':
        return { label: '停用', color: THEME_COLORS.ERROR };
      default:
        return { label: status, color: THEME_COLORS.TEXT_MUTED };
    }
  };

  // 處理刪除帳號確認
  const handleDeleteAccount = (account: Account) => {
    setConfirmDialog({
      open: true,
      type: 'delete',
      account,
      title: '確認刪除帳號',
      message: `您確定要刪除帳號「${account.name}」嗎？此操作無法復原。`,
    });
  };

  // 處理新增帳號
  const handleAddAccount = async (accountData: CreateAccountRequest) => {
    try {
      await accountService.createAccount(accountData);
      // 重新載入帳號列表
      await loadAccounts();
    } catch (err) {
      throw err; // 讓對話框組件處理錯誤顯示
    }
  };

  // 處理編輯帳號
  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account);
    setEditDialogOpen(true);
  };

  // 處理更新帳號
  const handleUpdateAccount = async (id: number, accountData: UpdateAccountRequest) => {
    try {
      await accountService.updateAccount(id, accountData);
      // 重新載入帳號列表
      await loadAccounts();
    } catch (err) {
      throw err; // 讓對話框組件處理錯誤顯示
    }
  };

  // 執行刪除操作
  const executeDelete = async () => {
    if (!confirmDialog.account) return;
    
    try {
      await accountService.deleteAccount(confirmDialog.account.id);
      // 重新載入帳號列表
      await loadAccounts();
      setConfirmDialog({ ...confirmDialog, open: false });
    } catch (err: any) {
      // 處理不同類型的錯誤
      if (err.response?.status === 400) {
        setError('此帳號仍有相關聯的資料，無法刪除');
      } else if (err.response?.status === 404) {
        setError('找不到指定的帳號');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('刪除帳號失敗，請稍後再試');
      }
    }
  };

  return (
    <PageContainer>
      {/* 頁面標題 */}
      <PageHeader
        breadcrumbs={[
          { label: '帳號管理', icon: <SupervisorAccount sx={{ fontSize: 16 }} /> }
        ]}
      />

      {/* 功能說明和操作區域 */}
      <Paper elevation={1} sx={{ 
        p: getResponsiveSpacing('md'),
        mb: 3,
        bgcolor: THEME_COLORS.BACKGROUND_CARD,
        border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 }
        }}>
          <Box>
            <Typography variant="h6" sx={{ 
              fontWeight: 600,
              color: THEME_COLORS.TEXT_PRIMARY,
              mb: 0.5
            }}>
              系統帳號管理
            </Typography>
            <Typography variant="body2" sx={{ 
              color: THEME_COLORS.TEXT_MUTED,
              fontSize: '0.875rem'
            }}>
              {canManage 
                ? '管理系統中所有用戶帳號，包含新增、編輯、刪除功能' 
                : '檢視系統中所有用戶帳號資訊'
              }
            </Typography>
          </Box>

          {canManage && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAddDialogOpen(true)}
              sx={{ ...commonStyles.primaryButton }}
            >
              新增帳號
            </Button>
          )}
        </Box>
      </Paper>

      {/* 錯誤訊息 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 帳號列表 */}
      <Paper elevation={1} sx={{ 
        bgcolor: THEME_COLORS.BACKGROUND_CARD,
        border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
        borderRadius: 2
      }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: THEME_COLORS.BACKGROUND_PRIMARY }}>
                <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>姓名</TableCell>
                <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>電子信箱</TableCell>
                <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>角色</TableCell>
                <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>登入來源</TableCell>
                <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>狀態</TableCell>
                {canManage && (
                  <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY, textAlign: 'center' }}>操作</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={canManage ? 6 : 5} sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>載入中...</Typography>
                  </TableCell>
                </TableRow>
              ) : accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canManage ? 6 : 5} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="textSecondary">暫無帳號資料</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((account) => {
                  const roleInfo = getRoleInfo(account.role);
                  const statusInfo = getStatusInfo(account.status);
                  
                  return (
                    <TableRow key={account.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {account.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: THEME_COLORS.TEXT_MUTED }}>
                          {account.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={roleInfo.label}
                          size="small"
                          sx={{
                            bgcolor: `${roleInfo.color}14`,
                            color: roleInfo.color,
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ 
                          color: account.loginSource === 'azure' ? THEME_COLORS.INFO : THEME_COLORS.TEXT_MUTED 
                        }}>
                          {account.loginSource === 'azure' ? 'Azure AD' : '本地帳戶'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusInfo.label}
                          size="small"
                          sx={{
                            bgcolor: `${statusInfo.color}14`,
                            color: statusInfo.color,
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      {canManage && (
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <IconButton
                              size="small"
                              onClick={() => handleEditAccount(account)}
                              sx={{ color: THEME_COLORS.INFO }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteAccount(account)}
                              sx={{ color: THEME_COLORS.ERROR }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 刪除確認對話框 */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          color: THEME_COLORS.ERROR,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Warning />
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {confirmDialog.message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
            sx={{ ...commonStyles.secondaryButton }}
          >
            取消
          </Button>
          <Button
            onClick={executeDelete}
            variant={getButtonVariant('danger')}
            sx={{
              ...getButtonStyle('danger'),
            }}
          >
            確認刪除
          </Button>
        </DialogActions>
      </Dialog>

      {/* 新增帳號對話框 */}
      <AddAccountDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleAddAccount}
      />

      {/* 編輯帳號對話框 */}
      <EditAccountDialog
        open={editDialogOpen}
        account={selectedAccount}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedAccount(null);
        }}
        onSave={handleUpdateAccount}
      />
    </PageContainer>
  );
};

export default AccountManagement;