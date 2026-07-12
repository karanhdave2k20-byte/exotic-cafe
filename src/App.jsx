import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from './StoreContext';
import Landing from './pages/customer/Landing';
import QRScan from './pages/customer/QRScan';
import Login from './pages/customer/Login';
import Feedback from './pages/customer/Feedback';
import Menu from './pages/customer/Menu';
import Cart from './pages/customer/Cart';
import Fun from './pages/customer/Fun';
import TrackOrder from './pages/customer/TrackOrder';
import Payment from './pages/customer/Payment';
import Suggestion from './pages/customer/Suggestion';
import ThankYou from './pages/customer/ThankYou';
import AdminDashboard from './pages/admin/Dashboard';
import News from './pages/customer/games/News';
import Game2048 from './pages/customer/games/Game2048';
import Films from './pages/customer/games/Films';
import Radio from './pages/customer/games/Radio';
import LiveScore from './pages/customer/games/LiveScore';
import ThemeToggle from './components/ThemeToggle';
import BackButton from './components/BackButton';
import PreferencePage from './pages/customer/PreferencePage';
import MediaSuggestion from './pages/customer/MediaSuggestion';
import AdminLogin from './pages/admin/AdminLogin';
import AdminSignup from './pages/admin/AdminSignup';
import Scanner from './pages/customer/Scanner';
import PeopleCount from './pages/customer/PeopleCount';

function ProtectedRoute({ children }) {
  const { user, tableInfo } = useStore();
  const location = useLocation();
  
  // If no user context, decide where to send them
  if (!user && !location.pathname.startsWith('/admin')) {
    // If we have a table, send to login, otherwise send to Landing
    if (tableInfo?.tableNo) {
       return <Navigate to="/login" replace />;
    }
    return <Navigate to="/" replace />;
  }
  return children;
}

function StaffProtectedRoute({ children }) {
  const { adminUser } = useStore();
  if (!adminUser) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

function StartupRedirect() {
  const { user, tableInfo } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If we are at the root path and already have user+table info, resume to menu!
    if (location.pathname === '/' && user && tableInfo?.tableNo) {
       navigate('/menu');
    }
  }, [user, tableInfo, navigate, location]);

  return null;
}

function App() {
  return (
    <Router>
      <StartupRedirect />
      <ThemeToggle />
      <BackButton />
      <Routes>
        {/* Customer Customer Flow */}
        <Route path="/" element={<Landing />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/table/:id" element={<QRScan />} />
        <Route path="/people" element={<PeopleCount />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes (Requires active non-refreshed session) */}
        <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
        <Route path="/media-suggest" element={<ProtectedRoute><MediaSuggestion /></ProtectedRoute>} />
        <Route path="/preference" element={<ProtectedRoute><PreferencePage /></ProtectedRoute>} />
        <Route path="/menu" element={<ProtectedRoute><Menu /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/fun" element={<ProtectedRoute><Fun /></ProtectedRoute>} />
        <Route path="/fun/game" element={<ProtectedRoute><Game2048 /></ProtectedRoute>} />
        <Route path="/fun/films" element={<ProtectedRoute><Films /></ProtectedRoute>} />
        <Route path="/fun/radio" element={<ProtectedRoute><Radio /></ProtectedRoute>} />
        <Route path="/fun/news" element={<ProtectedRoute><News /></ProtectedRoute>} />
        <Route path="/fun/live" element={<ProtectedRoute><LiveScore /></ProtectedRoute>} />
        <Route path="/track" element={<ProtectedRoute><TrackOrder /></ProtectedRoute>} />
        <Route path="/pay" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path="/suggest" element={<ProtectedRoute><Suggestion /></ProtectedRoute>} />
        <Route path="/thanks" element={<ProtectedRoute><ThankYou /></ProtectedRoute>} />

        {/* Admin Dashboard */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/signup" element={<AdminSignup />} />
        <Route path="/admin" element={<StaffProtectedRoute><AdminDashboard /></StaffProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
