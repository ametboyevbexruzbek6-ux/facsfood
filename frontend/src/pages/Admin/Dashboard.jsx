import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MdShoppingBag, MdAccessTime, MdAttachMoney, MdRestaurantMenu } from 'react-icons/md';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalProducts: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchRecentOrders();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Statistika yuklanmadi', error);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const res = await axios.get('/api/orders');
      setRecentOrders(res.data.slice(0, 5)); // So'nggi 5 ta buyurtma
    } catch (error) {
      console.error('Buyurtmalar yuklanmadi', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
  };

  return (
    <div>
      <h1>Dashboard <span className="title-icon">📊</span></h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Kafe faoliyati haqida umumiy ma'lumotlar</p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span>Jami buyurtmalar</span>
            <MdShoppingBag className="stat-icon" />
          </div>
          <div className="stat-value">{stats.totalOrders}</div>
        </div>
        
        <div className="stat-card c-warning">
          <div className="stat-header">
            <span>Kutilayotgan buyurtmalar</span>
            <MdAccessTime className="stat-icon" style={{color: 'var(--warning)'}} />
          </div>
          <div className="stat-value" style={{color: 'var(--warning)'}}>{stats.pendingOrders}</div>
        </div>

        <div className="stat-card c-success">
          <div className="stat-header">
            <span>Jami daromad</span>
            <MdAttachMoney className="stat-icon" style={{color: 'var(--success)'}} />
          </div>
          <div className="stat-value c-success-text">{formatPrice(stats.totalRevenue)}</div>
        </div>

        <div className="stat-card c-info">
          <div className="stat-header">
            <span>Menyu mahsulotlari</span>
            <MdRestaurantMenu className="stat-icon" style={{color: 'var(--info)'}} />
          </div>
          <div className="stat-value" style={{color: 'var(--info)'}}>{stats.totalProducts}</div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <div className="d-flex justify-between align-center mb-4">
          <h3 style={{ margin: 0 }}>So'nggi buyurtmalar</h3>
          <button className="btn-outline" style={{ fontSize: '13px', padding: '6px 12px' }}>Barchasini ko'rish</button>
        </div>
        
        {recentOrders.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Buyurtmalar yo'q.</p>
        ) : (
          <div className="orders-list">
            {recentOrders.map(order => (
              <div key={order.id} className="order-card" style={{ padding: '16px', marginBottom: '0' }}>
                <div className="d-flex justify-between align-center">
                  <div>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 8px 0' }}>
                      {order.customerName} 
                      <span className={`badge ${order.status === 'Kutilmoqda' ? 'pending' : order.status === 'Yetkazildi' ? 'success' : ''}`}>
                        {order.status}
                      </span>
                    </h4>
                    <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                      {order.phone} &bull; {order.items ? order.items.length : 0} ta mahsulot
                      <br/>
                      {new Date(order.createdAt).toLocaleString('uz-UZ')}
                    </div>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {formatPrice(order.totalAmount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
