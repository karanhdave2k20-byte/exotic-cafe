import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Heart, Sparkles } from 'lucide-react';
import { useStore } from '../../StoreContext';

export default function PreferencePage() {
  const navigate = useNavigate();
  const { user, showToast } = useStore();

  const handleChoice = (liked) => {
    if (liked) {
      showToast("We're glad you like the atmosphere!", "success");
    } else {
      showToast("Thanks for letting us know. We'll try to improve!", "info");
    }
    navigate('/menu');
  };

  return (
    <div className="mobile-wrapper" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--bg-color)' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '3rem 2rem', textAlign: 'center', border: '1px solid rgba(212, 163, 115, 0.2)' }}>
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
          <div style={{ position: 'relative' }}>
             <Heart size={60} color="var(--primary-color)" fill="rgba(212, 163, 115, 0.1)" />
             <Sparkles size={24} color="var(--primary-hover)" style={{ position: 'absolute', top: -10, right: -10 }} />
          </div>
        </div>
        
        <h2 style={{ color: 'var(--primary-color)', fontSize: '2.2rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>Tailored for You</h2>
        <p style={{ marginBottom: '3rem', color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.6' }}>
          Based on your vibe, {user?.n || 'Guest'}, <br/>
          <b>Would you like the personalized experience we prepared?</b>
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <button 
            className="btn btn-primary" 
            onClick={() => handleChoice(true)}
            style={{ padding: '1.2rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}
          >
            I'd love that! <ThumbsUp size={20} />
          </button>
          
          <button 
            className="btn btn-outline" 
            onClick={() => handleChoice(false)}
            style={{ padding: '1.2rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}
          >
            Not for me <ThumbsDown size={20} />
          </button>
        </div>

        <button 
          onClick={() => navigate('/menu')}
          style={{ marginTop: '2.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', textDecoration: 'underline', fontSize: '0.9rem', cursor: 'pointer' }}
        >
          Just take me to the menu
        </button>
      </div>
    </div>
  );
}
