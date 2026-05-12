const express = require('express');
const cors = require('cors');
require('dotenv').config();
console.log('JWT_SECRET:', process.env.JWT_SECRET);
const sequelize = require('./src/config/database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use((req, res, next) => { console.log('Content-Type:', req.get('Content-Type')); console.log('Request body after json:', req.body); next(); });

// Test DB connection
sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection error:', err));

// Load models
require('./src/models');

// Sync models
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Models synced');
    // Routes
    console.log('Loading routes');
    app.get('/', (req, res) => res.send('Hello'));
    try {
      app.use('/api/auth', require('./src/routes/auth'));
      console.log('Auth routes loaded');
    } catch (e) {
      console.error('Error loading auth routes:', e);
    }
    console.log('Before require projects');
    try {
      app.use('/api/projects', require('./src/routes/projects'));
      console.log('Projects routes loaded');
    } catch (e) {
      console.error('Error loading projects routes:', e);
    }
    try {
      app.use('/api/tasks', require('./src/routes/tasks'));
      console.log('Tasks routes loaded');
    } catch (e) {
      console.error('Error loading tasks routes:', e);
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error('Model sync error:', err));