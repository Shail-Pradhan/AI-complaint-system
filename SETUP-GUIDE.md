# Setup Guide for Complaint Management System

## Step 1: Install Docker
1. Download Docker Desktop for your operating system:
   - Windows: https://www.docker.com/products/docker-desktop
   - Mac: https://www.docker.com/products/docker-desktop
   - Linux: Follow instructions at https://docs.docker.com/engine/install/

2. Install Docker Desktop
3. Start Docker Desktop
4. Wait until Docker Desktop is running (check the taskbar icon)

## Step 2: Extract the Project
1. Locate the `complaint-system.zip` file you received
2. Create a new folder where you want to set up the project
3. Extract the zip file into this folder
4. You should see these key files and folders:
   ```
   complaint-system/
   ├── src/
   ├── backend/
   ├── docker-compose.yml
   ├── docker-compose.dev.yml
   ├── Dockerfile
   ├── .env
   └── backend/.env
   ```

## Step 3: Verify Environment Files
The .env files are already included with the necessary API keys. DO NOT modify these unless instructed.

## Step 4: Start the Application
1. Open a terminal/command prompt
2. Navigate to the project folder:
   ```bash
   cd path/to/complaint-system
   ```
3. Start the application:
   ```bash
   docker-compose up --build
   ```
4. Wait for the setup to complete. You'll see messages like:
   - "mongodb_1   | Waiting for connections"
   - "backend_1   | Application startup complete"
   - "frontend_1  | Ready in xxxms"

## Step 5: Access the Application
1. Open your web browser
2. Go to http://localhost:3000
3. You should see the login page

## Step 6: Create Test Accounts
1. Click "Register" to create accounts:

   Citizen Account:
   - Email: test@citizen.com
   - Password: test123
   - Role: Citizen

   Officer Account:
   - Email: test@officer.com
   - Password: test123
   - Role: Government Officer

## Common Issues & Solutions

### Issue 1: Docker Errors
If you see "docker daemon not running":
1. Check if Docker Desktop is running
2. Try restarting Docker Desktop
3. Restart your computer

### Issue 2: Port Conflicts
If you see "port already in use":
1. Make sure no other applications are using:
   - Port 3000 (Frontend)
   - Port 8000 (Backend)
   - Port 27017 (MongoDB)
2. Stop any conflicting applications
3. Try again

### Issue 3: Application Not Loading
If the application doesn't load:
1. Check container status:
   ```bash
   docker-compose ps
   ```
2. Check container logs:
   ```bash
   docker-compose logs
   ```

## Development Mode (Optional)
To run with hot-reload for development:
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

## Stopping the Application
1. In the terminal where docker-compose is running:
   - Press Ctrl+C
2. Then run:
   ```bash
   docker-compose down
   ```

## Need Help?
If you encounter any issues:
1. Check the logs:
   ```bash
   docker-compose logs
   ```
2. Contact me with:
   - Screenshot of the error
   - Output of `docker-compose ps`
   - Output of `docker-compose logs` 