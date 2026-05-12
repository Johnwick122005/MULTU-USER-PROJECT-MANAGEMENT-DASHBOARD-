const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { Task, User, Project } = require('../models');
const { Op } = require('sequelize');

// Get all tasks (Global)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 5, search = '', status = '', priority = '', project = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    
    // Role-based restriction: Non-admins only see their own tasks
    if (req.user.role !== 'admin') {
      where.assignedTo = req.user.id;
    }
    
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (project) where.projectId = project;

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Task.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: offset,
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'username', 'email'] },
        { model: Project, attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      totalTasks: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      tasks: rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tasks for a project
router.get('/:projectId', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 5, search = '', status = '', priority = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = { projectId: req.params.projectId };
    
    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Task.findAndCountAll({
      where,
      include: [
        { model: User, as: 'assignee', attributes: ['username'] },
        { model: Project, attributes: ['name'] },
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      tasks: rows,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page),
      totalItems: count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create task
router.post('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, priority, dueDate } = req.body;
    const task = await Task.create({
      title,
      description,
      projectId,
      assignedTo,
      priority,
      dueDate,
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    // Check if user is assignee or admin
    if (task.assignedTo !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const { title, description, status, assignedTo, priority, dueDate } = req.body;
    
    if (req.user.role === 'admin') {
      await task.update({ title, description, status, assignedTo, priority, dueDate });
    } else {
      // Regular user (assignee) can only update status
      await task.update({ status });
    }
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete task
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (task.assignedTo !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await task.destroy();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;