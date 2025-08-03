import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  InputAdornment,
  ThemeProvider,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff, AccountCircle, Lock } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { theme, THEME_COLORS } from '../styles/theme';
import { commonStyles } from '../styles/commonStyles';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/accountManagement/authService';

/**
 * 登入頁面組件
 * 
 * 主要功能：
 * 1. 分步驟驗證：先驗證帳號，再輸入密碼
 * 2. 支援 Azure AD 單一登入（SSO）
 * 3. 包含載入動畫和錯誤處理
 * 4. 響應式設計，適配各種螢幕尺寸
 * 
 * 特色：
 * - 使用 Framer Motion 製作平滑動畫效果
 * - 整合 Lottie 動畫提升使用者體驗
 * - 分步驟驗證提供更好的使用者體驗
 */
const Login: React.FC = () => {
  const navigate = useNavigate();
  
  // 頁面載入狀態（控制初始載入動畫）
  const [isLoading, setIsLoading] = useState(true);
  
  // 登入步驟狀態
  const [step, setStep] = useState<'email' | 'password'>('email');
  
  // 表單輸入欄位狀態
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // 錯誤訊息狀態
  const [error, setError] = useState('');
  
  // 載入狀態
  const [emailVerifying, setEmailVerifying] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [azureLoading, setAzureLoading] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  
  // 從身份驗證 hook 獲取混合模式登入功能
  const { loginWithDatabase, loginWithAzure, loading, isAzureEnabled, isAuthenticated, user } = useAuth();

  /**
   * 組件掛載時的初始化效果
   * 設定載入動畫持續時間
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  /**
   * 檢查使用者是否已登入，如果是則自動跳轉到 Dashboard
   * 特別處理 Azure 登出後的情況
   */
  useEffect(() => {
    // 檢查 URL 是否為 Azure 登出後的重導向
    const currentPath = window.location.pathname;
    const isLogoutRedirect = currentPath === '/login';
    
    if (isAuthenticated && !loading) {
      // 如果是登出後重導向，暫停一會確保狀態已完全清除
      if (isLogoutRedirect && window.location.search === '') {
        console.log('檢測到可能的登出後重導向，延遲檢查登入狀態');
        const delayTimer = setTimeout(() => {
          // 重新檢查登入狀態
          if (isAuthenticated && !loading) {
            console.log('延遲檢查後，使用者仍已登入，跳轉到 Dashboard');
            navigate('/dashboard');
          }
        }, 500);
        return () => clearTimeout(delayTimer);
      } else {
        console.log('使用者已登入，自動跳轉到 Dashboard');
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, loading, navigate]);
  
  /**
   * 驗證帳號（Email）
   * 調用真實的 API 驗證 Email 是否存在
   */
  const handleEmailVerification = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!username.trim()) {
      setError('請輸入帳號');
      return;
    }
    
    // 簡單的 Email 格式驗證
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
      setError('請輸入有效的 Email 地址');
      return;
    }
    
    setEmailVerifying(true);
    setError('');
    
    try {
      // 呼叫真實的 Email 驗證 API
      const response = await authService.verifyEmail(username);
      
      if (response.success) {
        // 驗證成功，進入密碼步驟
        setStep('password');
      } else {
        // 驗證失敗，顯示錯誤訊息
        setError(response.message);
      }
    } catch (error) {
      console.error('Email驗證錯誤:', error);
      setError('驗證過程中發生錯誤，請稍後再試');
    } finally {
      setEmailVerifying(false);
    }
  };
  
  /**
   * 處理密碼登入
   */
  const handlePasswordLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!password.trim()) {
      setError('請輸入密碼');
      return;
    }
    
    setPasswordLoading(true);
    setError('');
    
    try {
      const result = await loginWithDatabase(username, password);
      if (result.success) {
        // 顯示成功動畫
        setShowSuccessAnimation(true);
        // 3秒後跳轉到首頁
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('登入失敗，請檢查密碼');
    } finally {
      setPasswordLoading(false);
    }
  };
  
  /**
   * 返回帳號輸入步驟
   */
  const handleBackToEmail = () => {
    setStep('email');
    setPassword('');
    setError('');
  };

  /**
   * 處理 Azure AD 登入
   */
  const handleAzureLogin = async () => {
    if (!isAzureEnabled()) {
      setError('Azure AD 登入功能未啟用，請聯絡系統管理員');
      return;
    }

    setAzureLoading(true);
    setError('');

    try {
      const result = await loginWithAzure();
      
      if (result.success) {
        // 顯示成功動畫
        setShowSuccessAnimation(true);
        // 3秒後跳轉到首頁
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setError(result.message);
      }
    } catch (error: any) {
      setError('Azure AD 登入失敗，請稍後再試');
    } finally {
      setAzureLoading(false);
    }
  };


  return (
    <ThemeProvider theme={theme}>
      {/* 載入動畫覆蓋層 */}
      <AnimatePresence>
        {isLoading && (
          <Box
            component={motion.div}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: THEME_COLORS.BACKGROUND_PRIMARY,
              zIndex: 9999,
            }}
          >
            {/* Lottie 載入動畫 */}
            <Box sx={{ width: 300, height: 300 }}>
              <DotLottieReact
                src="https://lottie.host/6f8fd7f9-a149-4d2a-a15e-d54b64793df0/Vw9Cdzfb0k.lottie"
                loop
                autoplay
                style={{ width: '100%', height: '100%' }}
              />
            </Box>
          </Box>
        )}
      </AnimatePresence>

      {/* 登入成功動畫覆蓋層 */}
      <AnimatePresence>
        {showSuccessAnimation && (
          <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: THEME_COLORS.BACKGROUND_PRIMARY,
              zIndex: 10000,
            }}
          >
            {/* 使用原本的載入動畫 */}
            <Box sx={{ width: 300, height: 300 }}>
              <DotLottieReact
                src="https://lottie.host/6f8fd7f9-a149-4d2a-a15e-d54b64793df0/Vw9Cdzfb0k.lottie"
                loop
                autoplay
                style={{ width: '100%', height: '100%' }}
              />
            </Box>
            <Typography 
              variant="h5" 
              sx={{ 
                color: THEME_COLORS.SUCCESS, 
                fontWeight: 600,
                mt: 2,
                textAlign: 'center'
              }}
            >
              登入成功！
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: THEME_COLORS.TEXT_PRIMARY, 
                fontWeight: 500,
                mt: 1,
                textAlign: 'center'
              }}
            >
              歡迎回來，{
                (() => {
                  if (!user) return '用戶';
                  if (user.loginSource === 'database') {
                    return (user as any).name || '用戶';
                  } else if (user.loginSource === 'azure') {
                    return (user as any).displayName || '用戶';
                  }
                  return '用戶';
                })()
              }！
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: THEME_COLORS.TEXT_SECONDARY, 
                mt: 1,
                textAlign: 'center'
              }}
            >
              正在跳轉到主頁面...
            </Typography>
          </Box>
        )}
      </AnimatePresence>

      {/* 主要登入界面 */}
      <Box
        width="100vw"
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{
          backgroundImage: 'url(/images/loginbackground.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: THEME_COLORS.BACKGROUND_PRIMARY,
        }}
      >
        {/* 登入卡片容器 */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 2 }}
          sx={{
            display: 'flex',
            flexDirection: 'row',
            backgroundColor: THEME_COLORS.BACKGROUND_CARD,
            borderRadius: 2,
            boxShadow: 4,
            overflow: 'hidden',
            maxWidth: 900,
            width: '90%',
          }}
        >
          {/* 左側品牌展示區域（桌面版才顯示） */}
          <Box
            sx={{
              width: '85%',
              display: { xs: 'none', md: 'flex' },
              background: 'linear-gradient(rgba(46,125,50,0), rgba(46,125,50,0.7)), url("/images/case-management.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              justifyContent: 'flex-end',
              alignItems: 'center',
              padding: 4,
            }}
          >
            {/* 品牌 Logo 區域 */}
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',  
                alignItems: 'flex-end',     
                height: '100%',          
                pb: 4                        
              }}
            >
             
            </Box>
          </Box>

          {/* 右側登入表單區域 */}
          <Box sx={{ 
            width: '55%', 
            padding: 4, 
            height: '550px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            paddingTop: 6,
          }}>
            <Typography 
              variant="h3" 
              gutterBottom
              sx={{ 
                color: THEME_COLORS.PRIMARY,
                fontWeight: 'bold',
                textAlign: 'center',
                mb: 4
              }}
            >
              Login
            </Typography>

            {/* 錯誤訊息顯示 */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* 登入表單 */}
            <form onSubmit={step === 'email' ? handleEmailVerification : handlePasswordLogin}>
              {/* 帳號驗證步驟 */}
              <AnimatePresence mode="wait">
                {step === 'email' && (
                  <motion.div
                    key="email-step"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TextField
                      label="帳號"
                      placeholder="請輸入您的Email地址"
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      type="email"
                      disabled={emailVerifying}
                      
                      sx={{
                        mt: 8,
                        mb:4,
                        '& .MuiInputLabel-root': {
                          color: THEME_COLORS.TEXT_SECONDARY,
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: THEME_COLORS.PRIMARY,
                        },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: THEME_COLORS.BORDER_LIGHT,
                          },
                          '&:hover fieldset': {
                            borderColor: THEME_COLORS.PRIMARY,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: THEME_COLORS.PRIMARY,
                          },
                        },
                        '& .MuiFormHelperText-root': {
                          color: THEME_COLORS.TEXT_SECONDARY,
                          fontSize: '0.75rem',
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccountCircle color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={emailVerifying}
                      sx={{ 
                        ...commonStyles.primaryButton,
                      }}
                    >
                      {emailVerifying ? '驗證中...' : '下一步'}
                    </Button>
                  </motion.div>
                )}

                {/* 密碼輸入步驟 */}
                {step === 'password' && (
                  <motion.div
                    key="password-step"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* 顯示已驗證的帳號 */}
                    <Box sx={{ mb: 2, p: 2, backgroundColor: THEME_COLORS.SUCCESS_LIGHT, borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ color: THEME_COLORS.SUCCESS_DARK }}>
                        ✓ 帳號已驗證: {username}
                      </Typography>
                    </Box>

                    <TextField
                      label="密碼"
                      type={showPassword ? 'text' : 'password'}
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoFocus
                      sx={{
                        '& .MuiInputLabel-root': {
                          color: THEME_COLORS.TEXT_SECONDARY,
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: THEME_COLORS.PRIMARY,
                        },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: THEME_COLORS.BORDER_LIGHT,
                          },
                          '&:hover fieldset': {
                            borderColor: THEME_COLORS.PRIMARY,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: THEME_COLORS.PRIMARY,
                          },
                          '& input': {
                            textAlign: 'center',
                          },
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="primary" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              sx={{ color: THEME_COLORS.PRIMARY }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={passwordLoading}
                      sx={{ 
                        mt: 3,
                        ...commonStyles.primaryButton,
                      }}
                    >
                      {passwordLoading ? '登入中...' : '登入'}
                    </Button>
                    <Button
                      type="button"
                      fullWidth
                      variant="text"
                      onClick={handleBackToEmail}
                      sx={{ 
                        mt: 2,
                        color: THEME_COLORS.TEXT_SECONDARY,
                        '&:hover': {
                          backgroundColor: THEME_COLORS.HOVER_LIGHT,
                        }
                      }}
                    >
                      ← 返回帳號驗證
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* 分隔線 */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              my: 3,
              '&::before': {
                content: '""',
                flex: 1,
                height: '1px',
                backgroundColor: THEME_COLORS.BORDER_LIGHT,
              },
              '&::after': {
                content: '""',
                flex: 1,
                height: '1px',
                backgroundColor: THEME_COLORS.BORDER_LIGHT,
              }
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  px: 2, 
                  color: THEME_COLORS.TEXT_MUTED,
                  fontSize: '0.875rem'
                }}
              >
                或
              </Typography>
            </Box>

            {/* Azure SSO 登入按鈕 - 根據配置顯示/隱藏 */}
            {isAzureEnabled() && (
              <Button
                fullWidth
                variant="outlined"
                disabled={azureLoading}
                startIcon={
                  <Box
                    component="img"
                    src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjEiIGhlaWdodD0iMjEiIHZpZXdCb3g9IjAgMCAyMSAyMSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB4PSIxIiB5PSIxIiB3aWR0aD0iOSIgaGVpZ2h0PSI5IiBmaWxsPSIjRjI1MDIyIi8+CiAgPHJlY3QgeD0iMTEiIHk9IjEiIHdpZHRoPSI5IiBoZWlnaHQ9IjkiIGZpbGw9IiM3RkJBMDAiLz4KICA8cmVjdCB4PSIxIiB5PSIxMSIgd2lkdGg9IjkiIGhlaWdodD0iOSIgZmlsbD0iIzAwQTRFRiIvPgogIDxyZWN0IHg9IjExIiB5PSIxMSIgd2lkdGg9IjkiIGhlaWdodD0iOSIgZmlsbD0iI0ZGQjkwMCIvPgo8L3N2Zz4K"
                    alt="Microsoft"
                    sx={{ width: 20, height: 20 }}
                  />
                }
                sx={{
                  py: 1.5,
                  borderColor: THEME_COLORS.BORDER_DEFAULT,
                  color: THEME_COLORS.TEXT_PRIMARY,
                  backgroundColor: THEME_COLORS.BACKGROUND_CARD,
                  '&:hover': {
                    borderColor: THEME_COLORS.PRIMARY,
                    backgroundColor: THEME_COLORS.PRIMARY_LIGHT_BG,
                  },
                  '&:disabled': {
                    borderColor: THEME_COLORS.BORDER_LIGHT,
                    color: THEME_COLORS.DISABLED_TEXT,
                    backgroundColor: THEME_COLORS.DISABLED_BG,
                  },
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                }}
                onClick={handleAzureLogin}
              >
                {azureLoading ? '登入中...' : '使用 Azure AD 登入'}
              </Button>
            )}

            {/* Azure 未啟用時的提示 */}
            {!isAzureEnabled() && (
              <Button
                fullWidth
                variant="outlined"
                disabled
                startIcon={
                  <Box
                    component="img"
                    src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjEiIGhlaWdodD0iMjEiIHZpZXdCb3g9IjAgMCAyMSAyMSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB4PSIxIiB5PSIxIiB3aWR0aD0iOSIgaGVpZ2h0PSI5IiBmaWxsPSIjRjI1MDIyIi8+CiAgPHJlY3QgeD0iMTEiIHk9IjEiIHdpZHRoPSI5IiBoZWlnaHQ9IjkiIGZpbGw9IiM3RkJBMDAiLz4KICA8cmVjdCB4PSIxIiB5PSIxMSIgd2lkdGg9IjkiIGhlaWdodD0iOSIgZmlsbD0iIzAwQTRFRiIvPgogIDxyZWN0IHg9IjExIiB5PSIxMSIgd2lkdGg9IjkiIGhlaWdodD0iOSIgZmlsbD0iI0ZGQjkwMCIvPgo8L3N2Zz4K"
                    alt="Microsoft"
                    sx={{ width: 20, height: 20, opacity: 0.5 }}
                  />
                }
                sx={{
                  py: 1.5,
                  borderColor: THEME_COLORS.BORDER_LIGHT,
                  color: THEME_COLORS.DISABLED_TEXT,
                  backgroundColor: THEME_COLORS.DISABLED_BG,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                }}
              >
                Azure AD 登入（未配置）
              </Button>
            )}

            {/* 版權資訊 */}
            <Typography 
              variant="body2" 
              sx={{ 
                color: THEME_COLORS.TEXT_MUTED,
                fontSize: '0.75rem',
                textAlign: 'center',
                mt: 3,
                opacity: 0.8,
              }}
            >
              © 2024 NGO 後台管理系統. All rights reserved. (展示用)
            </Typography>

          </Box>
        </Box>

      </Box>
    </ThemeProvider>
  );
};

export default Login;
