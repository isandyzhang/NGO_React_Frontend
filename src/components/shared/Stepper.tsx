import React from 'react';
import {
  Box,
  Stepper as MuiStepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Paper,
  Typography,
} from '@mui/material';
import {
  Check,
  NavigateNext,
  NavigateBefore,
} from '@mui/icons-material';
import { THEME_COLORS } from '../../styles/theme';

interface Step {
  label: string;
  description?: string;
  content: React.ReactNode;
}

interface StepperProps {
  steps: Step[];
  activeStep: number;
  onStepChange: (step: number) => void;
  onNext?: () => void;
  onBack?: () => void;
  onFinish?: () => void;
  showActions?: boolean;
  canProceed?: boolean;
}

const Stepper: React.FC<StepperProps> = ({
  steps,
  activeStep,
  onStepChange,
  onNext,
  onBack,
  onFinish,
  showActions = true,
  canProceed = true,
}) => {
  const handleNext = () => {
    if (onNext) {
      onNext();
    } else {
      onStepChange(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      onStepChange(activeStep - 1);
    }
  };

  const handleFinish = () => {
    if (onFinish) {
      onFinish();
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* 横向步骤指示器 */}
      <Paper elevation={0} sx={{ p: { xs: 3, md: 3.5 }, mb: { xs: 3, md: 3.5 }, bgcolor: 'transparent' }}>
        <MuiStepper 
          activeStep={activeStep} 
          alternativeLabel
          sx={{
            '& .MuiStepLabel-root .Mui-completed': {
              color: THEME_COLORS.SUCCESS,
            },
            '& .MuiStepLabel-root .Mui-active': {
              color: THEME_COLORS.PRIMARY,
            },
            '& .MuiStepLabel-root .Mui-disabled': {
              color: THEME_COLORS.TEXT_MUTED,
            },
            '& .MuiStepConnector-line': {
              borderColor: THEME_COLORS.BORDER_LIGHT,
            },
            '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': {
              borderColor: THEME_COLORS.PRIMARY,
            },
            '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': {
              borderColor: THEME_COLORS.SUCCESS,
            },
          }}
        >
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                StepIconComponent={({ active, completed }) => {
                  if (completed) {
                    return (
                      <Box
                        sx={{
                          width: { xs: 32, md: 36 }, // 平板增加大小
                          height: { xs: 32, md: 36 }, // 平板增加大小
                          borderRadius: '50%',
                          bgcolor: THEME_COLORS.SUCCESS,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                        }}
                      >
                        <Check sx={{ fontSize: { xs: 20, md: 22 } }} />
                      </Box>
                    );
                  }
                  return (
                    <Box
                      sx={{
                        width: { xs: 32, md: 36 }, // 平板增加大小
                        height: { xs: 32, md: 36 }, // 平板增加大小
                        borderRadius: '50%',
                        bgcolor: active ? THEME_COLORS.PRIMARY : THEME_COLORS.BACKGROUND_SECONDARY,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: active ? 'white' : THEME_COLORS.TEXT_MUTED,
                        border: active ? 'none' : `2px solid ${THEME_COLORS.BORDER_LIGHT}`,
                        fontSize: { xs: '0.875rem', md: '1rem' }, // 平板增加字體大小
                      }}
                    >
                      {index + 1}
                    </Box>
                  );
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: activeStep === index ? 600 : 400,
                    color: activeStep === index ? THEME_COLORS.PRIMARY : THEME_COLORS.TEXT_MUTED,
                  }}
                >
                  {step.label}
                </Typography>
                {step.description && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: THEME_COLORS.TEXT_MUTED,
                      display: 'block',
                      mt: 0.5,
                    }}
                  >
                    {step.description}
                  </Typography>
                )}
              </StepLabel>
            </Step>
          ))}
        </MuiStepper>
      </Paper>

      {/* 步骤内容 */}
      <Box sx={{ mt: 3 }}>
        {steps[activeStep]?.content}
      </Box>

      {/* 操作按钮 */}
      {showActions && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: { xs: 4, md: 5 } }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<NavigateBefore />}
            sx={{
              color: THEME_COLORS.TEXT_MUTED,
              minHeight: { md: '44px' }, // 平板增加觸摸高度
              px: { md: 3 }, // 平板增加水平內邊距
              '&:hover': {
                color: THEME_COLORS.PRIMARY,
              },
            }}
          >
            上一步
          </Button>
          
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleFinish}
                disabled={!canProceed}
                sx={{
                  bgcolor: THEME_COLORS.SUCCESS,
                  minHeight: { md: '44px' }, // 平板增加觸摸高度
                  px: { md: 3 }, // 平板增加水平內邊距
                  '&:hover': {
                    bgcolor: THEME_COLORS.PRIMARY_DARK,
                  },
                }}
              >
                完成
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!canProceed}
                endIcon={<NavigateNext />}
                sx={{
                  bgcolor: THEME_COLORS.PRIMARY,
                  minHeight: { md: '44px' }, // 平板增加觸摸高度
                  px: { md: 3 }, // 平板增加水平內邊距
                  '&:hover': {
                    bgcolor: THEME_COLORS.PRIMARY_DARK,
                  },
                }}
              >
                下一步
              </Button>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Stepper; 