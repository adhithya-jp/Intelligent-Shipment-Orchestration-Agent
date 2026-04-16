import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import NewRoutingRequest from './pages/NewRoutingRequest';
import OptimizationResult from './pages/OptimizationResult';
import ActiveRoutes from './pages/ActiveRoutes';
import MainLayout from './layouts/MainLayout';
import './index.css';

// Quick Placeholder Components for Sidebar Links to prevent redirecting to Login
const Placeholder = ({ title }: { title: string }) => (
  <div className="w-full h-full flex flex-col items-center justify-center min-h-[60vh]">
    <span className="material-symbols-outlined text-6xl text-outline opacity-50 mb-4">construction</span>
    <h1 className="text-3xl font-headline font-bold text-on-surface text-center mb-2">{title}</h1>
    <p className="text-on-surface-variant font-label text-sm uppercase tracking-widest opacity-60">Module Under Construction</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Route */}
        <Route path="/" element={<LoginPage />} />
        
        {/* Protected Dashboard Routes inside MainLayout */}
        <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/new-request" element={<NewRoutingRequest />} />
            
            <Route path="/routes" element={<ActiveRoutes />} />
            <Route path="/optimization" element={<OptimizationResult />} />
            <Route path="/analytics" element={<Placeholder title="Analytics" />} />
            <Route path="/settings" element={<Placeholder title="Settings" />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
