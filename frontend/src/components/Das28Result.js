import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Card, FormContainer, StyledButton, StyledInput, colors } from '../styles/GlobalStyles';
import VoiceCommands from './VoiceCommands';
import useAutoSave from '../hooks/useAutoSave';

const Das28Container = styled(FormContainer)`
  gap: 2rem;
`;

const FormGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: ${colors.textPrimary};
  font-size: 0.875rem;
`;

const HelperText = styled.div`
  font-size: 0.75rem;
  color: ${colors.textSecondary};
  margin-top: 0.25rem;
`;

const ResultCard = styled(Card)`
  background: linear-gradient(135deg, #e8f5e8, #f0f8f0);
  border: 2px solid ${colors.success};
  text-align: center;
`;

const ScoreDisplay = styled.div`
  font-size: 3rem;
  font-weight: 700;
  color: ${colors.primary};
  margin: 1rem 0;
`;

const InterpretationCard = styled(Card)`
  background: ${props => {
    if (props.severity === 'high') return 'linear-gradient(135deg, #ffebee, #fff5f5)';
    if (props.severity === 'moderate') return 'linear-gradient(135deg, #fff3e0, #fffbf5)';
    if (props.severity === 'low') return 'linear-gradient(135deg, #e8f5e8, #f0f8f0)';
    return 'linear-gradient(135deg, #e3f2fd, #f5f9ff)';
  }};
  border: 2px solid ${props => {
    if (props.severity === 'high') return '#f44336';
    if (props.severity === 'moderate') return '#ff9800';
    if (props.severity === 'low') return '#4caf50';
    return '#2196f3';
  }};
`;

const SeverityIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const SeverityTitle = styled.h3`
  color: ${props => {
    if (props.severity === 'high') return '#c62828';
    if (props.severity === 'moderate') return '#ef6c00';
    if (props.severity === 'low') return '#2e7d32';
    return '#1565c0';
  }};
  margin-bottom: 0.5rem;
`;

const ErrorMessage = styled.div`
  background-color: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #ffcdd2;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SuccessMessage = styled.div`
  background-color: #e8f5e8;
  color: ${colors.success};
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #c8e6c9;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ControlsRow = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
`;

const SummaryItem = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  
  .value {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${colors.primary};
    display: block;
  }
  
  .label {
    font-size: 0.875rem;
    color: ${colors.textSecondary};
    font-weight: 500;
  }
`;

const DownloadButton = styled(StyledButton)`
  background: linear-gradient(135deg, #1976d2, #1565c0);
  
  &:hover {
    background: linear-gradient(135deg, #1565c0, #0d47a1);
  }
`;

export default function Das28Result() {
  const [values, setValues] = useState({
    tender_count: 0,
    swollen_count: 0,
    esr_value: '',
    global_assessment: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [score, setScore] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const patientId = Number(searchParams.get('patient_id'));

  // Auto-save functionality
  const { saveStatus } = useAutoSave({
    data: { das28Values: values },
    key: `das28_${patientId}`,
    delay: 1000
  });

  useEffect(() => {
    if (!patientId) {
      setError('Missing patient ID; please complete previous phases first.');
      return;
    }

    // Load saved data
    const savedData = localStorage.getItem(`das28_${patientId}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.das28Values) {
          setValues(parsed.das28Values);
          setSuccess('Previous values loaded from auto-save');
          setTimeout(() => setSuccess(''), 3000);
        }
      } catch (e) {
        console.warn('Failed to load saved DAS28 values:', e);
      }
    }

    // Try to pre-populate joint counts from previous phase
    const jointData = localStorage.getItem(`jointCount_${patientId}`);
    if (jointData) {
      try {
        const parsed = JSON.parse(jointData);
        if (parsed.jointCounts) {
          const counts = Object.values(parsed.jointCounts);
          const tenderCount = counts.filter(joint => joint?.is_tender).length;
          const swollenCount = counts.filter(joint => joint?.is_swollen).length;
          
          setValues(prev => ({
            ...prev,
            tender_count: tenderCount,
            swollen_count: swollenCount
          }));
        }
      } catch (e) {
        console.warn('Failed to load joint count data:', e);
      }
    }
  }, [patientId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsCalculating(true);
    
    try {
      const payload = {
        patient_id: patientId,
        tender_count: Number(values.tender_count),
        swollen_count: Number(values.swollen_count),
        esr_value: Number(values.esr_value),
        global_assessment: Number(values.global_assessment)
      };
      
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/das28/`,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      setScore(res.data.das28_score);
      setSuccess('DAS28 score calculated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to calculate DAS28 score. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const downloadReport = () => {
    window.open(
      `${process.env.REACT_APP_API_URL}/report/${patientId}`,
      '_blank'
    );
  };

  const startOver = () => {
    navigate('/');
  };

  const handleVoiceCommand = (command) => {
    switch (command) {
      case 'calculate':
        if (!score) {
          document.getElementById('das28-form')?.requestSubmit();
        }
        break;
      case 'download':
        if (score) {
          downloadReport();
        }
        break;
      case 'previous':
        navigate(`/phase4?patient_id=${patientId}`);
        break;
      case 'restart':
        startOver();
        break;
      default:
        break;
    }
  };

  const getSeverityData = (scoreValue) => {
    if (scoreValue > 5.1) {
      return {
        severity: 'high',
        icon: '🔴',
        title: 'High Disease Activity',
        description: 'Active rheumatoid arthritis requiring immediate treatment adjustment.',
        range: '> 5.1'
      };
    } else if (scoreValue >= 3.2) {
      return {
        severity: 'moderate',
        icon: '🟡',
        title: 'Moderate Disease Activity',
        description: 'Moderate rheumatoid arthritis activity that may require treatment modification.',
        range: '3.2 - 5.1'
      };
    } else if (scoreValue >= 2.6) {
      return {
        severity: 'low',
        icon: '🟢',
        title: 'Low Disease Activity',
        description: 'Well-controlled rheumatoid arthritis with minimal symptoms.',
        range: '2.6 - 3.2'
      };
    } else {
      return {
        severity: 'remission',
        icon: '🔵',
        title: 'Clinical Remission',
        description: 'Excellent disease control with minimal to no active inflammation.',
        range: '< 2.6'
      };
    }
  };

  const severityData = score ? getSeverityData(parseFloat(score)) : null;

  return (
    <Das28Container>
      <Card>
        <h2>Phase 5: DAS28 Calculation & Results</h2>
        <p>Calculate the Disease Activity Score using the 28-joint count assessment and additional clinical parameters.</p>
        
        {error && (
          <ErrorMessage>
            <span>⚠️</span>
            {error}
          </ErrorMessage>
        )}
        
        {success && (
          <SuccessMessage>
            <span>✓</span>
            {success}
          </SuccessMessage>
        )}

        {!score ? (
          <form id="das28-form" onSubmit={handleSubmit}>
            <FormGrid>
              <FormGroup>
                <Label>Tender Joint Count (0-28)</Label>
                <StyledInput
                  type="number"
                  name="tender_count"
                  value={values.tender_count}
                  onChange={handleChange}
                  min="0"
                  max="28"
                  required
                />
                <HelperText>Number of joints that are painful to touch</HelperText>
              </FormGroup>

              <FormGroup>
                <Label>Swollen Joint Count (0-28)</Label>
                <StyledInput
                  type="number"
                  name="swollen_count"
                  value={values.swollen_count}
                  onChange={handleChange}
                  min="0"
                  max="28"
                  required
                />
                <HelperText>Number of joints with visible swelling</HelperText>
              </FormGroup>

              <FormGroup>
                <Label>ESR/CRP Value (mm/hr or mg/L)</Label>
                <StyledInput
                  type="number"
                  name="esr_value"
                  value={values.esr_value}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  required
                />
                <HelperText>Erythrocyte sedimentation rate or C-reactive protein level</HelperText>
              </FormGroup>

              <FormGroup>
                <Label>Patient Global Assessment (0-100)</Label>
                <StyledInput
                  type="number"
                  name="global_assessment"
                  value={values.global_assessment}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  required
                />
                <HelperText>Patient's assessment of disease activity on visual analog scale</HelperText>
              </FormGroup>
            </FormGrid>

            <div style={{ fontSize: '0.875rem', color: colors.textSecondary, marginTop: '1rem' }}>
              Auto-save: {saveStatus}
            </div>

            <ControlsRow>
              <StyledButton 
                onClick={() => navigate(`/phase4?patient_id=${patientId}`)}
                className="secondary"
                type="button"
              >
                ← Back to Joint Count
              </StyledButton>
              
              <StyledButton 
                type="submit"
                disabled={isCalculating}
              >
                {isCalculating ? 'Calculating...' : '🧮 Calculate DAS28'}
              </StyledButton>
            </ControlsRow>
          </form>
        ) : (
          <>
            <ResultCard>
              <h3>DAS28 Score Calculated</h3>
              <ScoreDisplay>{parseFloat(score).toFixed(2)}</ScoreDisplay>
              
              <SummaryGrid>
                <SummaryItem>
                  <span className="value">{values.tender_count}</span>
                  <span className="label">Tender Joints</span>
                </SummaryItem>
                <SummaryItem>
                  <span className="value">{values.swollen_count}</span>
                  <span className="label">Swollen Joints</span>
                </SummaryItem>
                <SummaryItem>
                  <span className="value">{values.esr_value}</span>
                  <span className="label">ESR/CRP</span>
                </SummaryItem>
                <SummaryItem>
                  <span className="value">{values.global_assessment}</span>
                  <span className="label">Global Assessment</span>
                </SummaryItem>
              </SummaryGrid>
            </ResultCard>

            {severityData && (
              <InterpretationCard severity={severityData.severity}>
                <SeverityIcon>{severityData.icon}</SeverityIcon>
                <SeverityTitle severity={severityData.severity}>
                  {severityData.title}
                </SeverityTitle>
                <p><strong>Score Range:</strong> {severityData.range}</p>
                <p>{severityData.description}</p>
              </InterpretationCard>
            )}

            <ControlsRow>
              <DownloadButton onClick={downloadReport}>
                📄 Download Full Report
              </DownloadButton>
              
              <StyledButton onClick={startOver} className="secondary">
                🔄 Start New Assessment
              </StyledButton>
            </ControlsRow>
          </>
        )}

        <VoiceCommands 
          onCommand={handleVoiceCommand}
        />
      </Card>
    </Das28Container>
  );
}
