import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Link,
  IconButton,
  InputAdornment,
  ThemeProvider,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff, AccountCircle, Lock, Casino } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { theme } from '../styles/theme';
import { commonStyles } from '../styles/commonStyles';
import { useAuth } from '../hooks/useAuth';

/**
 * 登入頁面組件
 * 
 * 主要功能：
 * 1. 提供傳統帳號密碼登入功能
 * 2. 支援 Azure AD 單一登入（SSO）
 * 3. 包含載入動畫和錯誤處理
 * 4. 隱藏的遊戲功能（娛樂用途）
 * 5. 響應式設計，適配各種螢幕尺寸
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
  
  // Azure 登入載入狀態
  const [isAzureLoading, setIsAzureLoading] = useState(false);
  
  // 表單輸入欄位狀態
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // 隱藏遊戲功能相關狀態
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [userNumber, setUserNumber] = useState<number | null>(null);
  const [showGameInput, setShowGameInput] = useState(false);
  
  // 錯誤訊息狀態
  const [error, setError] = useState('');
  
  // 從身份驗證 hook 獲取登入功能
  const { login, azureLogin } = useAuth();

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
   * 處理傳統登入表單提交
   * @param event - 表單提交事件
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (error) {
      setError('登入失敗，請檢查帳號密碼');
    }
  };

  /**
   * 處理 Azure AD 登入
   * 提供單一登入（SSO）功能
   */
  const handleAzureLogin = async () => {
    try {
      await azureLogin();
      navigate('/dashboard');
    } catch (error) {
      setError('Azure 登入失敗');
    }
  };

  /**
   * 啟動隱藏的數字遊戲
   * 娛樂功能：與系統 PK 數字大小
   */
  const playGame = () => {
    setShowGameInput(true);
  };

  /**
   * 執行數字 PK 遊戲
   * 比較用戶輸入與系統隨機數字
   */
  const handlePK = () => {
    if (userNumber === null) return;
    const aiNumber = Math.floor(Math.random() * 10) + 1;
    if (userNumber > aiNumber) {
      setGameResult(`你贏了！你的數字是 ${userNumber}，系統的是 ${aiNumber}`);
      localStorage.setItem('isAuthenticated', 'true');
      setTimeout(() => navigate('/'), 1500);
    } else {
      setGameResult(`你輸了！你的數字是 ${userNumber}，系統的是 ${aiNumber}`);
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
              {/* 可互動的 Logo，懸停時會旋轉 */}
              <motion.img
                src="/images/logo.png"
                alt="個案管理系統"
                style={{ width: 200, height: 'auto' }}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.8 }}
              />
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
            <Typography variant="h4" gutterBottom>
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
                variant="outlined"
                margin="normal"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
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
                sx={{ mt: 3 }}
              >
                登入
              </Button>
            </form>

            <Button
              variant="outlined"
              color="primary"
              fullWidth
              sx={{ 
                mt: 2,
                ...commonStyles.secondaryButton
              }}
              onClick={handleAzureLogin}
              disabled={isAzureLoading}
            >
              {isAzureLoading ? '登入中...' : '使用 Azure SSO 登入'}
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              sx={{ 
                mt: 2,
                ...commonStyles.secondaryButton
              }}
              startIcon={<Casino />}
              onClick={playGame}
            >
              比大小登入
            </Button>

            {showGameInput && (
              <Box display="flex" paddingTop={2} gap={2} alignItems="center">
                <TextField
                  label="輸入一個數字 (1-10)"
                  type="number"
                  fullWidth
                  value={userNumber ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserNumber(Number(e.target.value))}
                  inputProps={{
                    min: 1,
                    max: 10,
                  }}
                  sx={{
                    ...commonStyles.formInput,
                    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                      '-webkit-appearance': 'none',
                    },
                    '& input[type=number]': {
                      '-moz-appearance': 'textfield',
                    },
                  }}
                  variant="outlined"
                  margin="normal"
                />
                <Button 
                  variant="outlined" 
                  onClick={handlePK} 
                  sx={{ 
                    height: '56px',
                    ...commonStyles.secondaryButton
                  }}
                >
                  PK
                </Button>
              </Box>
            )}

            {gameResult && (
              <Typography
                variant="body1"
                align="center"
                sx={{ mt: 2, p: 2, bgcolor: 'rgba(46, 125, 50, 0.1)', borderRadius: 1, color: '#2e7d32' }}
              >
                {gameResult}
              </Typography>
            )}

            <Box mt={3} textAlign="center">
              <Link href="#" variant="body2" sx={{ color: '#2e7d32' }}>
                忘記密碼？
              </Link>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Login;
