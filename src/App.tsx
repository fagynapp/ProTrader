import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Trades from './pages/Trades';
import Strategies from './pages/Strategies';
import Investments from './pages/Investments';
import Finance from './pages/Finance';
import CalculatorPage from './pages/Calculator';
import Mindset from './pages/Mindset';
import TraderMap from './pages/TraderMap';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/trades" element={<Trades />} />
          <Route path="/mindset" element={<Mindset />} />
          <Route path="/strategies" element={<Strategies />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/investments" element={<Investments />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/trader-map" element={<TraderMap />} />
          
          {/* Admin Route - In a real app, this would be protected by auth guards */}
          <Route path="/admin" element={<AdminDashboard />} />
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;