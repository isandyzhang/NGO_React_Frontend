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
import { theme } from '../styles/theme';
import { useAuth } from '../hooks/useAuth';

/**
 * 登入頁面組件
 * 
 * 主要功能：
 * 1. 提供傳統帳號密碼登入功能
 * 2. 支援 Azure AD 單一登入（SSO）
 * 3. 包含載入動畫和錯誤處理
 * 4. 響應式設計，適配各種螢幕尺寸
 * 
 * 特色：
 * - 使用 Framer Motion 製作平滑動畫效果
 * - 整合 Lottie 動畫提升使用者體驗
 * - 包含密碼顯示/隱藏功能
 */
const Login: React.FC = () => {
  const navigate = useNavigate();
  
  // 頁面載入狀態（控制初始載入動畫）
  const [isLoading, setIsLoading] = useState(true);
  

  
  // 表單輸入欄位狀態
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // 錯誤訊息狀態
  const [error, setError] = useState('');
  
  // 從身份驗證 hook 獲取登入功能
  const { login, loading } = useAuth();

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
   * 處理登入表單提交
   * @param event - 表單提交事件
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const result = await login(username, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('登入失敗，請檢查帳號密碼');
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
              backgroundColor: theme.palette.background.default,
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
          backgroundColor: theme.palette.background.default,
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
            backgroundColor: theme.palette.background.paper,
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
            justifyContent: 'center',
          }}>
            <Typography 
              variant="h4" 
              gutterBottom
              sx={{ 
                color: theme.palette.primary.main,
                fontWeight: 'bold',
                textAlign: 'center'
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
            <form onSubmit={handleSubmit}>
              {/* 帳號輸入欄位 */}
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
                
                sx={{
                  '& .MuiInputLabel-root': {
                    color: theme.palette.text.secondary,
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: theme.palette.primary.main,
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: theme.palette.primary.light,
                    },
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                  '& .MuiFormHelperText-root': {
                    color: theme.palette.text.secondary,
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

              <TextField
                label="密碼"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                margin="normal"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{
                  '& .MuiInputLabel-root': {
                    color: theme.palette.text.secondary,
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: theme.palette.primary.main,
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: theme.palette.primary.light,
                    },
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
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
                        sx={{ color: theme.palette.primary.main  
                         }}
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
                disabled={loading}
                sx={{ 
                  mt: 3,
                  backgroundColor: theme.palette.primary.main,
                  color: '#ffffff',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                  '&:disabled': {
                    backgroundColor: theme.palette.text.disabled,
                    color: theme.palette.text.disabled,
                  }
                }}
              >
                {loading ? '登入中...' : '登入'}
              </Button>
            </form>

            <Button
              variant="outlined"
              color="primary"
              fullWidth
              sx={{ 
                mt: 2,
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                fontWeight: 'bold',
                '&:hover': {
                  borderColor: theme.palette.primary.dark,
                  backgroundColor: theme.palette.primary.light + '10',
                  color: theme.palette.primary.dark,
                },
                '&:disabled': {
                  borderColor: theme.palette.text.disabled,
                  color: theme.palette.text.disabled,
                }
              }}
              disabled={loading}
            >
              {loading ? '登入中...' : '登入系統'}
            </Button>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Login;
