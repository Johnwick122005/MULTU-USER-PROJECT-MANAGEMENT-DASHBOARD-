const bcrypt = require('bcryptjs');
const { User, Project, Task } = require('./models');
const sequelize = require('./config/database');

const seed = async () => {
  try {
    // Force sync to reset DB
    await sequelize.sync({ force: true });
    console.log('Database synced (tables recreated)');

    // Create Users
    const hashedPassword = await bcrypt.hash('password123', 10);
    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'
    });
    const user1 = await User.create({
      username: 'john_doe',
      email: 'john@example.com',
      password: hashedPassword,
      role: 'user'
    });
    const user2 = await User.create({
      username: 'jane_smith',
      email: 'jane@example.com',
      password: hashedPassword,
      role: 'user'
    });

    console.log('Users created');

    // Create Projects
    const project1 = await Project.create({
      name: 'Alpha CRM Platform',
      description: 'Building the next generation CRM with glassmorphism UI.',
      status: 'Active',
      createdBy: admin.id
    });
    const project2 = await Project.create({
      name: 'Beta Mobile App',
      description: 'React Native app for field agents.',
      status: 'Active',
      createdBy: admin.id
    });

    console.log('Projects created');

    // Create Tasks
    await Task.create({
      title: 'Setup Infrastructure',
      description: 'Setup servers, DB, and CI/CD pipeline.',
      status: 'Done',
      priority: 'High',
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      projectId: project1.id,
      assignedTo: admin.id
    });

    await Task.create({
      title: 'Design Premium UI',
      description: 'Create glassmorphism design tokens and components.',
      status: 'In Progress',
      priority: 'High',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      projectId: project1.id,
      assignedTo: user1.id
    });

    await Task.create({
      title: 'Develop Auth API',
      description: 'Build JWT with access and refresh tokens.',
      status: 'Review',
      priority: 'Medium',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      projectId: project1.id,
      assignedTo: user2.id
    });

    await Task.create({
      title: 'Write Unit Tests',
      description: 'Add coverage for auth and projects.',
      status: 'To Do',
      priority: 'Low',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      projectId: project1.id
    });

    await Task.create({
      title: 'Fix Push Notifications',
      description: 'Notifications are failing on iOS.',
      status: 'Blocked',
      priority: 'High',
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Overdue
      projectId: project2.id,
      assignedTo: user1.id
    });

    await Task.create({
      title: 'Market Research',
      description: 'Competitor analysis for the new product.',
      status: 'To Do',
      priority: 'Medium',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      projectId: project2.id,
      assignedTo: user2.id
    });

    await Task.create({
      title: 'Export Feature',
      description: 'Implement CSV export for tasks.',
      status: 'Done',
      priority: 'Low',
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      projectId: project2.id,
      assignedTo: admin.id
    });

    console.log('Tasks created');
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
