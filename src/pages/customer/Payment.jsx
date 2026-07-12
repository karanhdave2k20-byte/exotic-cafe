import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Banknote, CreditCard, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../StoreContext';

export default function Payment() {
  const navigate = useNavigate();
  const { recentOrderTotal, tableInfo, showToast } = useStore();
  const [success, setSuccess] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);

  const total = (recentOrderTotal || 0).toFixed(2);

  if (parseFloat(total) <= 0) {
    return (
      <div className="mobile-wrapper" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '2rem', color: 'var(--primary-color)', marginBottom: '1rem' }}>Nothing to Pay</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Your current balance is ₹0.00. Please place an order first!</p>
        <button className="btn btn-primary btn-block" onClick={() => navigate('/menu')}>
           Go to Menu
        </button>
      </div>
    );
  }
  const upiId = "exotic-cafe@upi"; // Mock UPI ID for demonstration
  const upiUrl = `upi://pay?pa=${upiId}&pn=Exotic%20Cafe&am=${total}&cu=INR&tn=Table%20${tableInfo?.tableNo || 'Guest'}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUrl)}`;

  const handlePay = async (method) => {
    if (method === 'UPI/Online' && !selectedMethod) {
      setSelectedMethod('UPI/Online');
      return;
    }

    showToast(`Payment of ₹${total} received via ${method}.`, 'success');
    try {
       await fetch(`/api/database/payments`, {
         method: 'POST', headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ 
           id: Math.floor(Math.random()*90000000).toString(), 
           rel: tableInfo?.tableNo ? `Table ${tableInfo.tableNo}` : 'Takeaway',
           method, status: 'Success', amount: `₹${total}` 
         })
       });

       if (tableInfo?.tableNo) {
          await fetch(`/api/database/tables/${tableInfo.tableNo}/status`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Free' })
          });
       }
    } catch(err) { console.error(err); }
    
    setSuccess(true);
    setTimeout(() => {
      navigate('/suggest');
    }, 2000);
  };

  if (success) {
    return (
      <div className="mobile-wrapper" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-pulse-slow" style={{ background: 'var(--success-color)', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
          <CheckCircle2 size={50} color="#1a1a1a" />
        </div>
        <h2 style={{ fontSize: '2rem', color: 'var(--success-color)', marginBottom: '1rem' }}>Payment Successful!</h2>
        <p style={{ color: 'var(--text-muted)' }}>Thank you for your business.</p>
      </div>
    );
  }

  return (
    <div className="mobile-wrapper" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ margin: '0 0 0.5rem 0', textAlign: 'center' }}>Payment Option</h2>
      <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '3rem' }}>Select how you'd like to pay</p>
      
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
        <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)' }}>Total Amount to Pay</p>
        <h1 style={{ fontSize: '3rem', margin: '0', color: 'var(--primary-color)' }}>₹{total}</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {!selectedMethod ? (
          <>
            <div className="glass-panel" onClick={() => handlePay('UPI/Online')} style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ background: '#202020', padding: '1rem', borderRadius: '50%' }}>
                <Banknote size={24} color="var(--primary-color)" />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '1.2rem' }}>UPI / Online</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Paytm, PhonePe, GPay</p>
              </div>
              <ChevronRight color="var(--text-muted)" />
            </div>

            <div className="glass-panel" onClick={() => handlePay('Cash')} style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ background: '#202020', padding: '1rem', borderRadius: '50%' }}>
                <CreditCard size={24} color="var(--primary-color)" />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '1.2rem' }}>Cash</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Pay at the counter</p>
              </div>
              <ChevronRight color="var(--text-muted)" />
            </div>
          </>
        ) : (
          <div className="glass-panel animate-fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
             <h4 style={{ marginBottom: '1.5rem' }}>Scan to Pay with UPI</h4>
             <div style={{ 
               background: 'white', padding: '1rem', borderRadius: '15px', 
               display: 'inline-block', marginBottom: '1.5rem',
               boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
             }}>
                <img src={qrImageUrl} alt="UPI QR" style={{ width: '200px', height: '200px', display: 'block' }} />
             </div>
             <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Scan using Paytm, PhonePe, or GPay</p>
             <button className="btn btn-primary btn-block" onClick={() => handlePay('UPI/Online')}>
                I have paid
             </button>
             <button className="btn btn-outline btn-block" style={{ marginTop: '0.8rem' }} onClick={() => setSelectedMethod(null)}>
                Back to Options
             </button>
          </div>
        )}
      </div>
    </div>
  );
}

