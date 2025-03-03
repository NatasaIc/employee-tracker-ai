import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import EmployeeInsights from './components/EmployeeInsights';

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex">
        <div className="flex-1">sidebar</div>
        navbar
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/insights/:employeeid" element={<EmployeeInsights />} />
          {/* <Route path="/chatbot" element={<ChatbotPage />} /> */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
