import React, { InputHTMLAttributes } from 'react';
import styled from 'styled-components';

interface CustomInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

const InputWrapper = styled.div`
  margin-bottom: var(--spacing-md);
`;

const Label = styled.label`
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--secondary-color);
  border-radius: var(--border-radius);
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
  
  &:disabled {
    background-color: #f1f3f4;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.span`
  color: var(--error-color);
  font-size: 14px;
  margin-top: var(--spacing-xs);
  display: block;
`;

const HelperText = styled.span`
  color: var(--secondary-color);
  font-size: 14px;
  margin-top: var(--spacing-xs);
  display: block;
`;

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  error,
  helperText,
  ...props
}) => {
  return (
    <InputWrapper>
      <Label>{label}</Label>
      <StyledInput {...props} />
      {error && <ErrorText>{error}</ErrorText>}
      {helperText && !error && <HelperText>{helperText}</HelperText>}
    </InputWrapper>
  );
}; 