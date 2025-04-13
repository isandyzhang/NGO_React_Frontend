// components/shared/LoadingOverlay.tsx
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

const LoadingContainer = styled(motion.div)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#ffffff',
  zIndex: 9999,
});

const LoadingWrapper = styled(Box)({
  width: '300px',
  height: '300px',
});

const LoadingOverlay = () => (
  <LoadingContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <LoadingWrapper>
      <CircularProgress size={80} color="primary" />
    </LoadingWrapper>
  </LoadingContainer>
);

export default LoadingOverlay;
