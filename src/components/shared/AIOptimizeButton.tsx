import React, { useState } from 'react';
import {
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  AutoFixHigh as AIIcon,
  Compare as CompareIcon
} from '@mui/icons-material';
import { aiService, OptimizeDescriptionResponse } from '../../services/activityManagement/activityAIService';
import { THEME_COLORS } from '../../styles/theme';
import ComparisonDialog from './ComparisonDialog';

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
      <ComparisonDialog
        open={showDialog}
        onClose={handleClose}
        title="AI 優化結果比較"
        icon={<CompareIcon sx={{ color: THEME_COLORS.PRIMARY }} />}
        originalText={optimizedResult?.originalDescription || ''}
        optimizedText={optimizedResult?.optimizedDescription || ''}
        originalLabel="原始描述"
        optimizedLabel="AI 優化後描述"
        originalLength={optimizedResult?.originalLength}
        optimizedLength={optimizedResult?.optimizedDescription}
        onAccept={handleAccept}
        onRegenerate={handleRegenerate}
        acceptButtonText="採用優化版本"
        regenerateButtonText="重新生成"
        isRegenerating={isOptimizing}
      />
    </>
  );
};

export default AIOptimizeButton;