import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PatientDetails        from './components/PatientDetails';
import AllergiesAddictions  from './components/AllergiesAddictions';
import Dictation            from './components/Dictation';
import JointCount           from './components/JointCount';
import Das28Result          from './components/Das28Result';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/phase1" />} />
      <Route path="/phase1" element={<PatientDetails />} />
      <Route path="/phase2" element={<AllergiesAddictions />} />
      <Route path="/phase3" element={<Dictation />} />
      <Route path="/phase4" element={<JointCount />} />
      <Route path="/phase5" element={<Das28Result />} />
    </Routes>
  );
}

export default App;
