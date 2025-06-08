import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { Mic, MicOff, Volume2, Square } from 'lucide-react';

const VoiceContainer = styled.div`
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px solid #0ea5e9;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1rem 0;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(14, 165, 233, 0.1) 0%, transparent 70%);
    animation: ${props => props.listening ? 'pulse 2s ease-in-out infinite' : 'none'};
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.1); opacity: 0.8; }
  }
`;

const VoiceHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  position: relative;
  z-index: 2;
`;

const VoiceTitle = styled.h3`
  color: #0c4a6e;
  font-weight: 600;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const VoiceControls = styled.div`
  display: flex;
  gap: 0.5rem;
  position: relative;
  z-index: 2;
`;

const VoiceButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.listening ? `
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    animation: pulse-button 1.5s ease-in-out infinite;
  ` : `
    background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
    color: white;
  `}

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  @keyframes pulse-button {
    0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
    50% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
  }
`;

const VoiceStatus = styled.div`
  position: relative;
  z-index: 2;
  margin-bottom: 1rem;
`;

const StatusText = styled.p`
  color: ${props => props.listening ? '#dc2626' : '#0c4a6e'};
  font-weight: 500;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CommandsList = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1rem;
  position: relative;
  z-index: 2;
  border: 1px solid #e0f2fe;
`;

const CommandsTitle = styled.h4`
  color: #0c4a6e;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const CommandItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f9ff;
  
  &:last-child {
    border-bottom: none;
  }
`;

const CommandText = styled.span`
  color: #374151;
  font-weight: 500;
  font-size: 0.875rem;
`;

const CommandAction = styled.span`
  color: #6b7280;
  font-size: 0.75rem;
  font-style: italic;
`;

const AudioVisualizer = styled.div`
  height: 4px;
  background: #e0f2fe;
  border-radius: 2px;
  margin: 0.5rem 0;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background: linear-gradient(90deg, #0ea5e9, #06b6d4, #0ea5e9);
    width: 100%;
    transform: translateX(-100%);
    animation: ${props => props.listening ? 'wave 1.5s ease-in-out infinite' : 'none'};
  }

  @keyframes wave {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const voiceCommands = [
  { text: '"Next" or "Další"', action: 'Go to next phase' },
  { text: '"Previous" or "Zpět"', action: 'Go to previous phase' },
  { text: '"Save" or "Uložit"', action: 'Save current data' },
  { text: '"Clear" or "Vymazat"', action: 'Clear current input' },
  { text: '"Stop" or "Stop"', action: 'Stop voice recognition' }
];

export default function VoiceCommands({ 
  onCommand, 
  enabled = true, 
  autoStart = false,
  language = 'en-US' // Default to English, can be 'cs-CZ' for Czech
}) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [error, setError] = useState(null);
  const [lastCommand, setLastCommand] = useState('');
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = language;
      
      recognition.onstart = () => {
        setListening(true);
        setError(null);
      };
      
      recognition.onend = () => {
        setListening(false);
      };
      
      recognition.onerror = (event) => {
        setError(`Speech recognition error: ${event.error}`);
        setListening(false);
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
        setLastCommand(transcript);
        processCommand(transcript);
      };
      
      recognitionRef.current = recognition;
      setSupported(true);
      
      if (autoStart) {
        startListening();
      }
    } else {
      setSupported(false);
      setError('Speech recognition is not supported in this browser');
    }

    return () => {
      if (recognitionRef.current && listening) {
        recognitionRef.current.stop();
      }
    };
  }, [language, autoStart]);

  const processCommand = useCallback((transcript) => {
    const commands = {
      // Navigation commands
      next: ['next', 'další', 'dalsi'],
      previous: ['previous', 'back', 'zpět', 'zpet'],
      save: ['save', 'uložit', 'ulozit'],
      clear: ['clear', 'vymazat', 'delete'],
      stop: ['stop', 'stop listening', 'přestat', 'prestat']
    };

    for (const [action, phrases] of Object.entries(commands)) {
      if (phrases.some(phrase => transcript.includes(phrase))) {
        if (action === 'stop') {
          stopListening();
        } else if (onCommand) {
          onCommand(action, transcript);
        }
        break;
      }
    }
  }, [onCommand]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !listening && enabled) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        setError('Could not start voice recognition');
      }
    }
  }, [listening, enabled]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
    }
  }, [listening]);

  if (!supported) {
    return (
      <VoiceContainer>
        <VoiceStatus>
          <StatusText>
            <MicOff size={20} />
            Voice commands not supported in this browser
          </StatusText>
        </VoiceStatus>
      </VoiceContainer>
    );
  }

  return (
    <VoiceContainer listening={listening}>
      <VoiceHeader>
        <VoiceTitle>
          <Volume2 size={20} />
          Voice Commands
        </VoiceTitle>
        <VoiceControls>
          <VoiceButton
            listening={listening}
            onClick={listening ? stopListening : startListening}
            disabled={!enabled}
          >
            {listening ? (
              <>
                <Square size={16} />
                Stop Listening
              </>
            ) : (
              <>
                <Mic size={16} />
                Start Listening
              </>
            )}
          </VoiceButton>
        </VoiceControls>
      </VoiceHeader>

      <VoiceStatus>
        <StatusText listening={listening}>
          {listening ? (
            <>
              <Mic size={16} />
              Listening for commands...
            </>
          ) : (
            <>
              <MicOff size={16} />
              Voice recognition stopped
            </>
          )}
        </StatusText>
        <AudioVisualizer listening={listening} />
        {lastCommand && (
          <p style={{ color: '#059669', fontSize: '0.75rem', fontStyle: 'italic' }}>
            Last command: "{lastCommand}"
          </p>
        )}
        {error && (
          <p style={{ color: '#dc2626', fontSize: '0.75rem' }}>
            {error}
          </p>
        )}
      </VoiceStatus>

      <CommandsList>
        <CommandsTitle>Available Commands</CommandsTitle>
        {voiceCommands.map((command, index) => (
          <CommandItem key={index}>
            <CommandText>{command.text}</CommandText>
            <CommandAction>{command.action}</CommandAction>
          </CommandItem>
        ))}
      </CommandsList>
    </VoiceContainer>
  );
}
