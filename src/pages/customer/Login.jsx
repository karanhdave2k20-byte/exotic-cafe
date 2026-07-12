import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, User, Mail, Lock, KeyRound } from 'lucide-react';
import { useStore } from '../../StoreContext';

export default function Login() {
  const navigate = useNavigate();
  const { setUser, showToast, tableInfo, setTableInfo, adminTables } = useStore();
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({ name: '', contact: '', password: '', otp: '' });
  const [showOtp, setShowOtp] = useState(false);
  const [guestTable, setGuestTable] = useState(tableInfo?.tableNo || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!showOtp) {
      if (!formData.contact) return showToast("Contact (Phone/Email) is required", "error");
      if (!isLogin && !formData.password) return showToast("Password is required for registration", "error");
      const cleanContact = formData.contact.trim();

      // Real API Call to send OTP
      try {
        const response = await fetch(`/api/auth/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            contact: cleanContact, 
            isLogin,
            name: formData.name, 
            password: formData.password 
          })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setShowOtp(true);
          setFormData(prev => ({ ...prev, contact: cleanContact }));
          if (data.mockOtp) {
            showToast(`OTP Auto-filled: ${data.mockOtp}`, 'success');
            setFormData(prev => ({ ...prev, otp: data.mockOtp, contact: cleanContact })); 
          } else {
             showToast(`OTP sent successfully!`, 'success');
          }
        } else {
          showToast(data.error || "Failed to send OTP.", 'error');
        }
      } catch (error) {
        console.error("Send OTP Error:", error);
        showToast("Server Connection Error.", 'error');
      }
    } else {
      const cleanContact = formData.contact.trim();
      const cleanOtp = formData.otp.toString().trim();

      // Real API call to verify OTP
      try {
        const response = await fetch(`/api/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contact: cleanContact, otp: cleanOtp })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          const finalName = data.userName || formData.name || 'Guest';
          setUser({ n: finalName, c: cleanContact, isAuthenticated: true, token: data.token });
          showToast(`Welcome!`, 'success');
          // Server handles database creation during verification
          navigate('/feedback'); 
        } else {
           showToast(data.error || "Incorrect OTP.", 'error');
        }
      } catch (error) {
        console.error("Verify OTP Error:", error);
        showToast("Verification Server Error.", 'error');
      }
    }
  };

  const handleGuestLogin = () => {
    // If no table is currently scanned/assigned, we need to pick one or default
    const finalTable = guestTable || tableInfo?.tableNo || '1';
    
    setTableInfo({ ...tableInfo, tableNo: finalTable });
    setUser({ n: 'Guest', c: 'guest', isAuthenticated: false, isGuest: true });
    showToast(`Entering as Guest - Table ${finalTable}`, 'info');
    navigate('/feedback');
  };

  return (
    <div className="mobile-wrapper" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginTop: '2rem', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--primary-color)' }}>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {showOtp 
            ? `Enter the code for ${formData.contact}` 
            : isLogin ? 'Login to continue' : 'Sign up for a better experience'}
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {!showOtp && (
          <>
            {!isLogin && (
              <div style={{ position: 'relative' }}>
                <User size={20} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  style={{ paddingLeft: '2.5rem' }} 
                  required={!isLogin} 
                />
              </div>
            )}
            <div style={{ position: 'relative' }}>
              <Mail size={20} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Mobile Number or Email" 
                value={formData.contact} 
                onChange={e => setFormData({ ...formData, contact: e.target.value })} 
                style={{ paddingLeft: '2.5rem' }} 
                autoComplete={isLogin ? "username" : "new-username"}
                required 
              />
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={20} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                placeholder={isLogin ? "Password" : "Create Password"} 
                value={formData.password} 
                onChange={e => setFormData({ ...formData, password: e.target.value })} 
                style={{ paddingLeft: '2.5rem' }} 
                autoComplete={isLogin ? "current-password" : "new-password"}
                required={!isLogin}
              />
            </div>
          </>
        )}

        {showOtp && (
          <div className="animate-fade-in" style={{ position: 'relative' }}>
            <KeyRound size={20} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              inputMode="numeric"
              placeholder="6-digit code" 
              value={formData.otp} 
              onChange={e => setFormData({ ...formData, otp: e.target.value })} 
              style={{ paddingLeft: '2.5rem', letterSpacing: '0.5rem', fontSize: '1.4rem' }} 
              maxLength="6"
              required 
            />
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1rem', padding: '1rem', fontSize: '1.1rem' }}>
          {!showOtp 
            ? (isLogin ? 'Send OTP to Login' : 'Send OTP to Register') 
            : 'Verify OTP'} <ArrowRight size={20} />
        </button>
      </form>

      {!showOtp && (
        <div style={{ marginTop: 'auto', textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </p>
          <button onClick={() => setIsLogin(!isLogin)} style={{ color: 'var(--primary-color)', fontWeight: 600, marginTop: '0.5rem' }}>
            {isLogin ? 'Register Here' : 'Login Here'}
          </button>

          <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {!tableInfo?.tableNo && (
              <>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Select a Table to Continue:</p>
                <select 
                  value={guestTable}
                  onChange={(e) => setGuestTable(e.target.value)}
                  style={{ 
                    padding: '0.8rem', 
                    borderRadius: 'var(--radius-sm)', 
                    background: 'rgba(255,255,255,0.05)', 
                    color: 'var(--text-main)', 
                    border: '1px solid var(--border-color)',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                   <option value="" disabled style={{ background: 'var(--bg-card)' }}>Pick table #</option>
                   {adminTables.filter(t => t.status === 'Free').map(t => (
                     <option key={t.id} value={t.id} style={{ background: 'var(--bg-card)' }}>Table {t.id} (Free)</option>
                   ))}
                   <option value="99" style={{ background: 'var(--bg-card)', color: '#4ade80' }}>Table 99 (Takeaway/Pre-order)</option>
                   {adminTables.filter(t => t.status === 'Free').length === 0 && <option value="" disabled style={{ background: 'var(--bg-card)' }}>No Other Tables Found</option>}
                </select>
              </>
            )}
            
            {(tableInfo?.tableNo || guestTable) ? (
              <button 
                onClick={handleGuestLogin}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-md)' }}>
                Continue to Menu (Table {tableInfo?.tableNo || guestTable})
              </button>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--danger-color)', fontSize: '0.8rem', margin: '0 0 0.5rem 0' }}>Please select a table above first!</p>
                <button 
                  disabled
                  style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'rgba(255,255,255,0.2)', cursor: 'not-allowed' }}>
                  Continue as Guest
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {showOtp && (
        <div style={{ marginTop: 'auto', textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>Didn't receive the OTP?</p>
          <button onClick={() => setShowOtp(false)} style={{ color: 'var(--primary-color)', fontWeight: 600, marginTop: '0.5rem' }}>
            Change Contact Details
          </button>
        </div>
      )}
    </div>
  );
}
