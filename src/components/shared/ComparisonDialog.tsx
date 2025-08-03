import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Chip,
  Divider,
  Button
} from '@mui/material';
import { commonStyles, getDialogPaperProps, getDialogTitleStyle, getDialogContentStyle, getDialogActionsStyle } from '../../styles/commonStyles';

interface ComparisonDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  originalText: string;
  optimizedText: string;
  originalLabel?: string;
  optimizedLabel?: string;
  originalLength?: number;
  optimizedLength?: string;
  onAccept?: () => void;
  onRegenerate?: () => void;
  acceptButtonText?: string;
  regenerateButtonText?: string;
  isRegenerating?: boolean;
}

const ComparisonDialog: React.FC<ComparisonDialogProps> = ({
  open,
  onClose,
  title,
  icon,
  originalText,
  optimizedText,
  originalLabel = '原始內容',
  optimizedLabel = '優化後內容',
  originalLength,
  optimizedLength,
  onAccept,
  onRegenerate,
  acceptButtonText = '採用優化版本',
  regenerateButtonText = '重新生成',
  isRegenerating = false
}) => {
  const lengthDiff = optimizedLength && originalLength 
    ? optimizedLength.length - originalLength 
    : null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={getDialogPaperProps('comparison')}
    >
      <DialogTitle {...getDialogTitleStyle('comparison')}>
        {icon}
        {title}
      </DialogTitle>

      <DialogContent {...getDialogContentStyle('comparison')}>
        <Box>
          {/* 統計資訊 */}
          {(originalLength || optimizedLength) && (
            <Box sx={commonStyles.comparisonDialog.statsContainer}>
              {originalLength && (
                <Chip 
                  label={`原文: ${originalLength} 字`}
                  size="small"
                  variant="outlined"
                />
              )}
              {optimizedLength && (
                <Chip 
                  label={`優化後: ${optimizedLength.length} 字`}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              )}
              {lengthDiff !== null && (
                <Chip 
                  label={`${lengthDiff > 0 ? '+' : ''}${lengthDiff} 字`}
                  size="small"
                  color={lengthDiff > 0 ? 'success' : 'default'}
                />
              )}
            </Box>
          )}

          {/* 原文 */}
          <Box sx={commonStyles.comparisonDialog.textComparison.original.container}>
            <Typography variant="subtitle2" gutterBottom sx={commonStyles.comparisonDialog.textComparison.original.title}>
              {originalLabel}
            </Typography>
            <Box sx={commonStyles.comparisonDialog.textComparison.original.content}>
              <Typography variant="body2" sx={commonStyles.comparisonDialog.textComparison.original.text}>
                {originalText}
              </Typography>
            </Box>
          </Box>

          <Divider sx={commonStyles.comparisonDialog.divider} />

          {/* 優化後 */}
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={commonStyles.comparisonDialog.textComparison.optimized.title}>
              {optimizedLabel}
            </Typography>
            <Box sx={commonStyles.comparisonDialog.textComparison.optimized.content}>
              <Typography variant="body2" sx={commonStyles.comparisonDialog.textComparison.optimized.text}>
                {optimizedText}
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions {...getDialogActionsStyle('comparison')}>
        <Button 
          onClick={onClose}
          color="inherit"
        >
          取消
        </Button>
        
        {onRegenerate && (
          <Button
            onClick={onRegenerate}
            disabled={isRegenerating}
            color="inherit"
          >
            {isRegenerating ? '重新生成中...' : regenerateButtonText}
          </Button>
        )}

        {onAccept && (
          <Button
            onClick={onAccept}
            variant="contained"
            disabled={isRegenerating}
            sx={{
              backgroundColor: commonStyles.primaryButton.bgcolor,
              '&:hover': {
                backgroundColor: commonStyles.primaryButton['&:hover'].bgcolor
              }
            }}
          >
            {acceptButtonText}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ComparisonDialog; 