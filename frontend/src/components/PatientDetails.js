import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { User, Calendar, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
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

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const DatePickerWrapper = styled.div`
  .react-datepicker-wrapper {
    width: 100%;
  }
  
  .react-datepicker__input-container input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 1rem;
    background-color: #f9fafb;
    transition: all 0.2s ease;
  }
  
  .react-datepicker__input-container input:focus {
    outline: none;
    border-color: #4f46e5;
    background-color: white;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
`;

const SuggestionsList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-top: none;
  border-radius: 0 0 8px 8px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const SuggestionItem = styled.div`
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f9fafb;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const InputWrapper = styled.div`
  position: relative;
`;

export default function PatientDetails() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    dob: null,
    gender: ''
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();

  // Auto-save functionality
  const { saveNow } = useAutoSave(
    form,
    async (data) => {
      localStorage.setItem('patientDetails', JSON.stringify(data));
    },
    {
      delay: 2000,
      onSave: () => setSuccess('Form auto-saved'),
      onError: (err) => setErrors({ form: 'Auto-save failed' })
    }
  );

  // Load saved data on mount
  useEffect(() => {
    const saved = localStorage.getItem('patientDetails');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setForm(prev => ({
          ...prev,
          ...data,
          dob: data.dob ? new Date(data.dob) : null
        }));
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    }
  }, []);

  // Auto-complete: fetch matching patients when name changes
  useEffect(() => {
    const q = `${form.first_name} ${form.last_name}`.trim();
    if (q.length >= 2) {
      axios.get(`${process.env.REACT_APP_API_URL}/patients?search=${encodeURIComponent(q)}`)
        .then(res => {
          setSuggestions(res.data || []);
          setShowSuggestions(true);
        })
        .catch(() => {
          setSuggestions([]);
          setShowSuggestions(false);
        });
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [form.first_name, form.last_name]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear success message when editing
    if (success) setSuccess('');
    
    // Clear related errors
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (patient) => {
    setForm(prev => ({
      ...prev,
      first_name: patient.first_name,
      last_name: patient.last_name,
      dob: patient.dob ? new Date(patient.dob) : null,
      gender: patient.gender
    }));
    setShowSuggestions(false);
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
        setForm({ first_name: '', last_name: '', dob: null, gender: '' });
        localStorage.removeItem('patientDetails');
        setSuccess('Form cleared');
        break;
      default:
        console.log('Unhandled voice command:', command);
    }
  };

  // Simple inline validation
  const validate = () => {
    const errs = {};
    if (!form.first_name) errs.first_name = 'First name is required';
    if (!form.last_name) errs.last_name = 'Last name is required';
    if (!form.dob) errs.dob = 'Date of birth is required';
    if (!form.gender) errs.gender = 'Gender is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    setErrors({});
    setSuccess('');
    
    if (!validate()) return;
    
    try {
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        dob: form.dob.toISOString().slice(0, 10),
        gender: form.gender
      };
      
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/patients/`,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      // Clear saved data on successful submission
      localStorage.removeItem('patientDetails');
      
      navigate(`/phase2?patient_id=${res.data.id}`);
    } catch (err) {
      setErrors({ form: err.response?.data?.error || 'Submission failed' });
    }
  };

  return (
    <Card>
      <PageTitle>
        <User size={32} />
        Patient Details
      </PageTitle>
      <PageSubtitle>
        Enter the patient's basic information to begin the medical examination process
      </PageSubtitle>

      {errors.form && (
        <ErrorMessage>
          <AlertCircle size={20} />
          {errors.form}
        </ErrorMessage>
      )}

      {success && (
        <SuccessMessage>
          <CheckCircle2 size={20} />
          {success}
        </SuccessMessage>
      )}

      <form onSubmit={handleSubmit}>
        <FormRow>
          <FormGroup>
            <Label htmlFor="first_name">First Name</Label>
            <InputWrapper>
              <Input
                id="first_name"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="Enter first name"
                required
                style={{ borderColor: errors.first_name ? '#ef4444' : undefined }}
              />
              {showSuggestions && suggestions.length > 0 && (
                <SuggestionsList>
                  {suggestions.map(patient => (
                    <SuggestionItem
                      key={patient.id}
                      onClick={() => handleSuggestionClick(patient)}
                    >
                      {patient.first_name} {patient.last_name}
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                        DOB: {patient.dob} | Gender: {patient.gender}
                      </div>
                    </SuggestionItem>
                  ))}
                </SuggestionsList>
              )}
            </InputWrapper>
            {errors.first_name && <ErrorMessage>{errors.first_name}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              placeholder="Enter last name"
              required
              style={{ borderColor: errors.last_name ? '#ef4444' : undefined }}
            />
            {errors.last_name && <ErrorMessage>{errors.last_name}</ErrorMessage>}
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <Label htmlFor="dob">Date of Birth</Label>
            <DatePickerWrapper>
              <DatePicker
                id="dob"
                selected={form.dob}
                onChange={date => setForm(prev => ({ ...prev, dob: date }))}
                dateFormat="yyyy-MM-dd"
                maxDate={new Date()}
                placeholderText="Select date of birth"
                showYearDropdown
                scrollableYearDropdown
                yearDropdownItemNumber={100}
                required
              />
            </DatePickerWrapper>
            {errors.dob && <ErrorMessage>{errors.dob}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="gender">Gender</Label>
            <Select
              id="gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              required
              style={{ borderColor: errors.gender ? '#ef4444' : undefined }}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Select>
            {errors.gender && <ErrorMessage>{errors.gender}</ErrorMessage>}
          </FormGroup>
        </FormRow>

        <VoiceCommands
          onCommand={handleVoiceCommand}
          enabled={true}
          language="en-US"
        />

        <ButtonGroup>
          <Button type="button" className="secondary" onClick={() => {
            setForm({ first_name: '', last_name: '', dob: null, gender: '' });
            localStorage.removeItem('patientDetails');
            setSuccess('Form cleared');
          }}>
            Clear Form
          </Button>
          <Button type="button" onClick={saveNow}>
            Save Progress
          </Button>
          <Button type="submit">
            Next: Allergies & Addictions
            <ChevronRight size={20} />
          </Button>
        </ButtonGroup>
      </form>
    </Card>
  );
}
