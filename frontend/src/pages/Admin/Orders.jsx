import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdLocalShipping, MdAttachMoney } from 'react-icons/md';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('Barchasi');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/orders');
      setOrders(res.data);
    } catch (error) {
      console.error('Buyurtmalarni yuklashda xatolik', error);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`/api/orders/${id}/status`, { status: newStatus });
      fetchOrders();
    } catch (error) {
      console.error("Holatni o'zgartirishda xatolik", error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
  };

  const filteredOrders = filter === 'Barchasi' ? orders : orders.filter(o => o.status === filter);

  const statuses = ['Kutilmoqda', 'Tasdiqlandi', 'Tayyorlanmoqda', 'Tayyor', 'Yetkazildi', 'Bekor qilingan'];

  return (
    <div>
      <div className="d-flex justify-between align-center mb-4">
        <h1>Buyurtmalar <span className="title-icon">📦</span></h1>
        
        <select className="form-input" style={{ width: '200px' }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="Barchasi">Barchasi</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="orders-list mt-4">
        {filteredOrders.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Buyurtmalar yo'q.</p>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div>
                  <h3 style={{ margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {order.customerName}
                    <span className={`badge ${order.status === 'Kutilmoqda' ? 'pending' : order.status === 'Yetkazildi' ? 'success' : ''}`}>
                      {order.status}
                    </span>
                  </h3>
                  <div style={{ color: 'var(--text-muted)' }}>
                    {order.phone} &bull; {new Date(order.createdAt).toLocaleString('uz-UZ')}
                  </div>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)' }}>
                  {formatPrice(order.totalAmount)}
                </div>
              </div>

              <div className="d-flex" style={{ gap: '40px', marginBottom: '24px' }}>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Yetkazish:</div>
                  <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MdLocalShipping style={{ color: 'var(--info)' }} /> {order.deliveryType}
                  </div>
                  {order.address && <div style={{ fontSize: '14px', marginTop: '4px', color: 'var(--text-muted)' }}>{order.address}</div>}
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>To'lov:</div>
                  <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MdAttachMoney style={{ color: 'var(--success)' }} /> {order.paymentType}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Buyurtma tarkibi:</div>
                <ul style={{ paddingLeft: '16px', listStyleType: 'disc', color: 'var(--text-dark)' }}>
                  {order.items && order.items.map(item => (
                    <li key={item.id} style={{ marginBottom: '4px' }}>
                      {item.productName} x{item.quantity} - {formatPrice(item.price * item.quantity)}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Holatni o'zgartirish:</div>
                <div className="status-buttons">
                  {statuses.map(s => (
                    <button 
                      key={s} 
                      className={`btn-status ${order.status === s ? 'active' : ''}`}
                      onClick={() => updateStatus(order.id, s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
