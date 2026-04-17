import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PropertiesPage from './pages/PropertiesPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/properties" replace />} />
        <Route path="/properties" element={<PropertiesPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;