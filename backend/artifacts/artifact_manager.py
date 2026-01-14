"""
Artifact Manager - Handle creation, storage, and retrieval of artifacts
"""

from typing import Optional, Dict, Any, List
from dataclasses import dataclass, field
from datetime import datetime
import uuid
import os
import json
from loguru import logger

from config import settings


@dataclass
class ArtifactData:
    """Represents an artifact with all its data"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    type: str = "text"  # code, document, chart, table, html, image
    title: str = ""
    content: str = ""
    language: Optional[str] = None
    session_id: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "type": self.type,
            "title": self.title,
            "content": self.content,
            "language": self.language,
            "session_id": self.session_id,
            "metadata": self.metadata,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ArtifactData":
        return cls(
            id=data.get("id", str(uuid.uuid4())),
            type=data.get("type", "text"),
            title=data.get("title", ""),
            content=data.get("content", ""),
            language=data.get("language"),
            session_id=data.get("session_id"),
            metadata=data.get("metadata", {}),
            created_at=datetime.fromisoformat(data["created_at"]) if "created_at" in data else datetime.now(),
            updated_at=datetime.fromisoformat(data["updated_at"]) if "updated_at" in data else datetime.now()
        )


class ArtifactManager:
    """
    Manager for handling artifacts.
    
    Artifacts are concrete deliverables produced by the AI agent:
    - Code files
    - Documents
    - Charts and visualizations
    - Data tables
    - HTML content
    """
    
    def __init__(self, storage_dir: Optional[str] = None):
        self.storage_dir = storage_dir or settings.artifacts_dir
        self.artifacts: Dict[str, ArtifactData] = {}
        self._ensure_storage_dir()
    
    def _ensure_storage_dir(self):
        """Ensure the storage directory exists"""
        os.makedirs(self.storage_dir, exist_ok=True)
        logger.info(f"📁 Artifact storage: {self.storage_dir}")
    
    def create(
        self,
        artifact_type: str,
        title: str,
        content: str,
        language: Optional[str] = None,
        session_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> ArtifactData:
        """
        Create a new artifact.
        
        Args:
            artifact_type: Type of artifact (code, document, chart, etc.)
            title: Artifact title
            content: Artifact content
            language: Programming language (for code artifacts)
            session_id: Associated session ID
            metadata: Additional metadata
        
        Returns:
            Created artifact
        """
        artifact = ArtifactData(
            type=artifact_type,
            title=title,
            content=content,
            language=language,
            session_id=session_id,
            metadata=metadata or {}
        )
        
        self.artifacts[artifact.id] = artifact
        
        logger.info(f"📦 Created artifact: {artifact.title} ({artifact.type})")
        
        return artifact
    
    def get(self, artifact_id: str) -> Optional[ArtifactData]:
        """Get an artifact by ID"""
        return self.artifacts.get(artifact_id)
    
    def update(
        self,
        artifact_id: str,
        content: Optional[str] = None,
        title: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Optional[ArtifactData]:
        """Update an existing artifact"""
        if artifact_id not in self.artifacts:
            return None
        
        artifact = self.artifacts[artifact_id]
        
        if content is not None:
            artifact.content = content
        if title is not None:
            artifact.title = title
        if metadata is not None:
            artifact.metadata.update(metadata)
        
        artifact.updated_at = datetime.now()
        
        logger.info(f"✏️ Updated artifact: {artifact.title}")
        
        return artifact
    
    def delete(self, artifact_id: str) -> bool:
        """Delete an artifact"""
        if artifact_id in self.artifacts:
            artifact = self.artifacts[artifact_id]
            del self.artifacts[artifact_id]
            logger.info(f"🗑️ Deleted artifact: {artifact.title}")
            return True
        return False
    
    def list_all(self, session_id: Optional[str] = None) -> List[ArtifactData]:
        """List all artifacts, optionally filtered by session"""
        artifacts = list(self.artifacts.values())
        
        if session_id:
            artifacts = [a for a in artifacts if a.session_id == session_id]
        
        return sorted(artifacts, key=lambda a: a.created_at, reverse=True)
    
    def list_by_type(self, artifact_type: str) -> List[ArtifactData]:
        """List artifacts of a specific type"""
        return [a for a in self.artifacts.values() if a.type == artifact_type]
    
    def save_to_file(self, artifact_id: str) -> Optional[str]:
        """Save an artifact to a file"""
        artifact = self.get(artifact_id)
        if not artifact:
            return None
        
        # Determine file extension
        extensions = {
            "code": self._get_code_extension(artifact.language),
            "document": ".md",
            "html": ".html",
            "chart": ".json",
            "table": ".csv",
            "text": ".txt"
        }
        
        ext = extensions.get(artifact.type, ".txt")
        filename = f"{artifact.id}_{artifact.title.replace(' ', '_')}{ext}"
        filepath = os.path.join(self.storage_dir, filename)
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(artifact.content)
        
        logger.info(f"💾 Saved artifact to: {filepath}")
        
        return filepath
    
    def _get_code_extension(self, language: Optional[str]) -> str:
        """Get file extension for a programming language"""
        extensions = {
            "python": ".py",
            "javascript": ".js",
            "typescript": ".ts",
            "java": ".java",
            "cpp": ".cpp",
            "c": ".c",
            "csharp": ".cs",
            "go": ".go",
            "rust": ".rs",
            "ruby": ".rb",
            "php": ".php",
            "swift": ".swift",
            "kotlin": ".kt",
            "html": ".html",
            "css": ".css",
            "sql": ".sql",
            "shell": ".sh",
            "bash": ".sh",
            "powershell": ".ps1",
            "yaml": ".yaml",
            "json": ".json",
            "xml": ".xml"
        }
        
        return extensions.get(language.lower() if language else "", ".txt")
    
    def export_session(self, session_id: str) -> Dict[str, Any]:
        """Export all artifacts from a session"""
        artifacts = self.list_all(session_id)
        
        return {
            "session_id": session_id,
            "artifact_count": len(artifacts),
            "artifacts": [a.to_dict() for a in artifacts],
            "exported_at": datetime.now().isoformat()
        }
    
    def clear_session(self, session_id: str) -> int:
        """Clear all artifacts from a session"""
        artifacts_to_delete = [
            aid for aid, a in self.artifacts.items()
            if a.session_id == session_id
        ]
        
        for aid in artifacts_to_delete:
            del self.artifacts[aid]
        
        logger.info(f"🧹 Cleared {len(artifacts_to_delete)} artifacts from session {session_id}")
        
        return len(artifacts_to_delete)


# Global artifact manager instance
artifact_manager = ArtifactManager()
