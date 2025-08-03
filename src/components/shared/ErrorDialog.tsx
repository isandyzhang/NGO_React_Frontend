import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button
} from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';
import { commonStyles, getDialogPaperProps, getDialogTitleStyle, getDialogContentStyle, getDialogActionsStyle } from '../../styles/commonStyles';

interface ErrorDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  closeText?: string;
  icon?: React.ReactNode;
}

const ErrorDialog: React.FC<ErrorDialogProps> = ({
  open,
  onClose,
  title = '發生錯誤',
  message,
  closeText = '關閉',
  icon = <ErrorIcon />
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={getDialogPaperProps('error')}
    >
      <DialogTitle {...getDialogTitleStyle('error')}>
        {icon}
        {title}
      </DialogTitle>

      <DialogContent {...getDialogContentStyle('error')}>
        <DialogContentText sx={commonStyles.errorDialog.contentText}>
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions {...getDialogActionsStyle('error')}>
        <Button 
          onClick={onClose}
          variant="contained"
          sx={commonStyles.primaryButton}
        >
          {closeText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ErrorDialog; 