import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

export default function Das28Result() {
  const [values, setValues] = useState({
    tender_count: 0,
    swollen_count: 0,
    esr_value: '',
    global_assessment: ''
  });
  const [error, setError] = useState(null);
  const [score, setScore] = useState(null);
  const [searchParams] = useSearchParams();
  const patientId = Number(searchParams.get('patient_id'));

  useEffect(() => {
    if (!patientId) {
      setError('Missing patient ID; please complete previous phases first.');
    }
  }, [patientId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
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
      setScore(res.data.das28_score.toFixed(2));
    } catch (err) {
      setError(err.response?.data?.error || 'Calculation failed');
    }
  };

  return (
    <div>
      <h2>Phase 5: DAS28 Calculation</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!score ? (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Tender Joint Count:</label>
            <input
              type="number"
              name="tender_count"
              value={values.tender_count}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
          <div>
            <label>Swollen Joint Count:</label>
            <input
              type="number"
              name="swollen_count"
              value={values.swollen_count}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
          <div>
            <label>ESR/CRP value:</label>
            <input
              type="number"
              name="esr_value"
              value={values.esr_value}
              onChange={handleChange}
              step="0.1"
              required
            />
          </div>
          <div>
            <label>Patient Global Assessment (0-100):</label>
            <input
              type="number"
              name="global_assessment"
              value={values.global_assessment}
              onChange={handleChange}
              min="0"
              max="100"
              required
            />
          </div>
          <button type="submit" style={{ marginTop: '1rem' }}>
            Calculate DAS28
          </button>
        </form>
      ) : (
        <div>
          <h3>DAS28 Score: {score}</h3>
          <p>Interpretation:</p>
          <ul>
            <li>{score > 5.1 ? 'High disease activity' : score >= 3.2 ? 'Moderate activity' : score >= 2.6 ? 'Low activity' : 'Remission'}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
