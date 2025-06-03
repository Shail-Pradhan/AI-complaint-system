# AI-Powered Complaint Management System

A modern web application for managing citizen complaints with AI-powered classification and routing. Built with Next.js, FastAPI, and MongoDB.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.12-blue.svg)
![Node](https://img.shields.io/badge/node-22-green.svg)

## Features

- 🔐 **User Authentication**
  - Role-based access (Citizen, Officer, Admin)
  - Secure JWT authentication
  - User profile management

- 📝 **Complaint Management**
  - Easy complaint submission
  - Image upload support
  - Real-time status tracking
  - Department assignment

- 🤖 **AI-Powered Features**
  - Automatic complaint classification
  - Priority scoring
  - Department routing
  - Image analysis

- 📊 **Analytics & Dashboard**
  - Real-time statistics
  - Department-wise analytics
  - Officer performance tracking
  - Status distribution

## Tech Stack

- **Frontend**
  - Next.js
  - TypeScript
  - Chakra UI
  - Axios

- **Backend**
  - FastAPI
  - MongoDB
  - JWT Authentication
  - Cloudinary (Image Storage)
  - Groq AI (Analysis)

- **DevOps**
  - Docker
  - Docker Compose

## Prerequisites

- Docker Desktop
- Git

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/complaint-system.git
   cd complaint-system
   ```

2. Set up environment variables:
   ```bash
   # Root directory
   cp .env.example .env
   
   # Backend directory
   cp backend/.env.example backend/.env
   ```

3. Update the environment variables in both `.env` files with your:
   - Cloudinary credentials
   - Groq AI API key
   - JWT secret key

4. Start the application:
   ```bash
   docker-compose up --build
   ```

5. Access the application:
   - Frontend: http://localhost:3000
   - API Documentation: http://localhost:8000/docs

## Development Setup

Run in development mode with hot-reload:
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

## Project Structure

```
.
├── src/                  # Frontend source code
│   ├── components/      # React components
│   ├── contexts/        # React contexts
│   ├── pages/          # Next.js pages
│   └── styles/         # CSS styles
│
├── backend/             # Backend source code
│   ├── models/         # Database models
│   ├── routers/        # API routes
│   ├── utils/          # Utility functions
│   └── main.py         # FastAPI application
│
├── docker-compose.yml   # Production Docker setup
└── docker-compose.dev.yml # Development Docker setup
```

## API Documentation

Once the application is running, visit http://localhost:8000/docs for interactive API documentation.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/)
- [Next.js](https://nextjs.org/)
- [Chakra UI](https://chakra-ui.com/)
- [Groq AI](https://groq.com/)
- [Cloudinary](https://cloudinary.com/) 