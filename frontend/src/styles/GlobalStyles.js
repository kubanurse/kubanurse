import styled, { createGlobalStyle } from 'styled-components';

// Color palette
export const colors = {
  primary: '#4caf50',
  secondary: '#6c757d',
  success: '#28a745',
  warning: '#ffc107',
  error: '#dc3545',
  info: '#17a2b8',
  light: '#f8f9fa',
  dark: '#343a40',
  border: '#e0e0e0',
  textPrimary: '#333333',
  textSecondary: '#666666',
  background: '#f5f5f5'
};

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    color: #333;
  }

  #root {
    min-height: 100vh;
  }
`;

export const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

export const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  min-height: calc(100vh - 80px);
`;

export const FormContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

export const Card = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 2.5rem;
  width: 100%;
  max-width: 800px;
  margin: 1rem auto;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 100%);
  }

  h2 {
    color: ${colors.textPrimary};
    margin-bottom: 1rem;
    font-size: 1.875rem;
    font-weight: 700;
  }

  h3 {
    color: ${colors.textPrimary};
    margin-bottom: 0.75rem;
    font-size: 1.5rem;
    font-weight: 600;
  }

  p {
    color: ${colors.textSecondary};
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    margin: 0.5rem;
    
    h2 {
      font-size: 1.5rem;
    }
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

export const Label = styled.label`
  font-weight: 600;
  color: ${colors.textPrimary};
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid ${colors.border};
  border-radius: 8px;
  font-size: 1rem;
  background-color: #f9fafb;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
  }
`;

export const StyledInput = styled(Input)`
  // All Input styles already defined in Input component
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid ${colors.border};
  border-radius: 8px;
  min-height: 120px;
  font-size: 1rem;
  font-family: inherit;
  background-color: #f9fafb;
  transition: all 0.2s ease;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid ${colors.border};
  border-radius: 8px;
  font-size: 1rem;
  background-color: #f9fafb;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
  }
`;

export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.success} 100%);
  color: white;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  &.secondary {
    background: linear-gradient(135deg, ${colors.secondary} 0%, #9ca3af 100%);
  }

  &.danger {
    background: linear-gradient(135deg, ${colors.error} 0%, #f87171 100%);
  }

  &.success {
    background: linear-gradient(135deg, ${colors.success} 0%, #34d399 100%);
  }
`;

export const StyledButton = styled(Button)`
  // All Button styles already defined in Button component
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: flex-end;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    justify-content: center;
  }
`;

export const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: ${colors.error};
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const SuccessMessage = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: ${colors.success};
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;
