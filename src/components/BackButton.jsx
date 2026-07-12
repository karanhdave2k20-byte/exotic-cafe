import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on landing page or main admin dashboard
  if (location.pathname === '/' || location.pathname === '/admin') return null;

  return (
    <button 
      onClick={() => navigate(-1)} 
      className="back-btn"
      aria-label="Go back"
    >
      <ChevronLeft size={20} />
    </button>
  );
};

export default BackButton;
