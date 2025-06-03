# Quick Start Guide

## Prerequisites
1. Install Docker Desktop from https://www.docker.com/products/docker-desktop
2. Make sure ports 3000, 8000, and 27017 are available on your machine

## Setup Steps

1. Extract the zip file to a directory of your choice

2. Create two .env files:

   In the root directory create `.env`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

   In the backend directory create `backend/.env`:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   GROQ_API_KEY=your_groq_api_key
   JWT_SECRET_KEY=your_jwt_secret
   ```

3. Open a terminal in the project directory and run:
   ```bash
   docker-compose up --build
   ```

4. Wait for all services to start (this might take a few minutes on first run)

5. Access the application:
   - Frontend: http://localhost:3000
   - API Documentation: http://localhost:8000/docs

## Common Issues

1. If you see "connection refused" errors:
   - Wait a few more seconds for all services to start
   - Check if Docker Desktop is running
   - Make sure no other services are using ports 3000, 8000, or 27017

2. If you see MongoDB connection errors:
   - Wait for MongoDB container to fully start
   - Check if MongoDB container is running: `docker ps`

3. If the frontend shows "Network Error":
   - Make sure backend is running
   - Check backend logs: `docker-compose logs backend`

## Development Mode

To run in development mode with hot-reload:
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

## Stopping the Application

To stop all services:
```bash
docker-compose down
```

To stop and remove all data (including database):
```bash
docker-compose down -v
``` 