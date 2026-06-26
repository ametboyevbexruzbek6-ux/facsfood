import React from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { MdDashboard, MdRestaurantMenu, MdReceipt, MdLogout, MdArrowBack } from 'react-icons/md';

const Layout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    navigate('/admin/login');
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-icon">F</div>
          <h2 style={{ margin: 0, fontSize: '20px' }}>Admin Panel</h2>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/admin" end className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            <MdDashboard className="nav-icon" /> Dashboard
          </NavLink>
          <NavLink to="/admin/menu" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            <MdRestaurantMenu className="nav-icon" /> Menyu
          </NavLink>
          <NavLink to="/admin/orders" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            <MdReceipt className="nav-icon" /> Buyurtmalar
          </NavLink>
          
          <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
            <Link to="/" className="nav-link" style={{ color: 'var(--text-muted)' }}>
              <MdArrowBack className="nav-icon" /> Saytga qaytish
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div className="user-profile">
            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Salom, <strong style={{color: 'var(--text-dark)'}}>Administrator</strong></span>
            <button className="btn-outline" onClick={handleLogout}>
              <MdLogout /> Chiqish
            </button>
          </div>
        </header>
        
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
