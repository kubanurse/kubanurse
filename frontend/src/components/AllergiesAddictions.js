import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Heart, Plus, Trash2, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import styled from 'styled-components';

import { 
  Card, 
  FormGroup, 
  Label, 
  Input, 
  Select, 
  Button, 
  ButtonGroup, 
  ErrorMessage,
  SuccessMessage 
} from '../styles/GlobalStyles';
import VoiceCommands from './VoiceCommands';
import useAutoSave from '../hooks/useAutoSave';

const PageTitle = styled.h1`
  color: #1f2937;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
`;

const PageSubtitle = styled.p`
  color: #6b7280;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.1rem;
`;

const EntryRow = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr auto;
  gap: 1rem;
  align-items: end;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

const AddButton = styled(Button)`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  margin-bottom: 1rem;
  
  &:hover {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
  }
`;

const RemoveButton = styled(Button)`
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  padding: 0.5rem;
  min-width: auto;
  
  &:hover {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  }
`;

export default function AllergiesAddictions() {
  const [entries, setEntries] = useState([
    { type: 'Allergy', description: '' }
  ]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patient_id');

  // Auto-save functionality
  const { saveNow } = useAutoSave(
    entries,
    async (data) => {
      localStorage.setItem(`allergiesAddictions_${patientId}`, JSON.stringify(data));
    },
    {
      delay: 2000,
      enabled: !!patientId,
      onSave: () => setSuccess('Form auto-saved'),
      onError: (err) => setError('Auto-save failed')
    }
  );

  // Load saved data on mount
  useEffect(() => {
    if (!patientId) {
      setError('Missing patient ID; please complete Phase 1 first.');
      return;
    }

    const saved = localStorage.getItem(`allergiesAddictions_${patientId}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setEntries(data);
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    }
  }, [patientId]);

  const handleEntryChange = (index, field, value) => {
    const newEntries = [...entries];
    newEntries[index][field] = value;
    setEntries(newEntries);
    
    // Clear success message when editing
    if (success) setSuccess('');
  };

  const addEntry = () => {
    setEntries([...entries, { type: 'Allergy', description: '' }]);
  };

  const removeEntry = (index) => {
    if (entries.length > 1) {
      const newEntries = entries.filter((_, i) => i !== index);
      setEntries(newEntries);
    }
  };

  // Voice command handler
  const handleVoiceCommand = (command, transcript) => {
    switch (command) {
      case 'next':
        handleSubmit();
        break;
      case 'save':
        saveNow();
        break;
      case 'clear':
        setEntries([{ type: 'Allergy', description: '' }]);
        localStorage.removeItem(`allergiesAddictions_${patientId}`);
        setSuccess('Form cleared');
        break;
      default:
        console.log('Unhandled voice command:', command);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    setError(null);
    setSuccess('');
    
    // Filter out empty entries
    const validEntries = entries.filter(entry => 
      entry.description && entry.description.trim()
    );
    
    if (validEntries.length === 0) {
      setError('Please add at least one allergy or addiction');
      return;
    }
    
    try {
      const payload = { patient_id: Number(patientId), entries: validEntries };
      await axios.post(
        `${process.env.REACT_APP_API_URL}/allergies/`,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      // Clear saved data on successful submission
      localStorage.removeItem(`allergiesAddictions_${patientId}`);
      
      navigate(`/phase3?patient_id=${patientId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed');
    }
  };

  return (
    <Card>
      <PageTitle>
        <Heart size={32} />
        Allergies & Addictions
      </PageTitle>
      <PageSubtitle>
        Record patient's allergies and addictions for medical safety
      </PageSubtitle>

      {error && (
        <ErrorMessage>
          <AlertCircle size={20} />
          {error}
        </ErrorMessage>
      )}

      {success && (
        <SuccessMessage>
          <CheckCircle2 size={20} />
          {success}
        </SuccessMessage>
      )}

      <form onSubmit={handleSubmit}>
        {entries.map((item, idx) => (
          <EntryRow key={idx}>
            <FormGroup>
              <Label htmlFor={`type-${idx}`}>Type</Label>
              <Select
                id={`type-${idx}`}
                value={item.type}
                onChange={(e) => handleEntryChange(idx, 'type', e.target.value)}
              >
                <option value="Allergy">Allergy</option>
                <option value="Addiction">Addiction</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor={`description-${idx}`}>Description</Label>
              <Input
                id={`description-${idx}`}
                type="text"
                placeholder="Enter description"
                value={item.description}
                onChange={(e) => handleEntryChange(idx, 'description', e.target.value)}
                required
              />
            </FormGroup>
            
            {entries.length > 1 && (
              <RemoveButton
                type="button"
                onClick={() => removeEntry(idx)}
                title="Remove entry"
              >
                <Trash2 size={16} />
              </RemoveButton>
            )}
          </EntryRow>
        ))}
        
        <AddButton type="button" onClick={addEntry}>
          <Plus size={20} />
          Add Another Entry
        </AddButton>

        <VoiceCommands
          onCommand={handleVoiceCommand}
          enabled={true}
          language="en-US"
        />

        <ButtonGroup>
          <Button type="button" className="secondary" onClick={() => {
            setEntries([{ type: 'Allergy', description: '' }]);
            localStorage.removeItem(`allergiesAddictions_${patientId}`);
            setSuccess('Form cleared');
          }}>
            Clear All
          </Button>
          <Button type="button" onClick={saveNow}>
            Save Progress
          </Button>
          <Button type="submit">
            Next: General Examination
            <ChevronRight size={20} />
          </Button>
        </ButtonGroup>
      </form>
    </Card>
  );
}
