import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

// List of joints for DAS28: 28 joints
const JOINTS = [
  'Left Shoulder', 'Right Shoulder',
  'Left Elbow',    'Right Elbow',
  'Left Wrist',    'Right Wrist',
  'Left MCP 1',    'Right MCP 1',
  'Left MCP 2',    'Right MCP 2',
  'Left MCP 3',    'Right MCP 3',
  'Left MCP 4',    'Right MCP 4',
  'Left MCP 5',    'Right MCP 5',
  'Left PIP 2',    'Right PIP 2',
  'Left PIP 3',    'Right PIP 3',
  'Left PIP 4',    'Right PIP 4',
  'Left PIP 5',    'Right PIP 5',
  'Left Knee',     'Right Knee'
];

export default function JointCount() {
  const [counts, setCounts] = useState({});
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = Number(searchParams.get('patient_id'));

  useEffect(() => {
    if (!patientId) {
      setError('Missing patient ID; please complete previous phases first.');
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

  const handleSubmit = async () => {
    try {
      // Transform counts object to array
      const payload = {
        patient_id: patientId,
        counts: JOINTS.map(joint => ({
          joint_name: joint,
          is_swollen: counts[joint].is_swollen,
          is_tender:  counts[joint].is_tender
        }))
      };
      await axios.post(
        `${process.env.REACT_APP_API_URL}/joint-count/`,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );
      navigate(`/phase5?patient_id=${patientId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed');
    }
  };

  return (
    <div>
      <h2>Phase 4: Joint Count</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Joint</th>
            <th>Swollen</th>
            <th>Tender</th>
          </tr>
        </thead>
        <tbody>
          {JOINTS.map(joint => (
            <tr key={joint}>
              <td>{joint}</td>
              <td>
                <input
                  type="checkbox"
                  checked={counts[joint]?.is_swollen || false}
                  onChange={() => toggle(joint, 'is_swollen')}
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={counts[joint]?.is_tender || false}
                  onChange={() => toggle(joint, 'is_tender')}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleSubmit} style={{ marginTop: '1rem' }}>
        Next: DAS28 Calculation
      </button>
    </div>
  );
}
