import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ totalTasks: 0, overdue: 0, totalProjects: 0, tasksByStatus: [], tasksByPriority: [] });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
    fetchProjects();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/projects/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/projects', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error(err);
    }
  };

  const inProgress = stats.tasksByStatus.find(t => t.status === 'In Progress')?.count || 0;
  const completed = stats.tasksByStatus.find(t => t.status === 'Done')?.count || 0;
  
  const totalTasks = stats.totalTasks || 1;
  let currentPercentage = 0;
  const pieChartGradient = stats.tasksByStatus.map(t => {
    const percentage = (t.count / totalTasks) * 100;
    const start = currentPercentage;
    currentPercentage += percentage;
    const color = t.status === 'In Progress' ? '#ffc107' : t.status === 'Done' ? '#28a745' : t.status === 'To Do' ? '#17a2b8' : t.status === 'Review' ? '#6f42c1' : '#dc3545';
    return `${color} ${start}% ${currentPercentage}%`;
  }).join(', ') || 'rgba(255,255,255,0.1) 0% 100%';

  return (
    <div>
      <Navbar />
      <div className="glass-card">
        <h2>Dashboard</h2>
        
        <div className="stats-container" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <div className="stat-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px', flex: 1, textAlign: 'center' }}>
            <h4>Total Tasks</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent)' }}>{stats.totalTasks}</p>
          </div>
          <div className="stat-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px', flex: 1, textAlign: 'center' }}>
            <h4>In Progress</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>{inProgress}</p>
          </div>
          <div className="stat-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px', flex: 1, textAlign: 'center' }}>
            <h4>Completed</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>{completed}</p>
          </div>
          <div className="stat-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px', flex: 1, textAlign: 'center' }}>
            <h4>Overdue</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>{stats.overdue}</p>
          </div>
        </div>

        <div className="charts-container" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          {/* Pie Chart for Status */}
          <div className="chart-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px', flex: 1 }}>
            <h4>Tasks by Status</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                background: `conic-gradient(${pieChartGradient})`
              }}></div>
              <div>
                {stats.tasksByStatus.map(t => (
                  <div key={t.status} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', marginRight: '5px', background: t.status === 'In Progress' ? '#ffc107' : t.status === 'Done' ? '#28a745' : t.status === 'To Do' ? '#17a2b8' : t.status === 'Review' ? '#6f42c1' : '#dc3545' }}></span>
                    <span>{t.status}: {t.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bar Chart for Priority */}
          <div className="chart-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px', flex: 1 }}>
            <h4>Tasks by Priority</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {stats.tasksByPriority.map(p => (
                <div key={p.priority} style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '80px' }}>{p.priority}</span>
                  <div style={{
                    flex: 1,
                    height: '20px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${(p.count / totalTasks) * 100}%`,
                      height: '100%',
                      background: 'var(--accent)'
                    }}></div>
                  </div>
                  <span style={{ marginLeft: '10px' }}>{p.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <h3>Projects</h3>
        <Link to="/projects" style={{ color: 'var(--accent)', textDecoration: 'none', marginBottom: '20px', display: 'inline-block' }}>Manage Projects</Link>
        <ul>
          {projects.map(project => (
            <li key={project.id}>
              <Link to={`/tasks/${project.id}`} style={{ color: 'var(--text)', textDecoration: 'none' }}>{project.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;