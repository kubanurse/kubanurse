import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { Card, FormContainer, StyledButton, colors } from '../styles/GlobalStyles';
import VoiceCommands from './VoiceCommands';
import useAutoSave from '../hooks/useAutoSave';

const DictationContainer = styled(FormContainer)`
  gap: 2rem;
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

const StyledTextarea = styled.textarea`
  width: 100%;
  min-height: 300px;
  padding: 1rem;
  border: 2px solid ${colors.border};
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  line-height: 1.6;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.15);
  }

  &:read-only {
    background-color: #f8f9fa;
  }

  @media (max-width: 768px) {
    min-height: 250px;
    font-size: 1rem;
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  
  ${props => props.listening ? `
    background-color: #e8f5e8;
    color: ${colors.success};
    border: 1px solid #c8e6c9;
  ` : `
    background-color: #fff3e0;
    color: ${colors.warning};
    border: 1px solid #ffcc02;
  `}
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.listening ? colors.success : colors.warning};
  animation: ${props => props.listening ? 'pulse 1.5s infinite' : 'none'};
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
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

const TextControls = styled.div`
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

export default function Dictation() {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patient_id');

  // Auto-save functionality
  const { saveStatus } = useAutoSave({
    data: { notes: transcript },
    key: `dictation_${patientId}`,
    delay: 2000
  });

  useEffect(() => {
    if (!patientId) {
      setError('Missing patient ID; please complete Phase 1 and 2 first.');
      return;
    }

    // Load saved data
    const savedData = localStorage.getItem(`dictation_${patientId}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.notes) {
          setTranscript(parsed.notes);
          setSuccess('Previous notes loaded from auto-save');
          setTimeout(() => setSuccess(''), 3000);
        }
      } catch (e) {
        console.warn('Failed to load saved notes:', e);
      }
    }

    // Initialize SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'cs-CZ';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result.isFinal) {
          setTranscript(t => t + result[0].transcript + ' ');
        } else {
          interim += result[0].transcript;
        }
      }
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = (e) => {
      setError(`Speech recognition error: ${e.error}. Please try again.`);
      setListening(false);
    };

    recognitionRef.current = recognition;
  }, [patientId]);

  const startListening = () => {
    if (recognitionRef.current && !listening) {
      setError(null);
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch (e) {
        setError('Failed to start voice recognition');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    localStorage.removeItem(`dictation_${patientId}`);
  };

  const handleSubmit = async () => {
    if (!transcript.trim()) {
      setError('Please add some notes before proceeding.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/examination/`,
        { patient_id: Number(patientId), notes: transcript.trim() },
        { headers: { 'Content-Type': 'application/json' } }
      );
      navigate(`/phase4?patient_id=${patientId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save examination notes. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoiceCommand = (command) => {
    switch (command) {
      case 'start':
        startListening();
        break;
      case 'stop':
        stopListening();
        break;
      case 'clear':
        clearTranscript();
        break;
      case 'save':
        handleSubmit();
        break;
      case 'next':
        handleSubmit();
        break;
      case 'previous':
        navigate(`/phase2?patient_id=${patientId}`);
        break;
      default:
        break;
    }
  };

  return (
    <DictationContainer>
      <Card>
        <h2>Phase 3: Medical Examination Dictation</h2>
        <p>Record your general examination findings using voice dictation or manual typing.</p>
        
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

        <ControlsRow>
          <StatusIndicator listening={listening}>
            <StatusDot listening={listening} />
            {listening ? 'Recording...' : 'Ready to record'}
          </StatusIndicator>
          
          <StyledButton 
            onClick={startListening} 
            disabled={listening || !recognitionRef.current}
          >
            🎤 Start Dictation
          </StyledButton>
          
          <StyledButton 
            onClick={stopListening} 
            disabled={!listening}
            className="secondary"
          >
            ⏹️ Stop
          </StyledButton>
        </ControlsRow>

        <TextControls>
          <SmallButton onClick={clearTranscript} className="secondary">
            Clear All
          </SmallButton>
          <span style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
            Auto-save: {saveStatus}
          </span>
        </TextControls>

        <StyledTextarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Your examination notes will appear here as you dictate, or you can type manually..."
        />

        <ControlsRow>
          <StyledButton 
            onClick={() => navigate(`/phase2?patient_id=${patientId}`)}
            className="secondary"
          >
            ← Back to Allergies
          </StyledButton>
          
          <StyledButton 
            onClick={handleSubmit}
            disabled={isSubmitting || !transcript.trim()}
          >
            {isSubmitting ? 'Saving...' : 'Next: Joint Count →'}
          </StyledButton>
        </ControlsRow>

        <VoiceCommands 
          onCommand={handleVoiceCommand}
          isListening={listening}
        />
      </Card>
    </DictationContainer>
  );
}
