import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';

const Projects = () => {
  const role = localStorage.getItem('role');
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [currentPage, search]);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/projects?page=${currentPage}&limit=${itemsPerPage}&search=${search}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProjects(res.data.projects);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/projects', { name, description }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setName('');
      setDescription('');
      fetchProjects();
    } catch (err) {
      alert('Create failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchProjects();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="glass-card">
        <h2>Projects</h2>
      <input
        type="text"
        placeholder="Search projects..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
        style={{ marginBottom: '20px', padding: '8px', width: '100%', maxWidth: '300px' }}
      />
      {role === 'admin' && (
        <form onSubmit={handleCreate}>
          <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <button type="submit">Create Project</button>
        </form>
      )}
      <ul>
        {projects.map(project => (
          <li key={project.id}>
            <strong>{project.name}</strong> - {project.description}
            <div>
              <button onClick={() => navigate(`/tasks/${project.id}`)}>View Tasks</button>
              {role === 'admin' && (
                <button onClick={() => handleDelete(project.id)}>Delete</button>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className="pagination">
        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
          Previous
        </button>
        <span> Page {currentPage} of {totalPages} </span>
        <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
      </div>
    </div>
  );
};

export default Projects;