"""
Base Agent - Core agent implementation with ReAct loop
Thought → Action → Observation → Repeat
"""

from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any, AsyncGenerator
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime
import uuid
import json
from loguru import logger

from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.tools import Toolkit

from config import settings


class StepType(str, Enum):
    """Types of steps in the ReAct loop"""
    THOUGHT = "thought"
    ACTION = "action"
    OBSERVATION = "observation"
    FINAL_ANSWER = "final_answer"
    ERROR = "error"


@dataclass
class ExecutionStep:
    """Represents a single step in the execution loop"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    type: StepType = StepType.THOUGHT
    content: str = ""
    tool_name: Optional[str] = None
    tool_input: Optional[Dict[str, Any]] = None
    tool_output: Optional[Any] = None
    timestamp: datetime = field(default_factory=datetime.now)
    duration_ms: Optional[int] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "type": self.type.value,
            "content": self.content,
            "tool_name": self.tool_name,
            "tool_input": self.tool_input,
            "tool_output": str(self.tool_output) if self.tool_output else None,
            "timestamp": self.timestamp.isoformat(),
            "duration_ms": self.duration_ms
        }


@dataclass
class Artifact:
    """Represents a deliverable artifact"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    type: str = "text"  # text, code, html, chart, table, document
    title: str = ""
    content: str = ""
    language: Optional[str] = None  # For code artifacts
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "type": self.type,
            "title": self.title,
            "content": self.content,
            "language": self.language,
            "metadata": self.metadata,
            "created_at": self.created_at.isoformat()
        }


@dataclass
class AgentResponse:
    """Complete response from an agent execution"""
    session_id: str
    success: bool
    message: str
    steps: List[ExecutionStep] = field(default_factory=list)
    artifacts: List[Artifact] = field(default_factory=list)
    total_duration_ms: int = 0
    iteration_count: int = 0
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "session_id": self.session_id,
            "success": self.success,
            "message": self.message,
            "steps": [step.to_dict() for step in self.steps],
            "artifacts": [artifact.to_dict() for artifact in self.artifacts],
            "total_duration_ms": self.total_duration_ms,
            "iteration_count": self.iteration_count
        }


class BaseAgent(ABC):
    """
    Base Agent class implementing the ReAct loop pattern.
    
    ReAct Loop:
    1. THOUGHT: Analyze the current state and plan next action
    2. ACTION: Execute a tool or generate content
    3. OBSERVATION: Observe the result of the action
    4. REPEAT: Continue until task is complete or max iterations
    """
    
    def __init__(
        self,
        name: str = "BaseAgent",
        description: str = "A general-purpose AI agent",
        tools: Optional[List[Toolkit]] = None,
        model_name: str = None,
        max_iterations: int = None
    ):
        self.name = name
        self.description = description
        self.tools = tools or []
        self.model_name = model_name or settings.model_name
        self.max_iterations = max_iterations or settings.max_iterations
        
        # Initialize the Agno agent
        self._init_agent()
        
        # Execution state
        self.current_session_id: Optional[str] = None
        self.execution_steps: List[ExecutionStep] = []
        self.artifacts: List[Artifact] = []
        
    def _init_agent(self):
        """Initialize the underlying Agno agent"""
        self.agent = Agent(
            name=self.name,
            model=OpenAIChat(id=self.model_name),
            tools=self.tools,
            description=self.description,
            instructions=self._get_system_instructions(),
            markdown=True
        )
    
    def _get_system_instructions(self) -> str:
        """Get the system instructions for the agent"""
        return f"""You are {self.name}, {self.description}.

You follow the ReAct (Reasoning and Acting) pattern to solve problems:

1. **THOUGHT**: Analyze the user's request and your current progress. Think step by step.
2. **ACTION**: Choose and execute the most appropriate tool or generate content.
3. **OBSERVATION**: Examine the results of your action.
4. **REPEAT**: Continue until the task is complete.

When creating deliverables (artifacts):
- Use <artifact type="..." title="...">content</artifact> tags
- Types: code, document, chart, table, html
- For code, include: <artifact type="code" language="python" title="Example Script">

Guidelines:
- Break complex tasks into smaller steps
- Use available tools effectively
- Provide clear explanations of your reasoning
- Create artifacts for any concrete deliverables
- If you encounter an error, explain and try alternative approaches
"""

    @abstractmethod
    async def get_tools(self) -> List[Toolkit]:
        """Return the list of tools available to this agent"""
        pass

    async def execute(
        self,
        user_message: str,
        session_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> AgentResponse:
        """
        Execute the agent with the given user message.
        Implements the full ReAct loop.
        """
        import time
        start_time = time.time()
        
        self.current_session_id = session_id or str(uuid.uuid4())
        self.execution_steps = []
        self.artifacts = []
        
        logger.info(f"🎯 Starting execution: {self.current_session_id}")
        logger.info(f"📝 User message: {user_message[:100]}...")
        
        try:
            # Run the agent
            response = await self._run_react_loop(user_message, context)
            
            end_time = time.time()
            duration_ms = int((end_time - start_time) * 1000)
            
            return AgentResponse(
                session_id=self.current_session_id,
                success=True,
                message=response,
                steps=self.execution_steps,
                artifacts=self.artifacts,
                total_duration_ms=duration_ms,
                iteration_count=len([s for s in self.execution_steps if s.type == StepType.ACTION])
            )
            
        except Exception as e:
            logger.error(f"❌ Execution error: {str(e)}")
            end_time = time.time()
            duration_ms = int((end_time - start_time) * 1000)
            
            self.execution_steps.append(ExecutionStep(
                type=StepType.ERROR,
                content=str(e)
            ))
            
            return AgentResponse(
                session_id=self.current_session_id,
                success=False,
                message=f"Error during execution: {str(e)}",
                steps=self.execution_steps,
                artifacts=self.artifacts,
                total_duration_ms=duration_ms,
                iteration_count=len([s for s in self.execution_steps if s.type == StepType.ACTION])
            )
    
    async def _run_react_loop(
        self,
        user_message: str,
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """Run the ReAct loop"""
        
        # Add initial thought step
        self.execution_steps.append(ExecutionStep(
            type=StepType.THOUGHT,
            content=f"Analyzing request: {user_message}"
        ))
        
        # Run the Agno agent
        response = self.agent.run(user_message)
        
        # Process the response and extract artifacts
        final_message = self._process_response(response.content)
        
        # Add final answer step
        self.execution_steps.append(ExecutionStep(
            type=StepType.FINAL_ANSWER,
            content=final_message
        ))
        
        return final_message
    
    def _process_response(self, response: str) -> str:
        """Process the agent response and extract artifacts"""
        import re
        
        # Extract artifacts from the response
        artifact_pattern = r'<artifact\s+type="([^"]+)"(?:\s+language="([^"]+)")?(?:\s+title="([^"]+)")?>(.*?)</artifact>'
        matches = re.findall(artifact_pattern, response, re.DOTALL)
        
        for match in matches:
            artifact_type, language, title, content = match
            artifact = Artifact(
                type=artifact_type,
                title=title or f"Artifact {len(self.artifacts) + 1}",
                content=content.strip(),
                language=language if language else None
            )
            self.artifacts.append(artifact)
            logger.info(f"📦 Created artifact: {artifact.title} ({artifact.type})")
        
        # Remove artifact tags from the response for the message
        clean_response = re.sub(artifact_pattern, '[Artifact created]', response, flags=re.DOTALL)
        
        return clean_response
    
    async def stream_execute(
        self,
        user_message: str,
        session_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Stream the agent execution, yielding updates as they happen.
        Useful for real-time UI updates.
        """
        import time
        start_time = time.time()
        
        self.current_session_id = session_id or str(uuid.uuid4())
        self.execution_steps = []
        self.artifacts = []
        
        # Yield start event
        yield {
            "type": "start",
            "session_id": self.current_session_id,
            "timestamp": datetime.now().isoformat()
        }
        
        # Yield thought step
        thought_step = ExecutionStep(
            type=StepType.THOUGHT,
            content=f"Analyzing request: {user_message}"
        )
        self.execution_steps.append(thought_step)
        yield {
            "type": "step",
            "step": thought_step.to_dict()
        }
        
        try:
            # Stream the agent response
            response_content = ""
            async for chunk in self._stream_agent_response(user_message):
                response_content += chunk
                yield {
                    "type": "token",
                    "content": chunk
                }
            
            # Process final response
            final_message = self._process_response(response_content)
            
            # Yield artifacts
            for artifact in self.artifacts:
                yield {
                    "type": "artifact",
                    "artifact": artifact.to_dict()
                }
            
            # Yield final step
            final_step = ExecutionStep(
                type=StepType.FINAL_ANSWER,
                content=final_message
            )
            self.execution_steps.append(final_step)
            yield {
                "type": "step",
                "step": final_step.to_dict()
            }
            
            # Yield complete event
            end_time = time.time()
            yield {
                "type": "complete",
                "session_id": self.current_session_id,
                "success": True,
                "total_duration_ms": int((end_time - start_time) * 1000)
            }
            
        except Exception as e:
            logger.error(f"❌ Stream execution error: {str(e)}")
            yield {
                "type": "error",
                "message": str(e)
            }
    
    async def _stream_agent_response(self, user_message: str) -> AsyncGenerator[str, None]:
        """Stream the agent's response tokens"""
        # Use Agno's streaming capability
        response_stream = self.agent.run(user_message, stream=True)
        for chunk in response_stream:
            if hasattr(chunk, 'content') and chunk.content:
                yield chunk.content

    def add_artifact(
        self,
        artifact_type: str,
        title: str,
        content: str,
        language: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Artifact:
        """Manually add an artifact"""
        artifact = Artifact(
            type=artifact_type,
            title=title,
            content=content,
            language=language,
            metadata=metadata or {}
        )
        self.artifacts.append(artifact)
        return artifact
