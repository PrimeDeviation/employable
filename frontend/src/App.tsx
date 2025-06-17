import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import Landing from './pages/Landing';
import LoginPage from './pages/LoginPage';
import Account from './pages/Account';
import ResourceBrowse from './pages/ResourceBrowse';
import ResourceDetail from './pages/ResourceDetail';
import ProfileEdit from './pages/ProfileEdit';
import TeamPage from './pages/TeamPage';
import AvailabilityManager from './pages/AvailabilityManager';
import ContactPilot from './pages/ContactPilot';
import Messages from './pages/Messages';
import Contracts from './pages/Contracts';
import ContractCreate from './pages/ContractCreate';
import ContractDetail from './pages/ContractDetail';
import AdminPanel from './pages/AdminPanel';
import Navbar from './components/Navbar';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <DarkModeProvider>
          <MainApp />
        </DarkModeProvider>
      </AuthProvider>
    </Router>
  );
};

const MainApp: React.FC = () => {
  const { session } = useAuth();

  return (
    <>
      {session && <Navbar />}
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors">
        <Routes>
          <Route path="/" element={session ? <Navigate to="/account" /> : <Landing />} />
          <Route path="/login" element={!session ? <LoginPage /> : <Navigate to="/account" />} />
          <Route path="/account" element={session ? <Account /> : <Navigate to="/login" />} />
          <Route path="/profile/edit" element={session ? <ProfileEdit /> : <Navigate to="/login" />} />
          <Route path="/teams" element={session ? <TeamPage /> : <Navigate to="/login" />} />
          <Route path="/availability" element={session ? <AvailabilityManager /> : <Navigate to="/login" />} />
          <Route path="/messages" element={session ? <Messages /> : <Navigate to="/login" />} />
          <Route path="/contact/:resourceId" element={session ? <ContactPilot /> : <Navigate to="/login" />} />
          <Route path="/contracts" element={session ? <Contracts /> : <Navigate to="/login" />} />
          <Route path="/contracts/create" element={session ? <ContractCreate /> : <Navigate to="/login" />} />
          <Route path="/contracts/:contractId" element={session ? <ContractDetail /> : <Navigate to="/login" />} />
          <Route path="/admin" element={session ? <AdminPanel /> : <Navigate to="/login" />} />
          <Route path="/resources" element={<ResourceBrowse />} />
          <Route path="/resource/:id" element={<ResourceDetail />} />
        </Routes>
      </div>
    </>
  );
};

export default App;
