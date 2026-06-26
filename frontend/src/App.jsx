import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './pages/Admin/Layout';
import Dashboard from './pages/Admin/Dashboard';
import Menu from './pages/Admin/Menu';
import Orders from './pages/Admin/Orders';
import Login from './pages/Admin/Login';
import Home from './pages/Client/Home';

// Himoyalangan marshrut komponenti
const ProtectedRoute = ({ children }) => {
  const isAuth = localStorage.getItem('isAdminLoggedIn') === 'true';
  return isAuth ? children : <Navigate to="/admin/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Client routes */}
        <Route path="/" element={<Home />} />
        
        {/* Admin Login */}
        <Route path="/admin/login" element={<Login />} />

        {/* Admin routes */}
        <Route path="/admin" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="menu" element={<Menu />} />
          <Route path="orders" element={<Orders />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
