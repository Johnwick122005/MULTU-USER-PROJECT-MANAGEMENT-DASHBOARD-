const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { Project, User, Task } = require('../models');
const { Op } = require('sequelize');

// Get stats for dashboard
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const totalTasks = await Task.count();
    const overdue = await Task.count({ where: { dueDate: { [Op.lt]: new Date() }, status: { [Op.ne]: 'Done' } } });
    const totalProjects = await Project.count();
    
    const tasksByStatus = await Task.findAll({
      attributes: ['status', [Task.sequelize.fn('COUNT', Task.sequelize.col('id')), 'count']],
      group: ['status']
    });
    
    const tasksByPriority = await Task.findAll({
      attributes: ['priority', [Task.sequelize.fn('COUNT', Task.sequelize.col('id')), 'count']],
      group: ['priority']
    });
    
    res.json({
      totalTasks,
      overdue,
      totalProjects,
      tasksByStatus,
      tasksByPriority
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all projects
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 5, search = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Project.findAndCountAll({
      where,
      include: [{ model: User, as: 'creator', attributes: ['username'] }],
      limit: parseInt(limit),
      offset: offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      projects: rows,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page),
      totalItems: count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create project
router.post('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await Project.create({
      name,
      description,
      createdBy: req.user.id,
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get project by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [{ model: User, as: 'creator', attributes: ['username'] }],
    });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update project
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (project.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const { name, description, status } = req.body;
    await project.update({ name, description, status });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete project
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    await project.destroy();
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;