import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';

const Tasks = () => {
  const role = localStorage.getItem('role');
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId, currentPage, search, statusFilter]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/tasks/${projectId}?page=${currentPage}&limit=${itemsPerPage}&search=${search}&status=${statusFilter}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTasks(res.data.tasks);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/tasks', { title, description, projectId, assignedTo }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTitle('');
      setDescription('');
      setAssignedTo('');
      fetchTasks();
    } catch (err) {
      alert('Create failed');
    }
  };

  const handleUpdate = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/tasks/${id}`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchTasks();
    } catch (err) {
      alert('Update failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchTasks();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = async (e, newStatus) => {
    const taskId = e.dataTransfer.getData('taskId');
    handleUpdate(taskId, newStatus);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Due Date', 'Assignee'];
    const rows = tasks.map(task => [
      task.id,
      task.title,
      task.description,
      task.status,
      task.priority,
      task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A',
      task.assignee ? task.assignee.username : 'Unassigned'
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tasks_project_${projectId}.csv`);
    document.body.appendChild(link);
    
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <Navbar />
      <div className="glass-card">
        <h2>Tasks for Project {projectId}</h2>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          style={{ padding: '8px', marginRight: '10px' }}
        />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} style={{ padding: '8px' }}>
          <option value="">All Statuses</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Review">Review</option>
          <option value="Done">Done</option>
          <option value="Blocked">Blocked</option>
        </select>
        <button onClick={() => setViewMode(viewMode === 'list' ? 'kanban' : 'list')} style={{ marginLeft: '10px' }}>
          Switch to {viewMode === 'list' ? 'Kanban' : 'List'} View
        </button>
        <button onClick={exportToCSV} style={{ marginLeft: '10px', background: '#28a745' }}>
          Export to CSV
        </button>
      </div>
      {role === 'admin' && (
        <form onSubmit={handleCreate}>
          <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} style={{ padding: '8px', marginRight: '10px' }}>
            <option value="">Assign to...</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.username}</option>
            ))}
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ padding: '8px', marginRight: '10px' }}>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={{ padding: '8px', marginRight: '10px' }} />
          <button type="submit">Create Task</button>
        </form>
      )}
      {viewMode === 'list' ? (
        <ul>
          {tasks.map(task => (
            <li key={task.id}>
              <strong>{task.title}</strong> - {task.description} - Status: {task.status} - Priority: {task.priority} - Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'} - Assigned to: {task.assignee ? task.assignee.username : 'Unassigned'}
              <div>
                <select value={task.status} onChange={(e) => handleUpdate(task.id, e.target.value)}>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Review">Review</option>
                  <option value="Done">Done</option>
                  <option value="Blocked">Blocked</option>
                </select>
                {role === 'admin' && (
                  <button onClick={() => handleDelete(task.id)}>Delete</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="kanban-board" style={{ display: 'flex', gap: '20px', overflowX: 'auto', padding: '20px' }}>
          {['To Do', 'In Progress', 'Review', 'Done', 'Blocked'].map(status => (
            <div
              key={status}
              className="kanban-column"
              onDrop={(e) => handleDrop(e, status)}
              onDragOver={handleDragOver}
              style={{ flex: 1, minWidth: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '10px' }}
            >
              <h3>{status}</h3>
              {tasks.filter(t => t.status === status).map(task => (
                <div
                  key={task.id}
                  className="kanban-card"
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '5px', marginBottom: '10px', cursor: 'grab' }}
                >
                  <strong>{task.title}</strong>
                  <p>{task.description}</p>
                  <small>Priority: {task.priority}</small>
                  <br />
                  <small>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</small>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
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

export default Tasks;