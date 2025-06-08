import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AllergiesAddictions() {
  const [entries, setEntries] = useState([
    { type: 'Allergy', description: '' }
  ]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patient_id');

  useEffect(() => {
    if (!patientId) {
      setError('Missing patient ID; please complete Phase 1 first.');
    }
  }, [patientId]);

  const handleEntryChange = (index, field, value) => {
    const newEntries = [...entries];
    newEntries[index][field] = value;
    setEntries(newEntries);
  };

  const addEntry = () => {
    setEntries([...entries, { type: 'Allergy', description: '' }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { patient_id: Number(patientId), entries };
      await axios.post(
        `${process.env.REACT_APP_API_URL}/allergies/`,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );
      navigate(`/phase3?patient_id=${patientId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed');
    }
  };

  return (
    <div>
      <h2>Phase 2: Allergies & Addictions</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        {entries.map((item, idx) => (
          <div key={idx} style={{ marginBottom: '1rem' }}>
            <select
              value={item.type}
              onChange={(e) => handleEntryChange(idx, 'type', e.target.value)}
            >
              <option value="Allergy">Allergy</option>
              <option value="Addiction">Addiction</option>
            </select>
            <input
              type="text"
              placeholder="Description"
              value={item.description}
              onChange={(e) => handleEntryChange(idx, 'description', e.target.value)}
              required
            />
          </div>
        ))}
        <button type="button" onClick={addEntry} style={{ marginRight: '1rem' }}>
          + Add Another
        </button>
        <button type="submit">Next: General Examination</button>
      </form>
    </div>
  );
}
