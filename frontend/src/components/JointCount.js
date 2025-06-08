import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { Card, FormContainer, StyledButton, colors } from '../styles/GlobalStyles';
import VoiceCommands from './VoiceCommands';
import useAutoSave from '../hooks/useAutoSave';
import JointDiagram from './JointDiagram';

// List of joints for DAS28: 28 joints
const JOINTS = [
  'Left Shoulder', 'Right Shoulder',
  'Left Elbow', 'Right Elbow',
  'Left Wrist', 'Right Wrist',
  'Left MCP 1', 'Right MCP 1',
  'Left MCP 2', 'Right MCP 2',
  'Left MCP 3', 'Right MCP 3',
  'Left MCP 4', 'Right MCP 4',
  'Left MCP 5', 'Right MCP 5',
  'Left PIP 2', 'Right PIP 2',
  'Left PIP 3', 'Right PIP 3',
  'Left PIP 4', 'Right PIP 4',
  'Left PIP 5', 'Right PIP 5',
  'Left Knee', 'Right Knee'
];

const JointCountContainer = styled(FormContainer)`
  gap: 2rem;
`;

const JointTable = styled.div`
  display: grid;
  gap: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
  color: white;
  font-weight: 600;
  
  @media (max-width: 768px) {
    grid-template-columns: 1.5fr 1fr 1fr;
    font-size: 0.875rem;
  }
`;

const JointRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid ${colors.border};
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1.5fr 1fr 1fr;
  }
`;

const JointName = styled.div`
  font-weight: 500;
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const CheckboxWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledCheckbox = styled.input`
  width: 20px;
  height: 20px;
  border: 2px solid ${colors.border};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:checked {
    background-color: ${colors.primary};
    border-color: ${colors.primary};
  }
  
  &:hover {
    border-color: ${colors.primary};
  }
`;

const SummaryCard = styled(Card)`
  background: linear-gradient(135deg, #e8f5e8, #f0f8f0);
  border: 2px solid ${colors.success};
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const SummaryItem = styled.div`
  text-align: center;
  
  .number {
    font-size: 2rem;
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

const QuickActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const SmallButton = styled(StyledButton)`
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  
  &.secondary {
    background-color: ${colors.secondary};
    
    &:hover {
      background-color: #5a6268;
    }
  }
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  justify-content: center;
`;

const ViewButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: 2px solid ${colors.primary};
  background: ${props => props.active ? colors.primary : 'white'};
  color: ${props => props.active ? 'white' : colors.primary};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? colors.primary : '#f8f9fa'};
  }
  
  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
`;

export default function JointCount() {
  const [counts, setCounts] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('diagram'); // 'table' or 'diagram'
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = Number(searchParams.get('patient_id'));

  // Auto-save functionality
  const { saveStatus } = useAutoSave({
    data: { jointCounts: counts },
    key: `jointCount_${patientId}`,
    delay: 1000
  });

  useEffect(() => {
    if (!patientId) {
      setError('Missing patient ID; please complete previous phases first.');
      return;
    }

    // Load saved data
    const savedData = localStorage.getItem(`jointCount_${patientId}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.jointCounts) {
          setCounts(parsed.jointCounts);
          setSuccess('Previous joint assessments loaded from auto-save');
          setTimeout(() => setSuccess(''), 3000);
          return;
        }
      } catch (e) {
        console.warn('Failed to load saved joint counts:', e);
      }
    }

    // Initialize counts with default false values
    const initial = {};
    JOINTS.forEach(name => {
      initial[name] = { is_swollen: false, is_tender: false };
    });
    setCounts(initial);
  }, [patientId]);

  const toggle = (joint, field) => {
    setCounts(prev => ({
      ...prev,
      [joint]: { ...prev[joint], [field]: !prev[joint][field] }
    }));
  };

  const handleJointClick = (jointName, newState) => {
    setCounts(prev => ({
      ...prev,
      [jointName]: newState
    }));
  };

  const clearAll = () => {
    const initial = {};
    JOINTS.forEach(name => {
      initial[name] = { is_swollen: false, is_tender: false };
    });
    setCounts(initial);
    localStorage.removeItem(`jointCount_${patientId}`);
  };

  const markAllSwollen = () => {
    setCounts(prev => {
      const updated = { ...prev };
      JOINTS.forEach(joint => {
        updated[joint] = { ...updated[joint], is_swollen: true };
      });
      return updated;
    });
  };

  const markAllTender = () => {
    setCounts(prev => {
      const updated = { ...prev };
      JOINTS.forEach(joint => {
        updated[joint] = { ...updated[joint], is_tender: true };
      });
      return updated;
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Transform counts object to array
      const payload = {
        patient_id: patientId,
        counts: JOINTS.map(joint => ({
          joint_name: joint,
          is_swollen: counts[joint]?.is_swollen || false,
          is_tender: counts[joint]?.is_tender || false
        }))
      };

      await axios.post(
        `${process.env.REACT_APP_API_URL}/joint-count/`,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );
      navigate(`/phase5?patient_id=${patientId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save joint counts. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoiceCommand = (command) => {
    switch (command) {
      case 'clear':
        clearAll();
        break;
      case 'save':
        handleSubmit();
        break;
      case 'next':
        handleSubmit();
        break;
      case 'previous':
        navigate(`/phase3?patient_id=${patientId}`);
        break;
      default:
        break;
    }
  };

  // Calculate summary statistics
  const swollenCount = Object.values(counts).filter(joint => joint?.is_swollen).length;
  const tenderCount = Object.values(counts).filter(joint => joint?.is_tender).length;
  const totalAffected = Object.values(counts).filter(joint => 
    joint?.is_swollen || joint?.is_tender
  ).length;

  return (
    <JointCountContainer>
      <Card>
        <h2>Phase 4: Joint Assessment (DAS28)</h2>
        <p>Assess each of the 28 joints for swelling and tenderness. This will be used to calculate the DAS28 score.</p>
        
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

        <ViewToggle>
          <ViewButton 
            active={viewMode === 'diagram'} 
            onClick={() => setViewMode('diagram')}
          >
            🫁 Visual Diagram
          </ViewButton>
          <ViewButton 
            active={viewMode === 'table'} 
            onClick={() => setViewMode('table')}
          >
            📋 Table View
          </ViewButton>
        </ViewToggle>

        <QuickActions>
          <SmallButton onClick={markAllSwollen} className="secondary">
            Mark All Swollen
          </SmallButton>
          <SmallButton onClick={markAllTender} className="secondary">
            Mark All Tender
          </SmallButton>
          <SmallButton onClick={clearAll} className="secondary">
            Clear All
          </SmallButton>
          <span style={{ fontSize: '0.875rem', color: colors.textSecondary, marginLeft: 'auto' }}>
            Auto-save: {saveStatus}
          </span>
        </QuickActions>

        {viewMode === 'diagram' ? (
          <JointDiagram 
            counts={counts} 
            onJointClick={handleJointClick}
          />
        ) : (
          <JointTable>
          <TableHeader>
            <div>Joint</div>
            <div>Swollen</div>
            <div>Tender</div>
          </TableHeader>
          
          {JOINTS.map(joint => (
            <JointRow key={joint}>
              <JointName>{joint}</JointName>
              <CheckboxWrapper>
                <StyledCheckbox
                  type="checkbox"
                  checked={counts[joint]?.is_swollen || false}
                  onChange={() => toggle(joint, 'is_swollen')}
                />
              </CheckboxWrapper>
              <CheckboxWrapper>
                <StyledCheckbox
                  type="checkbox"
                  checked={counts[joint]?.is_tender || false}
                  onChange={() => toggle(joint, 'is_tender')}
                />
              </CheckboxWrapper>
            </JointRow>
          ))}
        </JointTable>
        )}

        <SummaryCard>
          <h3>Assessment Summary</h3>
          <SummaryGrid>
            <SummaryItem>
              <span className="number">{swollenCount}</span>
              <span className="label">Swollen Joints</span>
            </SummaryItem>
            <SummaryItem>
              <span className="number">{tenderCount}</span>
              <span className="label">Tender Joints</span>
            </SummaryItem>
            <SummaryItem>
              <span className="number">{totalAffected}</span>
              <span className="label">Total Affected</span>
            </SummaryItem>
            <SummaryItem>
              <span className="number">{28 - totalAffected}</span>
              <span className="label">Normal Joints</span>
            </SummaryItem>
          </SummaryGrid>
        </SummaryCard>

        <ControlsRow>
          <StyledButton 
            onClick={() => navigate(`/phase3?patient_id=${patientId}`)}
            className="secondary"
          >
            ← Back to Dictation
          </StyledButton>
          
          <StyledButton 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Calculating...' : 'Calculate DAS28 →'}
          </StyledButton>
        </ControlsRow>

        <VoiceCommands 
          onCommand={handleVoiceCommand}
        />
      </Card>
    </JointCountContainer>
  );
}