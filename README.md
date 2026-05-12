# Multi-User Project Management Dashboard (Mini CRM)

A full-stack application for managing projects and tasks with user authentication and role-based access.

## Features

- User authentication (signup/login) with JWT
- Dashboard with project and task listings
- Task CRUD operations
- Assign tasks to users with status tracking
- Search and filter functionality
- Pagination for large datasets
- Role-based access (Admin/User)

## Tech Stack

- **Backend**: Node.js, Express.js, PostgreSQL, Sequelize ORM
- **Frontend**: React, Axios, React Router
- **Authentication**: JWT, bcrypt

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up the database:
   - Create a PostgreSQL database
   - Update the `.env` file with your database credentials

4. Run database migrations (if using Sequelize CLI):
   ```
   npx sequelize-cli db:migrate
   ```

5. Start the server:
   ```
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

The application will be available at `http://localhost:3000`.

## API Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create a new project
- `GET /api/tasks/:projectId` - Get tasks for a project
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

## Database Schema

- **Users**: id, username, email, password, role
- **Projects**: id, name, description, createdBy
- **Tasks**: id, title, description, status, assignedTo, projectId

## Deployment

- Backend can be deployed to services like Heroku, Vercel, or AWS
- Frontend can be built with `npm run build` and deployed to Netlify, Vercel, or GitHub Pages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License.