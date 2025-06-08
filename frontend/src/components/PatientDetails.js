// frontend/src/components/PatientDetails.js

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function PatientDetails() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    dob: null,
    gender: ''
  });
  const [errors, setErrors] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  // 1) Auto‑complete: fetch matching patients when name changes
  useEffect(() => {
    const q = `${form.first_name} ${form.last_name}`.trim();
    if (q.length >= 2) {
      axios.get(`${process.env.REACT_APP_API_URL}/patients?search=${encodeURIComponent(q)}`)
        .then(res => setSuggestions(res.data))
        .catch(() => setSuggestions([]));
    }
  }, [form.first_name, form.last_name]);

  // 2) Setup Web Speech API for “next” / “další” command
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.onresult = ({ results }) => {
        const transcript = results[results.length - 1][0].transcript.trim().toLowerCase();
        if (transcript.includes('next') || transcript.includes('další')) {
          handleSubmit();
        }
      };
      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setListening(true);
    }
  };
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // Simple inline validation
  const validate = () => {
    const errs = {};
    if (!form.first_name) errs.first_name = 'First name is required';
    if (!form.last_name)  errs.last_name  = 'Last name is required';
    if (!form.dob)        errs.dob        = 'Date of birth is required';
    if (!form.gender)     errs.gender     = 'Gender is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit handler (called also by voice command)
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;
    try {
      const payload = {
        first_name: form.first_name,
        last_name:  form.last_name,
        dob:        form.dob.toISOString().slice(0,10),
        gender:     form.gender
      };
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/patients/`,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );
      navigate(`/phase2?patient_id=${res.data.id}`);
    } catch (err) {
      setErrors({ form: err.response?.data?.error || 'Submission failed' });
    }
  };

  return (
    <div>
      <h2>Phase 1: Patient Details</h2>
      {errors.form && <p style={{ color: 'red' }}>{errors.form}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>First Name</label><br/>
          <input
            name="first_name"
            list="patient-options"
            value={form.first_name}
            onChange={handleChange}
            placeholder="First Name"
          />
          {errors.first_name && <div style={{ color: 'red' }}>{errors.first_name}</div>}
        </div>

        <div>
          <label>Last Name</label><br/>
          <input
            name="last_name"
            list="patient-options"
            value={form.last_name}
            onChange={handleChange}
            placeholder="Last Name"
          />
          {errors.last_name && <div style={{ color: 'red' }}>{errors.last_name}</div>}
        </div>

        <datalist id="patient-options">
          {suggestions.map(p => (
            <option key={p.id} value={`${p.first_name} ${p.last_name}`} />
          ))}
        </datalist>

        <div>
          <label>Date of Birth</label><br/>
          <DatePicker
            selected={form.dob}
            onChange={date => setForm(f => ({ ...f, dob: date }))}
            dateFormat="yyyy-MM-dd"
            maxDate={new Date()}
            placeholderText="YYYY-MM-DD"
          />
          {errors.dob && <div style={{ color: 'red' }}>{errors.dob}</div>}
        </div>

        <div>
          <label>Gender</label><br/>
          <select name="gender" value={form.gender} onChange={handleChange}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          {errors.gender && <div style={{ color: 'red' }}>{errors.gender}</div>}
        </div>

        <div style={{ marginTop: '1rem' }}>
          <button type="button" onClick={listening ? stopListening : startListening}>
            {listening ? 'Stop Voice Cmd' : 'Start Voice Cmd'}
          </button>
          <button type="submit" style={{ marginLeft: '1rem' }}>
            Next: Allergies & Addictions
          </button>
        </div>
      </form>
    </div>
  );
}
