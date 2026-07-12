import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ArrowRight, Download, Smartphone, QrCode, Settings, Globe } from 'lucide-react';
import { useStore } from '../../StoreContext';

export default function Landing() {
  const navigate = useNavigate();
  const { adminTables, theme, showToast, setTableInfo, tunnelUrl, setTunnelUrl } = useStore();
  const [qrUrl, setQrUrl] = useState('');
  const [appQrUrl, setAppQrUrl] = useState('');
  const [tableNo, setTableNo] = useState(1);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  
  const [showTunnelConfig, setShowTunnelConfig] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      showToast("App is ready to install!", "info");
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, [showToast]);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        showToast("Welcome to the standalone app!", "success");
      }
    } else {
       showToast("To install, use your browser's 'Add to Home Screen' option.", "info");
    }
  };

  const handleDownloadQr = () => {
    try {
      const proxyUrl = `/api/proxy-qr?url=${encodeURIComponent(qrUrl)}`;
      window.location.href = proxyUrl;
      showToast("Downloading Table QR Code...", "info");
    } catch(err) {
      showToast("Download failed. Please take a screenshot.", "error");
    }
  };

  useEffect(() => {
    const generateQrs = async () => {
      let host = window.location.host;
      let protocol = window.location.protocol;

      // If a Tunnel URL is manually provided, prioritize it for the QR Codes
      if (tunnelUrl && tunnelUrl.startsWith('http')) {
         setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(`${tunnelUrl}/table/${tableNo}`)}`);
         setAppQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(`${tunnelUrl}/`)}`);
         return;
      }

      if (host.includes('localhost') || host.includes('127.0.0.1')) {
         try {
           const res = await fetch(`/api/get-ip`);
           const data = await res.json();
           if (data.ip) host = `${data.ip}:5173`; 
         } catch(err) { 
           console.warn("Using local fallback for QR host.");
         }
      }
      
      const tableUrl = `${protocol}//${host}/table/${tableNo}`;
      setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(tableUrl)}`);
      
      const appUrl = `${protocol}//${host}/`;
      setAppQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(appUrl)}`);
    };
    generateQrs();
  }, [tableNo, tunnelUrl]);

  const saveTunnel = (url) => {
    const cleanUrl = url.trim().replace(/\/$/, ""); // Remove trailing slash
    setTunnelUrl(cleanUrl);
    localStorage.setItem('aura-tunnel', cleanUrl);
    setShowTunnelConfig(false);
    showToast("Live Tunnel Updated!", "success");
  };

  return (
    <div className="mobile-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '1.5rem', gap: '1.5rem', overflowY: 'auto' }}>
      
      <header style={{ textAlign: 'center', marginTop: '1rem', position: 'relative' }}>
        <h1 style={{ color: 'var(--primary-color)', fontSize: '2.8rem', marginBottom: '0.2rem', fontFamily: 'var(--font-serif)', letterSpacing: '-1px' }}>Exotic <span style={{ color: 'var(--text-main)' }}>Café</span></h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <div style={{ height: '1px', width: '20px', background: 'var(--primary-hover)' }}></div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Experience Divine Taste</p>
          <div style={{ height: '1px', width: '20px', background: 'var(--primary-hover)' }}></div>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'green', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid green', padding: '0.1rem 0.5rem', borderRadius: '4px', background: 'rgba(0,128,0,0.05)' }}>
           <div style={{ width: '8px', height: '8px', background: 'green', borderRadius: '50%' }}></div>
           PURE VEG CAFÉ
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Table Selection/QR Panel */}
        <section className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid rgba(212, 163, 115, 0.2)', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ 
            padding: '12px', 
            border: '6px solid var(--primary-color)', 
            borderRadius: 'var(--radius-md)', 
            background: 'white', 
            marginBottom: '1.5rem', 
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            minHeight: '220px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {qrUrl ? (
              <img 
                src={qrUrl} 
                alt="Table QR" 
                style={{ width: '220px', height: '220px', display: 'block' }} 
              />
            ) : (
              <div style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>GENERATING QR...</div>
            )}
          </div>

          <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
            <span style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Enter Table:</span>
            <input 
              type="number" 
              placeholder="No."
              value={tableNo}
              onChange={(e) => setTableNo(Number(e.target.value))}
              style={{ 
                width: '70px',
                padding: '0.8rem', 
                borderRadius: 'var(--radius-sm)', 
                background: 'var(--bg-card)', 
                color: 'var(--text-main)', 
                border: '1px solid var(--border-color)',
                fontSize: '1rem',
                textAlign: 'center'
              }}
            />
            <select 
              value={tableNo}
              onChange={(e) => setTableNo(Number(e.target.value))}
              style={{ 
                flex: 1,
                padding: '0.8rem', 
                borderRadius: 'var(--radius-sm)', 
                background: 'var(--bg-card)', 
                color: 'var(--text-main)', 
                border: '1px solid var(--border-color)',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>Select Table {n}</option>)}
            </select>
          </div>
          
          <button 
            className="btn btn-primary btn-block" 
            style={{ padding: '1.2rem', fontSize: '1.2rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', boxShadow: '0 10px 30px rgba(212, 163, 115, 0.4)' }}
            onClick={() => navigate(`/table/${tableNo}`)}
          >
            <ArrowRight size={24} /> START ORDERING (TABLE {tableNo})
          </button>

          <button 
            className="btn btn-outline btn-block" 
            style={{ padding: '1rem', fontSize: '1rem', marginBottom: '1.5rem', opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            onClick={() => navigate('/scanner')}
          >
            <QrCode size={20} /> OR SCAN QR CODE
          </button>

          <button 
            onClick={() => { 
                const emptyTable = adminTables?.find(t => t.status === 'Free');
                if (emptyTable) {
                    setTableInfo({ tableNo: emptyTable.id }); 
                    navigate(`/table/${emptyTable.id}`); 
                } else {
                    showToast("No empty tables available for pre-order at the moment.", "error");
                }
            }}
            style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-color)', background: 'transparent', color: 'var(--primary-color)', fontWeight: 'bold', cursor: 'pointer' }}>
            Pre-order for Takeaway
          </button>
        </section>

        {deferredPrompt && (
          <button 
            className="btn btn-block animate-fade-in" 
            onClick={handleInstallApp}
            style={{ background: 'rgba(212, 163, 115, 0.1)', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', padding: '1rem' }}
          >
            <Download size={20} /> Install Offline App
          </button>
        )}

        {/* Remote Tunnel Mode Fallback (For isolated networks) */}
        {!showTunnelConfig ? (
          <button 
            onClick={() => setShowTunnelConfig(true)}
            style={{ padding: '0.8rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'underline', width: '100%' }}>
            Trouble Scanning? Use Remote Tunnel
          </button>
        ) : (
          <div className="glass-panel" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', border: '1px dashed var(--primary-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}>
                 <Globe size={16} /> <span>Remote Tunnel Settings</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Paste your Ngrok or Localhost.run URL below for scanning with 4G/5G.</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    placeholder="https://your-tunnel.lhr.life" 
                    value={tunnelUrl} 
                    onChange={e => setTunnelUrl(e.target.value)}
                    style={{ flex: 1, padding: '0.6rem', borderRadius: '4px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'white' }}
                  />
                  <button onClick={() => saveTunnel(tunnelUrl)} className="btn btn-primary" style={{ padding: '0 1rem' }}>Set</button>
              </div>
              <button 
                onClick={() => { saveTunnel(''); setShowTunnelConfig(false); }}
                className="btn btn-block"
                style={{ background: 'rgba(212, 163, 115, 0.1)', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', padding: '0.8rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
                Restore Local Wi-Fi Mode (Recommended)
              </button>
          </div>
        )}
      </div>

      <footer style={{ textAlign: 'center', padding: '1.5rem 0', marginTop: 'auto' }}>
        <button 
          onClick={() => navigate('/admin')}
          style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--primary-color)', opacity: 0.6, textDecoration: 'underline' }}>
          Admin Dashboard (Staff Only)
        </button>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', opacity: 0.7 }}>
          © 2026 Exotic Café Experience • Progressive Web App
        </p>
      </footer>
    </div>
  );
}

