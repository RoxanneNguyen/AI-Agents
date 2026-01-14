"""
WebSocket API - Real-time communication for streaming agent responses
"""

from typing import Optional, Dict, Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from loguru import logger
import json
import asyncio
import uuid

from agents import create_general_agent

router = APIRouter()


class ConnectionManager:
    """Manage WebSocket connections"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.agents: Dict[str, Any] = {}
    
    async def connect(self, websocket: WebSocket, session_id: str):
        """Accept and store a WebSocket connection"""
        await websocket.accept()
        self.active_connections[session_id] = websocket
        self.agents[session_id] = create_general_agent()
        logger.info(f"🔌 WebSocket connected: {session_id}")
    
    def disconnect(self, session_id: str):
        """Remove a WebSocket connection"""
        if session_id in self.active_connections:
            del self.active_connections[session_id]
        if session_id in self.agents:
            del self.agents[session_id]
        logger.info(f"🔌 WebSocket disconnected: {session_id}")
    
    async def send_message(self, session_id: str, message: Dict[str, Any]):
        """Send a message to a specific connection"""
        if session_id in self.active_connections:
            await self.active_connections[session_id].send_json(message)
    
    async def broadcast(self, message: Dict[str, Any]):
        """Broadcast message to all connections"""
        for connection in self.active_connections.values():
            await connection.send_json(message)


manager = ConnectionManager()


@router.websocket("/chat/{session_id}")
async def websocket_chat(websocket: WebSocket, session_id: Optional[str] = None):
    """
    WebSocket endpoint for real-time chat with the AI agent.
    
    Message format (incoming):
    {
        "type": "message",
        "content": "User message here"
    }
    
    Response format (outgoing):
    {
        "type": "start" | "step" | "token" | "artifact" | "complete" | "error",
        "data": {...}
    }
    """
    session_id = session_id or str(uuid.uuid4())
    
    await manager.connect(websocket, session_id)
    
    try:
        # Send session info
        await manager.send_message(session_id, {
            "type": "connected",
            "session_id": session_id,
            "agent_name": manager.agents[session_id].name
        })
        
        while True:
            # Receive message
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
            except json.JSONDecodeError:
                await manager.send_message(session_id, {
                    "type": "error",
                    "message": "Invalid JSON format"
                })
                continue
            
            msg_type = message.get("type", "message")
            
            if msg_type == "message":
                content = message.get("content", "")
                
                if not content:
                    await manager.send_message(session_id, {
                        "type": "error",
                        "message": "Empty message"
                    })
                    continue
                
                logger.info(f"💬 WS Message [{session_id}]: {content[:50]}...")
                
                # Stream the agent response
                agent = manager.agents[session_id]
                
                try:
                    async for event in agent.stream_execute(content, session_id):
                        await manager.send_message(session_id, {
                            "type": event["type"],
                            "data": event
                        })
                        
                except Exception as e:
                    logger.error(f"Agent error: {e}")
                    await manager.send_message(session_id, {
                        "type": "error",
                        "message": str(e)
                    })
            
            elif msg_type == "ping":
                await manager.send_message(session_id, {
                    "type": "pong",
                    "timestamp": message.get("timestamp")
                })
            
            elif msg_type == "cancel":
                # Handle cancellation (future implementation)
                await manager.send_message(session_id, {
                    "type": "cancelled",
                    "message": "Operation cancelled"
                })
    
    except WebSocketDisconnect:
        manager.disconnect(session_id)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(session_id)


@router.websocket("/stream")
async def websocket_stream(websocket: WebSocket):
    """
    General streaming endpoint for server-side events.
    Useful for monitoring agent activity across sessions.
    """
    await websocket.accept()
    
    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "subscribe":
                # Subscribe to events
                await websocket.send_json({
                    "type": "subscribed",
                    "topics": message.get("topics", [])
                })
            
            elif message.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
    
    except WebSocketDisconnect:
        logger.info("Stream WebSocket disconnected")
    except Exception as e:
        logger.error(f"Stream error: {e}")
