import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', { username, email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role);
      navigate('/dashboard');
    } catch (err) {
      alert('Signup failed');
    }
  };

  return (
    <div className="glass-card" style={{ maxWidth: '400px', margin: '100px auto' }}>
      <h2>Signup</h2>
      <form onSubmit={handleSubmit} style={{ background: 'none', border: 'none', padding: 0 }}>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Signup</button>
      </form>
      <p>Already have an account? <a href="/login" style={{ color: 'var(--accent)' }}>Login</a></p>
    </div>
  );
};

export default Signup;