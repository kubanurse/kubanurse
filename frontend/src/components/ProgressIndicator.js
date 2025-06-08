import React from 'react';
import styled from 'styled-components';
import { CheckCircle, Circle, User, Heart, Mic, HandMetal, Calculator } from 'lucide-react';

const ProgressContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 800px;
`;

const ProgressHeader = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
`;

const ProgressTitle = styled.h2`
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const ProgressSubtitle = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
`;

const StepContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  margin: 1rem 0;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const StepItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  background: white;
  padding: 0.5rem;
  border-radius: 8px;
  min-width: 120px;

  @media (max-width: 640px) {
    flex-direction: row;
    min-width: auto;
    width: 100%;
    justify-content: flex-start;
    padding: 1rem;
    background: ${props => props.active ? '#f0f9ff' : props.completed ? '#f0fdf4' : '#f9fafb'};
    border: 2px solid ${props => props.active ? '#0ea5e9' : props.completed ? '#22c55e' : '#e5e7eb'};
  }
`;

const StepIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
  
  background: ${props => 
    props.completed ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' :
    props.active ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' :
    'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)'
  };
  
  color: ${props => (props.completed || props.active) ? 'white' : '#6b7280'};

  @media (max-width: 640px) {
    margin-bottom: 0;
    margin-right: 1rem;
  }
`;

const StepLabel = styled.div`
  text-align: center;
  @media (max-width: 640px) {
    text-align: left;
    flex: 1;
  }
`;

const StepTitle = styled.h3`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => 
    props.completed ? '#16a34a' :
    props.active ? '#0284c7' :
    '#6b7280'
  };
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
`;

const StepDescription = styled.p`
  font-size: 0.625rem;
  color: #9ca3af;
  line-height: 1.3;
`;

const ProgressLine = styled.div`
  position: absolute;
  top: 24px;
  left: 10%;
  right: 10%;
  height: 2px;
  background: #e5e7eb;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: linear-gradient(90deg, #22c55e, #0ea5e9);
    width: ${props => props.progress}%;
    transition: width 0.5s ease;
  }

  @media (max-width: 640px) {
    display: none;
  }
`;

const steps = [
  {
    id: 1,
    title: 'Patient Details',
    description: 'Basic information',
    icon: User,
    path: '/phase1'
  },
  {
    id: 2,
    title: 'Allergies',
    description: 'Medical history',
    icon: Heart,
    path: '/phase2'
  },
  {
    id: 3,
    title: 'Examination',
    description: 'Voice dictation',
    icon: Mic,
    path: '/phase3'
  },
  {
    id: 4,
    title: 'Joint Count',
    description: 'Rheumatology',
    icon: HandMetal,
    path: '/phase4'
  },
  {
    id: 5,
    title: 'DAS28 Result',
    description: 'Final calculation',
    icon: Calculator,
    path: '/phase5'
  }
];

export default function ProgressIndicator({ currentPhase }) {
  const currentStep = currentPhase || 1;
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <ProgressContainer>
      <ProgressHeader>
        <ProgressTitle>Medical Examination Progress</ProgressTitle>
        <ProgressSubtitle>
          Step {currentStep} of {steps.length} - {steps[currentStep - 1]?.title}
        </ProgressSubtitle>
      </ProgressHeader>
      
      <StepContainer>
        <ProgressLine progress={progress} />
        {steps.map((step, index) => {
          const StepIconComponent = step.icon;
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          
          return (
            <StepItem 
              key={step.id} 
              completed={isCompleted}
              active={isActive}
            >
              <StepIcon completed={isCompleted} active={isActive}>
                {isCompleted ? (
                  <CheckCircle size={24} />
                ) : (
                  <StepIconComponent size={24} />
                )}
              </StepIcon>
              <StepLabel>
                <StepTitle completed={isCompleted} active={isActive}>
                  {step.title}
                </StepTitle>
                <StepDescription>
                  {step.description}
                </StepDescription>
              </StepLabel>
            </StepItem>
          );
        })}
      </StepContainer>
    </ProgressContainer>
  );
}
