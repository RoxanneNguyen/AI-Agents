"""
AI Agents Platform - Backend Configuration
"""

from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    """Application settings"""
    
    # API Configuration
    app_name: str = "AI Agents Platform"
    debug: bool = True
    host: str = "0.0.0.0"
    port: int = 8000
    
    # LLM Configuration
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    model_name: str = os.getenv("MODEL_NAME", "gpt-4")
    max_tokens: int = 4096
    temperature: float = 0.7
    
    # Agent Configuration
    max_iterations: int = 10  # Max ReAct loop iterations
    thought_timeout: int = 30  # Seconds
    
    # Browser Tool Configuration
    browser_headless: bool = True
    browser_timeout: int = 30000  # milliseconds
    
    # Artifact Storage
    artifacts_dir: str = "./artifacts_storage"
    max_artifact_size_mb: int = 10
    
    # CORS Configuration
    cors_origins: list = ["http://localhost:5173", "http://localhost:3000"]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
