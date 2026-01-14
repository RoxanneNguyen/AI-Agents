"""
AI Agents Platform - Main Entry Point
"""

import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
import uvicorn

from config import settings
from api.routes import router as api_router
from api.websocket import router as ws_router

# Configure logging
logger.add(
    "logs/app_{time}.log",
    rotation="500 MB",
    retention="10 days",
    level="DEBUG" if settings.debug else "INFO"
)

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    description="AI Agents Platform - Execute complex tasks with AI agents",
    version="1.0.0",
    debug=settings.debug
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(api_router, prefix="/api")
app.include_router(ws_router, prefix="/ws")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "model": settings.model_name,
        "max_iterations": settings.max_iterations,
        "tools_available": ["browser", "data_analysis", "document_editor"]
    }


@app.on_event("startup")
async def startup_event():
    """Initialize resources on startup"""
    logger.info(f"🚀 Starting {settings.app_name}")
    logger.info(f"📦 Model: {settings.model_name}")
    logger.info(f"🔧 Debug mode: {settings.debug}")
    
    # Create artifacts directory
    import os
    os.makedirs(settings.artifacts_dir, exist_ok=True)
    os.makedirs("logs", exist_ok=True)


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("👋 Shutting down AI Agents Platform")


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
