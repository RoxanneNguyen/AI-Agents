"""
API module initialization
"""

from api.routes import router
from api.websocket import router as ws_router

__all__ = ["router", "ws_router"]
