import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, ShoppingCart } from 'lucide-react';
import { useStore } from '../../StoreContext';
import Modal from '../../components/Modal';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, cartTotal, placeOrder } = useStore();

  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [splitCount, setSplitCount] = React.useState(1);
  const [isSplitEnabled, setIsSplitEnabled] = React.useState(false);

  const handlePlaceOrder = () => {
    setIsConfirmOpen(true);
  };

  const confirmOrder = () => {
    placeOrder();
    setIsConfirmOpen(false);
    navigate('/fun');
  };

  const taxes = cartTotal * 0.08;
  const grandTotal = cartTotal + taxes;

  return (
    <div className="mobile-wrapper" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', justifyContent: 'center' }}>
        <h2 style={{ margin: 0 }}>My Order</h2>
      </div>

      {cart.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>Your cart is empty.</p>
          <button className="btn btn-primary" onClick={() => navigate('/menu')} style={{ marginTop: '1rem' }}>Browse Menu</button>
        </div>
      ) : (
        <>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {cart.map(item => (
              <div key={item.id} className="glass-panel" style={{ display: 'flex', gap: '1rem', padding: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                <img src={item.img} alt={item.name} style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>{item.name}</h4>
                  <p style={{ color: 'var(--primary-color)', fontWeight: 'bold', margin: 0 }}>₹{item.price.toFixed(2)}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-full)', padding: '0.2rem' }}>
                  <button onClick={() => updateQuantity(item.id, -1)} style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-color)' }}>-</button>
                  <span style={{ width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-color)', color: '#1a1a1a' }}>+</button>
                </div>
                <button onClick={() => removeFromCart(item.id)} style={{ color: 'var(--danger-color)', padding: '0.5rem' }}>
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', marginTop: 'auto', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '0 -2rem -2rem -2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Taxes (8%)</span>
              <span>₹{taxes.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
              <span>Total</span>
              <span style={{ color: 'var(--primary-color)' }}>₹{grandTotal.toFixed(2)}</span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Split Bill</span>
                <button 
                  onClick={() => setIsSplitEnabled(!isSplitEnabled)}
                  style={{ background: isSplitEnabled ? 'var(--primary-color)' : 'var(--bg-card)', color: isSplitEnabled ? '#1a1a1a' : 'var(--text-muted)', padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-full)', border: 'none', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  {isSplitEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
              {isSplitEnabled && (
                <div style={{ marginTop: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button onClick={() => setSplitCount(Math.max(1, splitCount - 1))} style={{ width: '24px', height: '24px', borderRadius: '4px', background: 'var(--bg-color)' }}>-</button>
                      <span>{splitCount} people</span>
                      <button onClick={() => setSplitCount(splitCount + 1)} style={{ width: '24px', height: '24px', borderRadius: '4px', background: 'var(--bg-color)' }}>+</button>
                   </div>
                   <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>₹{(grandTotal / splitCount).toFixed(2)} each</span>
                </div>
              )}
            </div>
            
            <button className="btn btn-primary btn-block" onClick={handlePlaceOrder} style={{ padding: '1.2rem', fontSize: '1.2rem' }}>
              Place Order
            </button>
          </div>
        </>
      )}
    <Modal 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)} 
        onConfirm={confirmOrder}
        title="Confirm Your Order?"
        message={`Place this order for ₹${grandTotal.toFixed(2)}? Your coffee will be prepared right away.`}
        type="primary"
    />
    </div>
  );
}
