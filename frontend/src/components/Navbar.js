import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav>
      <div>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/projects">Projects</Link>
      </div>
      <button onClick={handleLogout} style={{ padding: '8px 16px' }}>Logout</button>
    </nav>
  );
};

export default Navbar;