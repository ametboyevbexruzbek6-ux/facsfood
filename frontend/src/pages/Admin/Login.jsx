import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdLockOutline, MdArrowBack } from 'react-icons/md';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin1234') {
      localStorage.setItem('isAdminLoggedIn', 'true');
      navigate('/admin');
    } else {
      setError("Login yoki parol noto'g'ri!");
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', position: 'relative' }}>
      
      <Link to="/" style={{ position: 'absolute', top: '30px', left: '30px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontWeight: '600' }}>
        <MdArrowBack /> Saytga qaytish
      </Link>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '40px', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #FF8A00)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 16px auto', boxShadow: '0 8px 16px var(--primary-glow)' }}>
            <MdLockOutline />
          </div>
          <h2 style={{ margin: 0 }}>Admin Panelga kirish</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Boshqaruv paneliga kirish uchun ma'lumotlarni kiriting</p>
        </div>

        {error && (
          <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontSize: '14px', textAlign: 'center', fontWeight: '600' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Login</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="admin" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Parol</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '10px', fontSize: '16px' }}>
            Kirish
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
