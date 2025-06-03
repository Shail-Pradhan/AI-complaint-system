from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import asyncio
import sys

load_dotenv()

async def setup_indexes():
    # Get MongoDB connection details from environment variables
    mongodb_url = os.getenv("MONGODB_URL")
    database_name = os.getenv("DATABASE_NAME")
    
    if not mongodb_url or not database_name:
        print("Error: MONGODB_URL and DATABASE_NAME must be set in .env file")
        sys.exit(1)
    
    try:
        # Connect to MongoDB
        print("Connecting to MongoDB Atlas...")
        client = AsyncIOMotorClient(mongodb_url)
        db = client[database_name]
        
        # Verify connection
        await client.admin.command('ping')
        print("Successfully connected to MongoDB Atlas!")
        
        # Create indexes for complaints collection
        print("Creating indexes for complaints collection...")
        await db.complaints.create_index([
            ("status", 1),
            ("created_at", -1)
        ])
        
        await db.complaints.create_index([
            ("assigned_to", 1),
            ("status", 1)
        ])
        
        # Index for AI analysis fields
        await db.complaints.create_index([
            ("ai_analysis.priority_score", -1)
        ])
        
        # Create indexes for users collection
        print("Creating indexes for users collection...")
        await db.users.create_index("email", unique=True)
        await db.users.create_index("username", unique=True)
        
        print("✅ Database indexes created successfully!")
        
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)
    finally:
        # Close the connection
        client.close()

if __name__ == "__main__":
    asyncio.run(setup_indexes()) 