const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM('To Do', 'In Progress', 'Review', 'Done', 'Blocked'),
    defaultValue: 'To Do',
  },
  priority: {
    type: DataTypes.ENUM('High', 'Medium', 'Low'),
    defaultValue: 'Medium',
  },
  dueDate: {
    type: DataTypes.DATE,
  },
  assignedTo: {
    type: DataTypes.INTEGER,
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'tasks',
});

module.exports = Task;