import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Dictation() {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patient_id');

  useEffect(() => {
    if (!patientId) {
      setError('Missing patient ID; please complete Phase 1 and 2 first.');
      return;
    }

    // Initialize SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('SpeechRecognition API not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'cs-CZ';           // Czech locale
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result.isFinal) {
          setTranscript(t => t + result[0].transcript + '\n');
        } else {
          interim += result[0].transcript;
        }
      }
    };


    recognition.onerror = (e) => {
      setError('Speech recognition error: ' + e.error);
      setListening(false);
    };

    recognitionRef.current = recognition;
  }, [patientId]);

  const startListening = () => {
    if (recognitionRef.current && !listening) {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/examination/`,
        { patient_id: Number(patientId), notes: transcript.trim() },
        { headers: { 'Content-Type': 'application/json' } }
      );
      navigate(`/phase4?patient_id=${patientId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed');
    }
  };

  return (
    <div>
      <h2>Phase 3: Dictation (General Examination)</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <button onClick={startListening} disabled={listening}>
          Start Dictation
        </button>
        <button onClick={stopListening} disabled={!listening}>
          Stop Dictation
        </button>
      </div>
      <textarea
        value={transcript}
        readOnly
        rows={10}
        cols={50}
        placeholder="Your dictation will appear here..."
      />
      <div>
        <button onClick={handleSubmit} style={{ marginTop: '1rem' }}>
          Next: Joint Count
        </button>
      </div>
    </div>
  );
}
