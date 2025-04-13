import React, { useState } from 'react';
import styled from 'styled-components';
import { useFormSteps } from '../../hooks/useFormSteps';
import { CaseFormData } from '../../types/formTypes';

const FormContainer = styled.div`
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-xl);
`;

const Step = styled.div<{ active: boolean; completed: boolean }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 var(--spacing-sm);
  background-color: ${props =>
    props.completed
      ? 'var(--success-color)'
      : props.active
      ? 'var(--primary-color)'
      : '#e0e0e0'};
  color: ${props => (props.completed || props.active ? 'white' : '#666')};
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-lg);
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 1rem;
  background-color: ${props =>
    props.variant === 'primary' ? 'var(--primary-color)' : 'var(--secondary-color)'};
  color: white;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CaseFormMain: React.FC = () => {
  const { currentStep, nextStep, prevStep, isFirstStep, isLastStep } = useFormSteps({
    totalSteps: 7,
  });

  const [formData, setFormData] = useState<Partial<CaseFormData>>({});

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    // TODO: 實作表單提交邏輯
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <div>基本資料表單</div>;
      case 2:
        return <div>家庭狀況表單</div>;
      case 3:
        return <div>家庭經濟概況表單</div>;
      case 4:
        return <div>家庭身心概況表單</div>;
      case 5:
        return <div>學業表現表單</div>;
      case 6:
        return <div>情緒統測表單</div>;
      case 7:
        return <div>最終評估表單</div>;
      default:
        return null;
    }
  };

  return (
    <FormContainer>
      <StepIndicator>
        {Array.from({ length: 7 }, (_, i) => (
          <Step
            key={i + 1}
            active={currentStep === i + 1}
            completed={currentStep > i + 1}
          >
            {i + 1}
          </Step>
        ))}
      </StepIndicator>

      {renderStep()}

      <ButtonContainer>
        <Button
          variant="secondary"
          onClick={prevStep}
          disabled={isFirstStep}
        >
          上一步
        </Button>
        <Button
          variant="primary"
          onClick={isLastStep ? handleSubmit : nextStep}
        >
          {isLastStep ? '提交' : '下一步'}
        </Button>
      </ButtonContainer>
    </FormContainer>
  );
};

export default CaseFormMain; 