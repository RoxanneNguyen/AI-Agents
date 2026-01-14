"""
API Routes - REST endpoints for the AI Agents Platform
"""

from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from datetime import datetime
import uuid
from loguru import logger

from agents import GeneralAgent, create_general_agent, AgentResponse

router = APIRouter()

# Store active sessions
sessions: Dict[str, Dict[str, Any]] = {}

# Create a shared agent instance
agent = create_general_agent()


# Request/Response Models
class ChatMessage(BaseModel):
    """Chat message from user"""
    content: str = Field(..., min_length=1, max_length=10000)
    session_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    """Response from the agent"""
    session_id: str
    message: str
    success: bool
    artifacts: List[Dict[str, Any]] = []
    steps: List[Dict[str, Any]] = []
    duration_ms: int = 0


class SessionInfo(BaseModel):
    """Session information"""
    session_id: str
    created_at: str
    message_count: int
    last_activity: str


class ArtifactResponse(BaseModel):
    """Artifact data"""
    id: str
    type: str
    title: str
    content: str
    language: Optional[str] = None
    created_at: str


# Endpoints

@router.post("/chat", response_model=ChatResponse)
async def chat(message: ChatMessage) -> ChatResponse:
    """
    Send a message to the AI agent and get a response.
    
    The agent will:
    1. Analyze the message
    2. Execute the ReAct loop (Thought → Action → Observation)
    3. Return a response with any generated artifacts
    """
    session_id = message.session_id or str(uuid.uuid4())
    
    logger.info(f"💬 Chat request - Session: {session_id}")
    logger.info(f"📝 Message: {message.content[:100]}...")
    
    try:
        # Initialize session if new
        if session_id not in sessions:
            sessions[session_id] = {
                "id": session_id,
                "created_at": datetime.now().isoformat(),
                "messages": [],
                "artifacts": []
            }
        
        # Add user message to history
        sessions[session_id]["messages"].append({
            "role": "user",
            "content": message.content,
            "timestamp": datetime.now().isoformat()
        })
        
        # Execute the agent
        response: AgentResponse = await agent.execute(
            user_message=message.content,
            session_id=session_id,
            context=message.context
        )
        
        # Add assistant message to history
        sessions[session_id]["messages"].append({
            "role": "assistant",
            "content": response.message,
            "timestamp": datetime.now().isoformat()
        })
        
        # Store artifacts
        for artifact in response.artifacts:
            sessions[session_id]["artifacts"].append(artifact.to_dict())
        
        sessions[session_id]["last_activity"] = datetime.now().isoformat()
        
        return ChatResponse(
            session_id=session_id,
            message=response.message,
            success=response.success,
            artifacts=[a.to_dict() for a in response.artifacts],
            steps=[s.to_dict() for s in response.steps],
            duration_ms=response.total_duration_ms
        )
        
    except Exception as e:
        logger.error(f"❌ Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sessions")
async def list_sessions() -> List[SessionInfo]:
    """List all active sessions"""
    return [
        SessionInfo(
            session_id=s["id"],
            created_at=s["created_at"],
            message_count=len(s["messages"]),
            last_activity=s.get("last_activity", s["created_at"])
        )
        for s in sessions.values()
    ]


@router.get("/sessions/{session_id}")
async def get_session(session_id: str) -> Dict[str, Any]:
    """Get session details including message history"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return sessions[session_id]


@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str) -> Dict[str, str]:
    """Delete a session"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    del sessions[session_id]
    return {"status": "deleted", "session_id": session_id}


@router.get("/sessions/{session_id}/artifacts")
async def get_session_artifacts(session_id: str) -> List[Dict[str, Any]]:
    """Get all artifacts from a session"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return sessions[session_id].get("artifacts", [])


@router.get("/sessions/{session_id}/artifacts/{artifact_id}")
async def get_artifact(session_id: str, artifact_id: str) -> Dict[str, Any]:
    """Get a specific artifact"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    artifacts = sessions[session_id].get("artifacts", [])
    for artifact in artifacts:
        if artifact["id"] == artifact_id:
            return artifact
    
    raise HTTPException(status_code=404, detail="Artifact not found")


@router.get("/tools")
async def list_tools() -> Dict[str, Any]:
    """List available tools and their descriptions"""
    tools = await agent.get_tools()
    
    tool_info = []
    for toolkit in tools:
        tool_info.append({
            "name": toolkit.name,
            "functions": [
                {
                    "name": name,
                    "description": func.__doc__ or ""
                }
                for name, func in toolkit.functions.items()
            ] if hasattr(toolkit, 'functions') else []
        })
    
    return {
        "agent_name": agent.name,
        "tools": tool_info
    }


@router.post("/research")
async def research(query: str) -> Dict[str, Any]:
    """Quick research endpoint"""
    logger.info(f"🔍 Research request: {query}")
    
    return await agent.research(query)


@router.post("/analyze")
async def analyze(data_source: str, request: str) -> Dict[str, Any]:
    """Quick data analysis endpoint"""
    logger.info(f"📊 Analysis request: {data_source}")
    
    return await agent.analyze_data(data_source, request)


@router.post("/document")
async def create_document(doc_type: str, requirements: str) -> Dict[str, Any]:
    """Quick document creation endpoint"""
    logger.info(f"📝 Document request: {doc_type}")
    
    return await agent.create_document(doc_type, requirements)
