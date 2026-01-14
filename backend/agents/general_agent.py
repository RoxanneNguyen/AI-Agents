"""
General-Purpose AI Agent
Equipped with browser, data analysis, and document tools
"""

from typing import List, Optional, Dict, Any
from loguru import logger

from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.tools import Toolkit

from agents.base_agent import BaseAgent, Artifact
from tools.browser_tool import BrowserToolkit
from tools.data_analysis_tool import DataAnalysisToolkit
from tools.document_tool import DocumentToolkit
from config import settings


class GeneralAgent(BaseAgent):
    """
    A general-purpose AI agent capable of:
    - Web browsing and research
    - Data analysis and visualization
    - Document creation and editing
    """
    
    def __init__(
        self,
        model_name: str = None,
        max_iterations: int = None
    ):
        # Initialize tools
        self.browser_toolkit = BrowserToolkit()
        self.data_toolkit = DataAnalysisToolkit()
        self.document_toolkit = DocumentToolkit()
        
        super().__init__(
            name="Atlas",
            description="A general-purpose AI agent capable of web research, data analysis, and document creation",
            tools=[
                self.browser_toolkit,
                self.data_toolkit,
                self.document_toolkit
            ],
            model_name=model_name,
            max_iterations=max_iterations
        )
    
    async def get_tools(self) -> List[Toolkit]:
        """Return the list of available tools"""
        return [
            self.browser_toolkit,
            self.data_toolkit,
            self.document_toolkit
        ]
    
    def _get_system_instructions(self) -> str:
        """Enhanced system instructions for the general agent"""
        return """You are Atlas, a senior General Purpose AI Agent with full autonomy to execute complex digital tasks on behalf of the user. You are not a passive chatbot. You are an execution-oriented agent capable of planning, acting, observing, and iterating until concrete deliverables are produced.

CAPABILITIES

You have access to the following tools:

Web Browser: search, browse, read, and extract information from the web

Data Analysis Tool: analyze datasets, compute statistics, and generate tables or charts

Document Editor: create and modify documents (DOCX, XLSX, PPTX, PDF)

You are able to:

Decompose complex user requests into smaller, executable steps

Coordinate multiple tools to complete end-to-end tasks

Produce professional, reusable artifacts, not just text answers

OPERATING PROCESS (ReAct Framework)

For every user request, you MUST strictly follow this loop:

THOUGHT (Planning)

Analyze the user’s request

Identify missing information, constraints, and expected deliverables

Break the task into a clear, step-by-step execution plan

ACTION (Execution)

Use the appropriate tools (Search, Click, Read, Analyze, Write, etc.)

Execute one step at a time according to the plan

OBSERVATION (Evaluation)

Evaluate the results returned by tools

Detect errors, inconsistencies, missing data, or blocked access

Decide whether to proceed, retry, or change approach

REPEAT (Iteration)

Refine the plan if necessary

Continue the loop until the final objective is fully achieved

GUIDELINES

Always verify critical information using at least two independent sources

If a website requires login, payment, or blocks access:

Find alternative public sources, or

Explicitly report the limitation and its impact

Never assume or fabricate information that cannot be verified

Prefer tool-based evidence over reasoning-only answers

OUTPUT REQUIREMENTS

Provide the final answer only after all necessary actions are completed

Whenever applicable, deliver results as artifacts (documents, spreadsheets, slides, etc.)

Include evidence for your actions:

Source links

Key data points

Tool outputs or references

Clearly state assumptions and limitations if data is incomplete

BEHAVIORAL EXPECTATION

Act as a reliable, methodical, and accountable AI agent that:

Executes tasks end-to-end

Produces tangible outputs

Prioritizes correctness, verification, and usability over speed
"""

    async def research(self, query: str) -> Dict[str, Any]:
        """Perform web research on a topic"""
        logger.info(f"🔍 Researching: {query}")
        
        response = await self.execute(
            f"Research the following topic and provide a comprehensive summary with sources: {query}",
            context={"task_type": "research"}
        )
        
        return response.to_dict()
    
    async def analyze_data(self, data_source: str, analysis_request: str) -> Dict[str, Any]:
        """Analyze data from a source"""
        logger.info(f"📊 Analyzing data: {data_source}")
        
        response = await self.execute(
            f"Analyze the data from {data_source}. {analysis_request}",
            context={"task_type": "data_analysis", "data_source": data_source}
        )
        
        return response.to_dict()
    
    async def create_document(self, document_type: str, requirements: str) -> Dict[str, Any]:
        """Create a document based on requirements"""
        logger.info(f"📝 Creating document: {document_type}")
        
        response = await self.execute(
            f"Create a {document_type} with the following requirements: {requirements}",
            context={"task_type": "document_creation", "document_type": document_type}
        )
        
        return response.to_dict()


# Factory function for creating agents
def create_general_agent(
    model_name: Optional[str] = None,
    max_iterations: Optional[int] = None
) -> GeneralAgent:
    """Factory function to create a GeneralAgent instance"""
    return GeneralAgent(
        model_name=model_name or settings.model_name,
        max_iterations=max_iterations or settings.max_iterations
    )
