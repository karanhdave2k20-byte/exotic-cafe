import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Search, Filter, LogOut, Trash2, MapPin, 
  Bell, Star, Mic, Play, Tag, Zap, Camera, Languages
} from 'lucide-react';
import { useStore } from '../../StoreContext';
import Modal from '../../components/Modal';
import { translations } from '../../translations';

export default function Menu() {
  const navigate = useNavigate();
  const { cart, setCart, mockMenu, addToCart, user, setUser, tableInfo, setTableInfo, showToast, callWaiter, isPureVeg, togglePureVeg, currentOrderId } = useStore();
  const [activeCategory, setActiveCategory] = useState('All');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lang, setLang] = useState('en');

  const t = translations[lang];

  const toggleLanguage = () => {
    const next = lang === 'en' ? 'hi' : 'en';
    setLang(next);
    showToast(`Language set to ${next === 'en' ? 'English' : 'हिंदी'}`, 'info');
  };

  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Speech recognition not supported in this browser.', 'error');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.onstart = () => showToast('Listening...', 'info');
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setSearchQuery(transcript);
      showToast(`Searching for "${transcript}"`, 'success');
    };
    recognition.start();
  };

  const handleTrack = () => {
    navigate('/track');
  };

  const handleLogout = () => {
    // If they have an active table, we want to go to the thanks page which releases it
    if (tableInfo?.tableNo) {
      navigate('/thanks');
    } else {
      localStorage.removeItem('aura-user');
      localStorage.removeItem('aura-table');
      localStorage.removeItem('aura-cart');
      localStorage.removeItem('aura-order-id');
      localStorage.removeItem('aura-recent-total');
      setUser(null);
      setTableInfo({ tableNo: null });
      setCart([]);
      navigate('/');
    }
  };

  const handleDeleteAccount = async () => {
    if (user?.c) {
      try {
        await fetch(`/api/database/customers/${user.c}`, { method: 'DELETE' });
        showToast('Your account and data have been permanently deleted.', 'info');
        handleLogout();
      } catch (err) {
        showToast('Error deleting account.', 'error');
      }
    }
    setIsDeleteModalOpen(false);
  };

  const categories = ['All', 'Drinks', 'Snacks', 'Dessert', 'Retail'];
  const filteredMenu = mockMenu.filter(item => 
    (activeCategory === 'All' || item.category === activeCategory) &&
    (item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const cartItemsCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

   const aiSuggestions = useMemo(() => {
    return [...mockMenu].slice(0, 4);
  }, [mockMenu]);

  return (
    <div className="mobile-wrapper" style={{ padding: '0 0 5rem 0' }}>
      <div style={{ padding: '2rem', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t.table} {tableInfo?.tableNo || '1'}</p>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{t.hey}, <span style={{ color: 'var(--primary-color)' }}>{user?.n || t.guest}</span></h2>
            <div 
              onClick={togglePureVeg}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: isPureVeg ? 'var(--success-color)' : 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem', cursor: 'pointer' }}>
              <Star size={14} fill={isPureVeg ? 'var(--success-color)' : 'transparent'} /> 
              <span>{(user?.v || 1) * 50} {t.loyalty}</span>
              <span style={{ 
                marginLeft: '0.5rem', 
                background: isPureVeg ? 'var(--success-color)' : 'var(--bg-card-hover)', 
                color: isPureVeg ? 'white' : 'var(--text-muted)', 
                padding: '0.1rem 0.6rem', 
                borderRadius: '4px', 
                fontSize: '0.65rem', 
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}>
                {isPureVeg ? 'PURE VEG MODE ON' : 'VEG/NON-VEG'}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '200px' }}>
            <button onClick={toggleLanguage} title="Switch Language" className="btn-icon">
               <Languages size={18} color="var(--primary-color)" />
            </button>
            <button title="Delete Account" onClick={() => setIsDeleteModalOpen(true)} className="btn-icon">
               <Trash2 size={18} color="var(--danger-color)" />
            </button>
            <button title="Logout / Change Table" onClick={handleLogout} className="btn-icon">
              <LogOut size={18} color="var(--primary-color)" />
            </button>
            <button onClick={() => navigate('/cart')} className="btn-icon" style={{ position: 'relative', background: 'var(--primary-color)' }}>
              <ShoppingBag size={18} color="#1a1a1a" />
              {cartItemsCount > 0 && (
                <span style={{ position: 'absolute', top: -5, right: -5, background: 'var(--danger-color)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div style={{ position: 'relative', marginBottom: '2rem' }}>
          <Search size={20} style={{ position: 'absolute', top: '15px', left: '16px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder={t.search} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '3rem', paddingRight: '3rem', borderRadius: 'var(--radius-full)', background: 'var(--bg-card)', border: 'none', height: '50px', fontSize: '1rem' }} 
          />
          <Mic 
            size={20} 
            onClick={startVoiceSearch}
            style={{ position: 'absolute', top: '15px', right: '16px', color: 'var(--primary-color)', cursor: 'pointer' }} 
          />
        </div>

        {!user?.v || user?.v < 2 ? (
          <div className="glass-panel" style={{ 
            background: 'linear-gradient(135deg, var(--primary-color), #8e6f51)', 
            padding: '1.2rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', 
            display: 'flex', alignItems: 'center', gap: '1rem' 
          }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.8rem', borderRadius: '50%' }}>
              <Tag size={24} color="white" />
            </div>
            <div>
              <h4 style={{ margin: 0, color: '#1a1a1a' }}>15% OFF for You!</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(26,26,26,0.8)' }}>Use code: <b>EXOTIC_NEW</b> on your first order.</p>
            </div>
          </div>
        ) : null}

        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={activeCategory === cat ? 'btn btn-primary' : 'btn'} style={{ borderRadius: 'var(--radius-full)', padding: '0.5rem 1.5rem', background: activeCategory === cat ? '' : 'var(--bg-card)', whiteSpace: 'nowrap' }}>
              {cat}
            </button>
          ))}
        </div>

        <h3 style={{ fontSize: '1.2rem', marginTop: '2.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--primary-color)', fontWeight: '700' }}>
          <Zap size={22} fill="var(--primary-color)" /> AI Smart Suggestions
        </h3>
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none' }}>
            {aiSuggestions.map(item => (
              <div key={item.id} className="glass-panel" style={{ minWidth: '150px', padding: '0.8rem', borderRadius: 'var(--radius-md)', position: 'relative' }}>
                  <img src={item.img} style={{ width: '100%', height: '85px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem' }} />
                  {item.isVeg && (
                   <div style={{ position: 'absolute', top: '15px', left: '15px', width: '12px', height: '12px', border: '1px solid green', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', borderRadius: '2px' }}>
                     <div style={{ width: '8px', height: '8px', background: 'green', borderRadius: '50%' }}></div>
                   </div>
                  )}
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.3rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>₹{item.price}</span>
                    <button onClick={() => addToCart(item)} style={{ background: 'var(--primary-color)', color: '#1a1a1a', width: '28px', height: '28px', borderRadius: '8px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', cursor: 'pointer' }}>
                      +
                    </button>
                  </div>
              </div>
            ))}
          </div>
      </div>

      <div style={{ padding: '0 2rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginTop: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Camera size={18} color="var(--primary-color)" /> {t.liveKitchen}
        </h3>
        <div className="glass-panel" style={{ position: 'relative', height: '160px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '2rem' }}>
           <img 
             src="/hero_coffee_bg.png" 
             style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} 
           />
           <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,60,60,0.8)', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', color: 'white' }}>
              <Zap size={12} fill="white" /> LIVE
           </div>
           <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '50%', color: 'white' }}>
                 <Play size={24} fill="white" />
              </div>
           </div>
        </div>

         <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>{t.specialOptions}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          {filteredMenu.map(item => (
            <div key={item.id} className="glass-panel" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative' }}>
                <img src={item.img} alt={item.name} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }} />
                {item.isVeg && (
                  <div style={{ position: 'absolute', top: '5px', right: '5px', width: '16px', height: '16px', border: '1px solid green', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', borderRadius: '2px' }}>
                    <div style={{ width: '10px', height: '10px', background: 'green', borderRadius: '50%' }}></div>
                  </div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{item.name}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>{item.category}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>₹{item.price.toFixed(2)}</span>
                <button onClick={() => addToCart(item)} style={{ background: 'var(--primary-color)', color: '#1a1a1a', width: '32px', height: '32px', borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer' }}>
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={handleDeleteAccount}
        title="Delete Account?" 
        message="Are you sure you want to permanently delete your account and visits history? This cannot be undone."
      />

      <button 
        onClick={() => { callWaiter(); showToast(t.callWaiter, 'success'); }}
        style={{
          position: 'fixed', bottom: '6.5rem', right: '1.5rem', 
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'var(--primary-color)', color: '#1a1a1a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(212, 163, 115, 0.4)',
          border: 'none', zIndex: 100, cursor: 'pointer'
        }}
      >
        <Bell size={28} />
      </button>
    </div>
  );
}
