const User = require('./User');
const Project = require('./Project');
const Task = require('./Task');

// Associations
User.hasMany(Project, { foreignKey: 'createdBy' });
Project.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

Project.hasMany(Task, { foreignKey: 'projectId' });
Task.belongsTo(Project, { foreignKey: 'projectId' });

User.hasMany(Task, { foreignKey: 'assignedTo' });
Task.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });

module.exports = { User, Project, Task };