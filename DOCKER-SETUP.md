# Docker Setup Guide for Complaint Management System

This guide will help you run the Complaint Management System using Docker. The system consists of three main components:
1. Frontend (Next.js)
2. Backend (FastAPI)
3. Database (MongoDB)

## Prerequisites

1. Install [Docker](https://www.docker.com/products/docker-desktop/)
2. Install [Git](https://git-scm.com/downloads)

## Setup Steps

1. Clone the repository:
```bash
git clone <repository-url>
cd complaint-system
```

2. Create a `.env` file in the root directory with the following content:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GROQ_API_KEY=your_groq_api_key
```

3. Create a `.env` file in the `backend` directory with the following content:
```env
MONGODB_URL=mongodb://mongodb:27017
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GROQ_API_KEY=your_groq_api_key
SECRET_KEY=your_jwt_secret_key
```

4. Run the application using Docker Compose:
```bash
# For development
docker-compose -f docker-compose.dev.yml up --build

# For production
docker-compose up --build
```

5. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Important Notes

1. The first build might take a few minutes as Docker needs to download and build all dependencies.
2. Make sure ports 3000, 8000, and 27017 are not being used by other applications.
3. MongoDB data is persisted using Docker volumes, so your data will remain even after stopping the containers.

## Common Commands

```bash
# Start the application
docker-compose up

# Start in detached mode (run in background)
docker-compose up -d

# Stop the application
docker-compose down

# View logs
docker-compose logs

# View logs for a specific service
docker-compose logs frontend
docker-compose logs backend
docker-compose logs mongodb

# Rebuild containers
docker-compose up --build

# Remove all containers and volumes (will delete database data)
docker-compose down -v
```

## Troubleshooting

1. If you get a "port already in use" error:
   - Make sure no other services are running on ports 3000, 8000, or 27017
   - Stop any existing Docker containers: `docker-compose down`

2. If the frontend can't connect to the backend:
   - Check if all containers are running: `docker-compose ps`
   - Verify the NEXT_PUBLIC_API_URL in your .env file

3. If changes are not reflecting:
   - Rebuild the containers: `docker-compose up --build`

4. If MongoDB fails to start:
   - Check if another MongoDB instance is running locally
   - Try removing the volume: `docker-compose down -v`

## Development Workflow

1. Make changes to the code
2. If you modified dependencies (package.json or requirements.txt):
   ```bash
   docker-compose up --build
   ```
3. If you only modified source code:
   ```bash
   docker-compose restart frontend  # for frontend changes
   docker-compose restart backend   # for backend changes
   ```

## Environment Variables

### Frontend (.env)
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:8000)
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name for image uploads
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret

### Backend (backend/.env)
- `MONGODB_URL`: MongoDB connection URL
- `SECRET_KEY`: JWT secret key for authentication
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret
- `GROQ_API_KEY`: GROQ API key for AI analysis 