import React, { useState } from 'react';
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
  FormControlLabel,
  Switch,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  PersonAdd,
  Visibility,
  VisibilityOff,
  Save,
  Cancel,
} from '@mui/icons-material';
import { THEME_COLORS } from '../../styles/theme';
import { commonStyles, getResponsiveSpacing } from '../../styles/commonStyles';
import { CreateAccountRequest } from '../../services';

interface AddAccountDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (accountData: CreateAccountRequest) => Promise<void>;
}

/**
 * 新增帳號對話框組件
 */
const AddAccountDialog: React.FC<AddAccountDialogProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<CreateAccountRequest>({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    loginSource: 'database',
    phone: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  // 重置表單
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'staff',
      loginSource: 'database',
      phone: '',
    });
    setShowPassword(false);
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
  const handleFormChange = (field: keyof CreateAccountRequest, value: string) => {
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

  // 處理登入來源變更
  const handleLoginSourceChange = (loginSource: 'database' | 'azure') => {
    setFormData(prev => ({
      ...prev,
      loginSource,
      // Azure AD 帳戶不需要密碼
      password: loginSource === 'azure' ? undefined : prev.password || '',
    }));
  };

  // 表單驗證
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('請輸入姓名');
      return false;
    }

    if (!formData.email.trim()) {
      setError('請輸入電子信箱');
      return false;
    }

    if (!validateEmail(formData.email)) {
      setError('請輸入有效的電子信箱格式');
      return false;
    }

    if (formData.loginSource === 'database' && !formData.password?.trim()) {
      setError('本地帳戶需要設定密碼');
      return false;
    }

    if (formData.loginSource === 'database' && formData.password && formData.password.length < 6) {
      setError('密碼長度至少需要6個字符');
      return false;
    }

    return true;
  };

  // 儲存帳號
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError(null);
      await onSave(formData);
      handleClose();
    } catch (err: any) {
      // 處理不同類型的錯誤
      if (err.response?.status === 409) {
        setError('此電子信箱已被使用，請使用其他信箱地址');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('建立帳號失敗，請稍後再試');
      }
    } finally {
      setSaving(false);
    }
  };

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
        <PersonAdd sx={{ color: THEME_COLORS.PRIMARY }} />
        新增系統帳號
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

          {/* 基本資訊 */}
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
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                fullWidth
                placeholder="請輸入使用者姓名"
                sx={{ ...commonStyles.formInput }}
              />

              <TextField
                label="電子信箱 *"
                type="email"
                value={formData.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
                error={!!emailError}
                helperText={emailError}
                fullWidth
                placeholder="user@example.com"
                sx={{ ...commonStyles.formInput }}
              />

              <TextField
                label="電話號碼"
                value={formData.phone || ''}
                onChange={(e) => handleFormChange('phone', e.target.value)}
                fullWidth
                placeholder="09XX-XXX-XXX"
                sx={{ ...commonStyles.formInput }}
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
              權限設定
            </Typography>

            <FormControl fullWidth sx={{ ...commonStyles.formInput }}>
              <InputLabel>使用者角色 *</InputLabel>
              <Select
                value={formData.role}
                label="使用者角色 *"
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
          </Box>

          {/* 登入設定 */}
          <Box>
            <Typography variant="subtitle2" sx={{
              mb: getResponsiveSpacing('md'),
              color: THEME_COLORS.PRIMARY,
              fontWeight: 600
            }}>
              登入設定
            </Typography>

            <Box sx={{ mb: getResponsiveSpacing('md') }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.loginSource === 'azure'}
                    onChange={(e) => handleLoginSourceChange(e.target.checked ? 'azure' : 'database')}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: THEME_COLORS.INFO,
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: THEME_COLORS.INFO,
                      },
                    }}
                  />
                }
                label={
                  <Box sx={{ ml: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formData.loginSource === 'azure' ? 'Azure AD 帳戶' : '本地資料庫帳戶'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: THEME_COLORS.TEXT_MUTED }}>
                      {formData.loginSource === 'azure'
                        ? '使用公司 Azure AD 進行身份驗證'
                        : '使用系統內建的帳號密碼登入'
                      }
                    </Typography>
                  </Box>
                }
              />
            </Box>

            {/* 密碼設定 (僅本地帳戶) */}
            {formData.loginSource === 'database' && (
              <TextField
                label="密碼 *"
                type={showPassword ? 'text' : 'password'}
                value={formData.password || ''}
                onChange={(e) => handleFormChange('password', e.target.value)}
                fullWidth
                placeholder="請設定登入密碼 (至少6個字符)"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ ...commonStyles.formInput }}
              />
            )}
          </Box>
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
          {loading ? '建立中...' : '建立帳號'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddAccountDialog;