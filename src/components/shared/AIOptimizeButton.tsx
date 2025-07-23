import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Divider
} from '@mui/material';
import {
  AutoFixHigh as AIIcon,
  Compare as CompareIcon,
  Check as CheckIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { aiService, OptimizeDescriptionResponse } from '../../services/aiService';
import { THEME_COLORS } from '../../styles/theme';

interface AIOptimizeButtonProps {
  description: string;
  onOptimized: (optimizedText: string) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const AIOptimizeButton: React.FC<AIOptimizeButtonProps> = ({
  description,
  onOptimized,
  disabled = false,
  size = 'medium'
}) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [optimizedResult, setOptimizedResult] = useState<OptimizeDescriptionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOptimize = async () => {
    if (!description.trim()) {
      setError('請先輸入活動描述');
      return;
    }

    setIsOptimizing(true);
    setError(null);

    try {
      const result = await aiService.optimizeDescription(description);
      setOptimizedResult(result);
      setShowDialog(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI 優化失敗');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleAccept = () => {
    if (optimizedResult) {
      onOptimized(optimizedResult.optimizedDescription);
      setShowDialog(false);
      setOptimizedResult(null);
    }
  };

  const handleRegenerate = async () => {
    if (!optimizedResult) return;
    
    setIsOptimizing(true);
    setError(null);

    try {
      const result = await aiService.optimizeDescription(optimizedResult.originalDescription);
      setOptimizedResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI 重新生成失敗');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleClose = () => {
    setShowDialog(false);
    setOptimizedResult(null);
    setError(null);
  };

  return (
    <>
      <Button
        variant="outlined"
        size={size}
        startIcon={isOptimizing ? <CircularProgress size={16} /> : <AIIcon />}
        onClick={handleOptimize}
        disabled={disabled || isOptimizing || !description.trim()}
        sx={{
          borderColor: THEME_COLORS.PRIMARY,
          color: THEME_COLORS.PRIMARY,
          '&:hover': {
            borderColor: THEME_COLORS.PRIMARY_HOVER,
            backgroundColor: THEME_COLORS.PRIMARY_LIGHT_BG
          },
          '&.Mui-disabled': {
            borderColor: 'rgba(0, 0, 0, 0.12)',
            color: 'rgba(0, 0, 0, 0.26)'
          }
        }}
      >
        {isOptimizing ? 'AI 優化中...' : 'AI 優化'}
      </Button>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mt: 1 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* 比較對話框 */}
      <Dialog 
        open={showDialog} 
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '500px' }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          pb: 1
        }}>
          <CompareIcon sx={{ color: THEME_COLORS.PRIMARY }} />
          AI 優化結果比較
        </DialogTitle>

        <DialogContent>
          {optimizedResult && (
            <Box>
              {/* 統計資訊 */}
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                mb: 3,
                flexWrap: 'wrap'
              }}>
                <Chip 
                  label={`原文: ${optimizedResult.originalLength} 字`}
                  size="small"
                  variant="outlined"
                />
                <Chip 
                  label={`優化後: ${optimizedResult.optimizedLength} 字`}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
                <Chip 
                  label={`${optimizedResult.optimizedLength > optimizedResult.originalLength ? '+' : ''}${optimizedResult.optimizedLength - optimizedResult.originalLength} 字`}
                  size="small"
                  color={optimizedResult.optimizedLength > optimizedResult.originalLength ? 'success' : 'default'}
                />
              </Box>

              {/* 原文 */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ 
                  color: 'text.secondary',
                  fontWeight: 600
                }}>
                  原始描述
                </Typography>
                <Box sx={{ 
                  p: 2, 
                  backgroundColor: 'grey.50',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}>
                  <Typography variant="body2" sx={{ 
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6
                  }}>
                    {optimizedResult.originalDescription}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* 優化後 */}
              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ 
                  color: THEME_COLORS.PRIMARY,
                  fontWeight: 600
                }}>
                  AI 優化後描述
                </Typography>
                <Box sx={{ 
                  p: 2, 
                  backgroundColor: THEME_COLORS.PRIMARY_LIGHT_BG,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: THEME_COLORS.PRIMARY
                }}>
                  <Typography variant="body2" sx={{ 
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6
                  }}>
                    {optimizedResult.optimizedDescription}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={handleClose}
            color="inherit"
          >
            取消
          </Button>
          
          <Button
            onClick={handleRegenerate}
            startIcon={isOptimizing ? <CircularProgress size={16} /> : <RefreshIcon />}
            disabled={isOptimizing}
            color="inherit"
          >
            {isOptimizing ? '重新生成中...' : '重新生成'}
          </Button>

          <Button
            onClick={handleAccept}
            startIcon={<CheckIcon />}
            variant="contained"
            disabled={isOptimizing}
            sx={{
              backgroundColor: THEME_COLORS.PRIMARY,
              '&:hover': {
                backgroundColor: THEME_COLORS.PRIMARY_HOVER
              }
            }}
          >
            採用優化版本
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AIOptimizeButton;