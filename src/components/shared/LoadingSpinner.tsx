// components/shared/LoadingOverlay.tsx
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';

const LoadingContainer = styled(motion.div)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.palette.background.paper,
  zIndex: 9999,
}));

const LoadingWrapper = styled(Box)({
  width: '300px',
  height: '300px',
});

const LoadingOverlay = () => {
  const theme = useTheme();
  
  return (
    <LoadingContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <LoadingWrapper>
        <CircularProgress size={80} sx={{ color: theme.palette.primary.main }} />
      </LoadingWrapper>
    </LoadingContainer>
  );
};

export default LoadingOverlay;
