import asyncio
import uvicorn
from uvicorn.config import Config
from uvicorn.server import Server

async def main():
    config = Config(
        app="main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        reload_dirs=["backend"]
    )
    server = Server(config=config)
    
    # Configure the server manually
    if not config.loaded:
        config.load()
    
    # Start the server using the low-level API
    await server.serve()

if __name__ == "__main__":
    # Use asyncio.run with explicit policy for Python 3.12 compatibility
    if hasattr(asyncio, 'WindowsSelectorEventLoopPolicy'):
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main()) 