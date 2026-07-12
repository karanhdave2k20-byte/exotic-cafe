import React, { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

export const StoreProvider = ({ children }) => {
  const [tableInfo, setTableInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('aura-table');
      return saved ? JSON.parse(saved) : { tableNo: null };
    } catch(err) { return { tableNo: null }; }
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('aura-user');
      return saved ? JSON.parse(saved) : null;
    } catch(err) { return null; }
  });

  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('aura-admin');
      return saved ? JSON.parse(saved) : null;
    } catch(err) { return null; }
  });

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('aura-cart');
      return saved ? JSON.parse(saved) : [];
    } catch(err) { return []; }
  });
  
  const [orderStatus, setOrderStatus] = useState(null);
  const [currentOrderId, setCurrentOrderId] = useState(() => localStorage.getItem('aura-order-id'));
  const [theme, setTheme] = useState(localStorage.getItem('aura-theme') || 'dark');

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };
  const [mediaPreference, setMediaPreference] = useState('All');
  const [adminTables, setAdminTables] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminCustomers, setAdminCustomers] = useState([]);
  const [adminPayments, setAdminPayments] = useState([]);
  const [recentOrderTotal, setRecentOrderTotal] = useState(() => {
    try {
      const saved = localStorage.getItem('aura-recent-total');
      return saved ? parseFloat(saved) : 0;
    } catch(err) { return 0; }
  });
  const [adminFeedback, setAdminFeedback] = useState([]);
  const [adminBookings, setAdminBookings] = useState([]);
  const [waiterCalls, setWaiterCalls] = useState([]);
  const [serverIp, setServerIp] = useState('localhost'); // Fallback to localhost
  const [tunnelUrl, setTunnelUrl] = useState(''); // Public Tunnel URL
  const [adminMenu, setAdminMenu] = useState([
    { id: 1, name: 'Premium Espresso', category: 'Drinks', price: 150, img: '/espresso.png', isVeg: true },
    { id: 2, name: 'Golden Cappuccino', category: 'Drinks', price: 250, img: '/latte.png', isVeg: true },
    { id: 3, name: 'Hazelnut Latte', category: 'Drinks', price: 300, img: '/latte.png', isVeg: true },
    { id: 4, name: 'Iced Caramel Macchiato', category: 'Drinks', price: 320, img: '/latte.png', isVeg: true },
    { id: 5, name: 'Matcha Green Tea Latte', category: 'Drinks', price: 280, img: '/latte.png', isVeg: true },
    { id: 6, name: 'Classic Butter Croissant', category: 'Snacks', price: 180, img: '/croissant.png', isVeg: true },
    { id: 7, name: 'Grilled Paneer Pesto Panini', category: 'Snacks', price: 450, img: '/croissant.png', isVeg: true },
    { id: 8, name: 'Chocolate Fudge Brownie', category: 'Dessert', price: 220, img: '/cheesecake.png', isVeg: true },
    { id: 9, name: 'New York Cheesecake', category: 'Dessert', price: 350, img: '/cheesecake.png', isVeg: true },
    { id: 10, name: 'Robusta Beans (250g)', category: 'Retail', price: 950, img: '/espresso.png', isVeg: true },
  ]);
  const [isPureVeg, setIsPureVeg] = useState(true);
  const togglePureVeg = () => setIsPureVeg(prev => !prev);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('aura-table', JSON.stringify(tableInfo));
  }, [tableInfo]);

  useEffect(() => {
    localStorage.setItem('aura-user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('aura-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (currentOrderId) localStorage.setItem('aura-order-id', currentOrderId);
    else localStorage.removeItem('aura-order-id');
  }, [currentOrderId]);

  useEffect(() => {
    localStorage.setItem('aura-recent-total', recentOrderTotal.toString());
  }, [recentOrderTotal]);

  // Handle automatic order status updates from syncing
  useEffect(() => {
    if (currentOrderId && adminOrders && adminOrders.length > 0) {
      const myOrder = adminOrders.find(o => o.o === currentOrderId);
      if (myOrder) {
        // Map backend status to frontend stages
        const statusMap = {
          'Preparing': 'preparing',
          'Ready': 'ready',
          'Delivered': 'delivered',
          'Completed': 'delivered'
        };
        setOrderStatus(statusMap[myOrder.s] || 'received');
      }
    }
  }, [adminOrders, currentOrderId]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('aura-theme', theme);
  }, [theme]);

  // Real-Time Cross-Device Polling Setup
  useEffect(() => {
    const fetchRealTimeDatabase = async () => {
      try {
        const url = `/api/database/sync`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setAdminOrders(data.orders);
          setAdminTables(data.tables);
          setAdminFeedback(data.feedback);
          setAdminCustomers(data.customers || []);
          setAdminPayments(data.payments || []);
          setAdminBookings(data.bookings || []);
          setWaiterCalls(data.waiterCalls || []);
        }
      } catch (err) {
        console.error("Real-time sync error. Is server.js running?");
      }
    };
    
    // Fetch Server IP for QR Code Generation
    const fetchServerIp = async () => {
      try {
        const res = await fetch('/api/get-ip');
        if (res.ok) {
          const data = await res.json();
          setServerIp(data.ip || 'localhost');
          if (data.tunnelUrl && !localStorage.getItem('aura-tunnel')) {
             setTunnelUrl(data.tunnelUrl);
          }
        }
      } catch(err) {
        console.warn("Could not fetch server IP. Localhost fallback active.");
      }
    };

    // Handle table in URL
    const params = new URLSearchParams(window.location.search);
    const urlTable = params.get('table');
    if (urlTable) {
       setTableInfo({ tableNo: urlTable });
    }

    fetchServerIp();
    fetchRealTimeDatabase(); // Initial fetch
    // Pole every 5 seconds (Optimized from 2s)
    const interval = setInterval(fetchRealTimeDatabase, 5000); 
    return () => clearInterval(interval);
  }, []);

  // Sync status for the active order from the backend
  useEffect(() => {
    if (currentOrderId && adminOrders.length > 0) {
      const activeOrder = adminOrders.find(o => o.o === currentOrderId);
      if (activeOrder && activeOrder.s) {
         // Standardize status names if they differ
         const statusMap = {
           'Preparing': 'preparing',
           'Ready': 'ready',
           'Completed': 'delivered',
           'Ready to Serve': 'ready'
         };
         setOrderStatus(statusMap[activeOrder.s] || activeOrder.s.toLowerCase());
      }
    }
  }, [adminOrders, currentOrderId]);

  const placeOrder = async () => {
    if (cart.length === 0) return;
    const orderId = Math.floor(1000 + Math.random() * 9000).toString();
    const newOrder = {
      o: orderId,
      t: tableInfo?.tableNo || 'Takeaway',
      i: cart.map(c => `${c.quantity}x ${c.name}`).join(', '),
      price: `₹${cartTotal + cartTotal * 0.08}`,
      s: 'Preparing',
      rawAmount: cartTotal + cartTotal * 0.08,
      contact: user?.contact || user?.c || '' // Link order to customer contact
    };
    
    // Physically push to Backend REST API so the Admin on a different computer sees it!
    try {
      const url = `/api/database/orders`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      showToast('Order placed successfully!', 'success');
    } catch(err) { 
      console.error("Could not send order to realtime server");
      showToast('Error placing order. Please try again.', 'error');
    }

    setRecentOrderTotal(cartTotal + (cartTotal * 0.08));
    setCart([]); // Cart formally emptied so user can start a fresh order later
    setCurrentOrderId(orderId);
    setOrderStatus('received');
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`${product.name} added to cart`, 'success');
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts([{ id, message, type }]); // Replace instead of append for Singleton Toast
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const callWaiter = async () => {
    if (!tableInfo?.tableNo) return;
    try {
      await fetch('/api/database/waiter-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId: tableInfo.tableNo })
      });
      showToast('Waiter called! They will be with you shortly.', 'success');
    } catch(err) { showToast('Error calling waiter.', 'error'); }
  };

  const updateTableStatus = async (id, status) => {
    try {
      await fetch(`/api/database/tables/${id}/status`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      showToast(`Table ${id} is now ${status}`, 'success');
    } catch(err) { showToast('Error updating table.', 'error'); }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await fetch(`/api/database/orders/${id}/status`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      showToast(`Order #${id} is ${status}`, 'success');
    } catch(err) { showToast('Error updating order.', 'error'); }
  };

  const deleteOrder = async (id) => {
    try {
      await fetch(`/api/database/orders/${id}`, { method: 'DELETE' });
      showToast(`Order #${id} deleted`, 'info');
    } catch(err) { showToast('Error deleting order.', 'error'); }
  };

  const handleWipeDatabase = async () => {
    if (!window.confirm("Are you sure? This will wipe EVERYTHING.")) return;
    try {
      await fetch('/api/database/reset', { method: 'DELETE' });
      showToast('Database wiped clean.', 'info');
    } catch(err) { showToast('Error resetting database.', 'error'); }
  };

  const createTable = async (seats) => {
    try {
      await fetch('/api/database/tables', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seats })
      });
      showToast('New table created.', 'success');
    } catch(err) { showToast('Error creating table.', 'error'); }
  };

  const deleteCustomerProfile = async (contact) => {
    try {
      await fetch(`/api/database/customers/${contact}`, { method: 'DELETE' });
      showToast('Customer profile deleted.', 'info');
    } catch(err) { showToast('Error deleting customer.', 'error'); }
  };

  return (
    <StoreContext.Provider value={{
      tableInfo, setTableInfo,
      user, setUser, 
    adminUser, setAdminUser,
    cart, setCart, 
addToCart, updateQuantity, removeFromCart, cartTotal, placeOrder,
      orderStatus, setOrderStatus,
      mockMenu: adminMenu, 
      adminTables, setAdminTables,
      adminOrders, setAdminOrders,
      adminMenu, setAdminMenu,
      adminFeedback, setAdminFeedback,
      adminCustomers, setAdminCustomers,
      adminPayments, setAdminPayments,
      adminBookings, setAdminBookings,
      waiterCalls, setWaiterCalls,
      callWaiter,
      updateTableStatus, updateOrderStatus, deleteOrder,
      handleWipeDatabase, createTable, deleteCustomerProfile,
      mediaPreference, setMediaPreference,
      recentOrderTotal,
      currentOrderId, setCurrentOrderId,
      theme, toggleTheme,
      showToast,
      serverIp,
      tunnelUrl, setTunnelUrl,
      isPureVeg, togglePureVeg
    }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <Toast 
            key={t.id} 
            message={t.message} 
            type={t.type} 
            onClose={() => removeToast(t.id)} 
          />
        ))}
      </div>
    </StoreContext.Provider>
  );
};

import Toast from './components/Toast';

