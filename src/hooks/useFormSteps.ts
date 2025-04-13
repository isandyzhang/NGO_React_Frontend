import { useState, useCallback } from 'react';

interface UseFormStepsProps {
  totalSteps: number;
  initialStep?: number;
}

export const useFormSteps = ({ totalSteps, initialStep = 1 }: UseFormStepsProps) => {
  const [currentStep, setCurrentStep] = useState(initialStep);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  }, [totalSteps]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  }, [totalSteps]);

  return {
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === totalSteps,
  };
}; 