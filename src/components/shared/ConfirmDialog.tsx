import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button
} from '@mui/material';
import { commonStyles, getDialogPaperProps, getDialogTitleStyle, getDialogContentStyle, getDialogActionsStyle } from '../../styles/commonStyles';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  confirmButtonVariant?: 'primary' | 'danger' | 'approve' | 'reject';
  icon?: React.ReactNode;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  title,
  message,
  confirmText = '確認',
  cancelText = '取消',
  onConfirm,
  confirmButtonVariant = 'primary',
  icon
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={getDialogPaperProps('confirm')}
    >
      <DialogTitle {...getDialogTitleStyle('confirm')}>
        {icon}
        {title}
      </DialogTitle>

      <DialogContent {...getDialogContentStyle('confirm')}>
        <DialogContentText sx={commonStyles.confirmDialog.contentText}>
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions {...getDialogActionsStyle('confirm')}>
        <Button 
          onClick={onClose}
          color="inherit"
        >
          {cancelText}
        </Button>
        
        <Button
          onClick={handleConfirm}
          variant="contained"
          sx={commonStyles[`${confirmButtonVariant}Button`]}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog; 