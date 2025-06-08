import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GlobalStyle, AppContainer, MainContent } from './styles/GlobalStyles';
import ProgressIndicator from './components/ProgressIndicator';
import PatientDetails from './components/PatientDetails';
import AllergiesAddictions from './components/AllergiesAddictions';
import Dictation from './components/Dictation';
import JointCount from './components/JointCount';
import Das28Result from './components/Das28Result';

function App() {
  const location = useLocation();
  
  // Determine current phase from URL
  const getCurrentPhase = () => {
    const path = location.pathname;
    switch (path) {
      case '/phase1': return 1;
      case '/phase2': return 2;
      case '/phase3': return 3;
      case '/phase4': return 4;
      case '/phase5': return 5;
      default: return 1;
    }
  };

  return (
    <AppContainer>
      <GlobalStyle />
      <MainContent>
        <ProgressIndicator currentPhase={getCurrentPhase()} />
        <Routes>
          <Route path="/" element={<Navigate to="/phase1" />} />
          <Route path="/phase1" element={<PatientDetails />} />
          <Route path="/phase2" element={<AllergiesAddictions />} />
          <Route path="/phase3" element={<Dictation />} />
          <Route path="/phase4" element={<JointCount />} />
          <Route path="/phase5" element={<Das28Result />} />
        </Routes>
      </MainContent>
    </AppContainer>
  );
}

export default App;
