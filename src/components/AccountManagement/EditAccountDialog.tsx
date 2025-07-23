import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  Chip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  Warning,
} from '@mui/icons-material';
import { THEME_COLORS } from '../../styles/theme';
import { commonStyles, getResponsiveSpacing } from '../../styles/commonStyles';
import { Account, UpdateAccountRequest } from '../../services';

interface EditAccountDialogProps {
  open: boolean;
  account: Account | null;
  onClose: () => void;
  onSave: (id: number, accountData: UpdateAccountRequest) => Promise<void>;
}

/**
 * 編輯帳號對話框組件
 */
const EditAccountDialog: React.FC<EditAccountDialogProps> = ({
  open,
  account,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<UpdateAccountRequest>({
    name: '',
    email: '',
    role: 'staff',
    status: 'active',
    phone: '',
  });

  const [loading, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  // 當 account 變更時更新表單資料
  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name,
        email: account.email,
        role: account.role,
        status: account.status,
        phone: account.phone || '',
      });
    }
  }, [account]);

  // 重置表單
  const resetForm = () => {
    setError(null);
    setEmailError(null);
  };

  // 處理關閉對話框
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // 驗證電子信箱格式
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 處理表單變更
  const handleFormChange = (field: keyof UpdateAccountRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 即時驗證電子信箱
    if (field === 'email') {
      if (value && !validateEmail(value)) {
        setEmailError('請輸入有效的電子信箱格式');
      } else {
        setEmailError(null);
      }
    }
  };

  // 表單驗證
  const validateForm = (): boolean => {
    if (!formData.name?.trim()) {
      setError('請輸入姓名');
      return false;
    }

    if (!formData.email?.trim()) {
      setError('請輸入電子信箱');
      return false;
    }

    if (!validateEmail(formData.email)) {
      setError('請輸入有效的電子信箱格式');
      return false;
    }

    return true;
  };

  // 儲存變更
  const handleSave = async () => {
    if (!account || !validateForm()) return;

    try {
      setSaving(true);
      setError(null);
      await onSave(account.id, formData);
      handleClose();
    } catch (err: any) {
      // 處理不同類型的錯誤
      if (err.response?.status === 409) {
        setError('此電子信箱已被其他帳號使用，請使用其他信箱地址');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('更新帳號失敗，請稍後再試');
      }
    } finally {
      setSaving(false);
    }
  };

  // 取得登入來源顯示資訊
  const getLoginSourceInfo = (loginSource: string) => {
    switch (loginSource) {
      case 'azure':
        return { label: 'Azure AD', color: THEME_COLORS.INFO };
      case 'database':
        return { label: '本地帳戶', color: THEME_COLORS.PRIMARY };
      default:
        return { label: loginSource, color: THEME_COLORS.TEXT_MUTED };
    }
  };

  if (!account) return null;

  const loginSourceInfo = getLoginSourceInfo(account.loginSource);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{
        ...commonStyles.cardTitle,
        borderBottom: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
        pb: getResponsiveSpacing('md'),
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <Edit sx={{ color: THEME_COLORS.INFO }} />
        編輯帳號資訊
      </DialogTitle>

      <DialogContent sx={{ pt: getResponsiveSpacing('lg') }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: getResponsiveSpacing('lg')
        }}>
          {/* 錯誤訊息 */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* 帳號狀態資訊 */}
          <Box sx={{
            p: getResponsiveSpacing('md'),
            bgcolor: THEME_COLORS.BACKGROUND_PRIMARY,
            borderRadius: 2,
            border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`
          }}>
            <Typography variant="subtitle2" sx={{
              mb: getResponsiveSpacing('sm'),
              color: THEME_COLORS.TEXT_SECONDARY,
              fontWeight: 600
            }}>
              帳號資訊
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ color: THEME_COLORS.TEXT_MUTED }}>
                  ID:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  #{account.id}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ color: THEME_COLORS.TEXT_MUTED }}>
                  登入來源:
                </Typography>
                <Chip
                  label={loginSourceInfo.label}
                  size="small"
                  sx={{
                    bgcolor: `${loginSourceInfo.color}14`,
                    color: loginSourceInfo.color,
                    fontWeight: 500,
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* 基本資訊編輯 */}
          <Box>
            <Typography variant="subtitle2" sx={{
              mb: getResponsiveSpacing('md'),
              color: THEME_COLORS.PRIMARY,
              fontWeight: 600
            }}>
              基本資訊
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: getResponsiveSpacing('md') }}>
              <TextField
                label="姓名 *"
                value={formData.name || ''}
                onChange={(e) => handleFormChange('name', e.target.value)}
                fullWidth
                sx={{ ...commonStyles.formInput }}
              />

              <TextField
                label="電子信箱 *"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleFormChange('email', e.target.value)}
                error={!!emailError}
                helperText={emailError}
                fullWidth
                sx={{ ...commonStyles.formInput }}
              />

              <TextField
                label="電話號碼"
                value={formData.phone || ''}
                onChange={(e) => handleFormChange('phone', e.target.value)}
                fullWidth
                sx={ { ...commonStyles.formInput }}
              />

            </Box>
          </Box>

          {/* 權限設定 */}
          <Box>
            <Typography variant="subtitle2" sx={{
              mb: getResponsiveSpacing('md'),
              color: THEME_COLORS.PRIMARY,
              fontWeight: 600
            }}>
              權限與狀態設定
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: getResponsiveSpacing('md') }}>
              <FormControl fullWidth sx={{ ...commonStyles.formInput }}>
                <InputLabel>使用者角色</InputLabel>
                <Select
                  value={formData.role || 'staff'}
                  label="使用者角色"
                  onChange={(e) => handleFormChange('role', e.target.value as 'staff' | 'supervisor' | 'admin')}
                >
                  <MenuItem value="staff">
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body1">員工</Typography>
                      <Typography variant="caption" sx={{ color: THEME_COLORS.TEXT_MUTED }}>
                        基本功能使用權限
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="supervisor">
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body1">主管</Typography>
                      <Typography variant="caption" sx={{ color: THEME_COLORS.TEXT_MUTED }}>
                        員工權限 + 帳號檢視權限
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="admin">
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body1">管理員</Typography>
                      <Typography variant="caption" sx={{ color: THEME_COLORS.TEXT_MUTED }}>
                        完整系統管理權限
                      </Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.status === 'active'}
                    onChange={(e) => handleFormChange('status', e.target.checked ? 'active' : 'inactive')}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: THEME_COLORS.SUCCESS,
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: THEME_COLORS.SUCCESS,
                      },
                      '& .MuiSwitch-track': {
                        backgroundColor: THEME_COLORS.ERROR,
                      },
                    }}
                  />
                }
                label={
                  <Box sx={{ ml: 1 }}>
                    <Typography variant="body1" sx={{ 
                      fontWeight: 500,
                      color: formData.status === 'active' ? THEME_COLORS.SUCCESS : THEME_COLORS.ERROR
                    }}>
                      {formData.status === 'active' ? '帳號已啟用' : '帳號已停用'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: THEME_COLORS.TEXT_MUTED }}>
                      停用的帳號將無法登入系統
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </Box>

          {/* 安全提示 */}
          {account.loginSource === 'database' && (
            <Alert severity="info" icon={<Warning />}>
              <Typography variant="body2">
                <strong>密碼重置:</strong> 如需重置此本地帳戶的密碼，請聯絡系統管理員或使用專門的密碼重置功能。
              </Typography>
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{
        p: getResponsiveSpacing('lg'),
        borderTop: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
        gap: 1
      }}>
        <Button
          onClick={handleClose}
          sx={{ ...commonStyles.secondaryButton }}
          startIcon={<Cancel />}
        >
          取消
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
          sx={{ ...commonStyles.primaryButton }}
          startIcon={<Save />}
        >
          {loading ? '更新中...' : '儲存變更'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditAccountDialog;