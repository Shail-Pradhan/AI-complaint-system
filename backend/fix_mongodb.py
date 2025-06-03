from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from dotenv import load_dotenv
import os

load_dotenv()

async def fix_mongodb():
    # Connect to MongoDB
    client = AsyncIOMotorClient(os.getenv("MONGODB_URL", "mongodb://localhost:27017"))
    db = client.complaint_system
    
    try:
        # List all indexes
        indexes = await db.users.list_indexes().to_list(length=None)
        print("Current indexes:", [idx["name"] for idx in indexes])
        
        # Drop the problematic index
        try:
            await db.users.drop_index("username_1")
            print("Successfully dropped username_1 index")
        except Exception as e:
            print(f"Error dropping index: {str(e)}")
        
        # Drop the entire collection and recreate it (if needed)
        try:
            await db.users.drop()
            print("Successfully dropped users collection")
        except Exception as e:
            print(f"Error dropping collection: {str(e)}")
            
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(fix_mongodb()) 