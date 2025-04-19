import React, { useState } from 'react';
import axios from 'axios';

export default function PatientDetails() {
  const [form, setForm] = useState({ first_name: '', last_name: '', dob: '', gender: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.post(`${process.env.REACT_APP_API_URL}/patients`, form);
    // navigate to phase2 with patient ID
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="first_name" value={form.first_name} onChange={handleChange} placeholder="First Name" required />
      <input name="last_name"  value={form.last_name}  onChange={handleChange} placeholder="Last Name"  required />
      <input name="dob"        type="date"             value={form.dob}        onChange={handleChange} required />
      <select name="gender"    value={form.gender}     onChange={handleChange} required>
        <option value="">Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>
      <button type="submit">Next</button>
    </form>
  );
}
