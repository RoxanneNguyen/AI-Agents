"""
Document Tool - Document creation and editing capabilities
Supports Markdown, HTML, and structured documents
"""

from typing import Optional, Dict, Any, List
import json
import os
from datetime import datetime
from loguru import logger

from agno.tools import Toolkit, tool

from config import settings


class DocumentToolkit(Toolkit):
    """
    Document toolkit for creating and editing documents.
    
    Capabilities:
    - Create documents in various formats
    - Edit and format content
    - Generate reports
    - Export to different formats
    """
    
    def __init__(self):
        super().__init__(name="document")
        self.documents: Dict[str, Dict[str, Any]] = {}
        
        # Register tools
        self.register(self.create_document)
        self.register(self.edit_document)
        self.register(self.add_section)
        self.register(self.format_content)
        self.register(self.generate_table)
        self.register(self.get_document)
        self.register(self.list_documents)
        self.register(self.export_document)
        self.register(self.create_code_file)
    
    @tool(description="Create a new document with a title and optional initial content.")
    def create_document(
        self,
        title: str,
        content: str = "",
        doc_type: str = "markdown",
        template: Optional[str] = None
    ) -> str:
        """
        Create a new document.
        
        Args:
            title: Document title
            content: Initial content
            doc_type: Document type (markdown, html, text)
            template: Optional template (report, article, readme)
        
        Returns:
            Document creation confirmation
        """
        doc_id = f"doc_{len(self.documents) + 1}"
        
        # Apply template if specified
        if template:
            content = self._apply_template(template, title, content)
        
        document = {
            "id": doc_id,
            "title": title,
            "type": doc_type,
            "content": content,
            "sections": [],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "metadata": {}
        }
        
        self.documents[doc_id] = document
        
        logger.info(f"📝 Created document: {title} ({doc_id})")
        
        return json.dumps({
            "status": "created",
            "document_id": doc_id,
            "title": title,
            "type": doc_type,
            "preview": content[:500] if content else ""
        }, indent=2)
    
    def _apply_template(self, template: str, title: str, content: str) -> str:
        """Apply a template to the document"""
        templates = {
            "report": f"""# {title}

## Executive Summary

{content or "[Add executive summary here]"}

## Introduction

## Key Findings

## Analysis

## Recommendations

## Conclusion

---
*Report generated on {datetime.now().strftime('%Y-%m-%d')}*
""",
            "article": f"""# {title}

*By [Author Name] | {datetime.now().strftime('%B %d, %Y')}*

## Introduction

{content or "[Add introduction here]"}

## Main Content

## Conclusion

## References
""",
            "readme": f"""# {title}

{content or "[Project description]"}

## Installation

```bash
# Add installation instructions
```

## Usage

```
# Add usage examples
```

## Features

- Feature 1
- Feature 2
- Feature 3

## Contributing

## License
"""
        }
        
        return templates.get(template, content)
    
    @tool(description="Edit an existing document's content.")
    def edit_document(
        self,
        doc_id: str,
        new_content: Optional[str] = None,
        append: bool = False,
        replace_pattern: Optional[str] = None,
        replacement: Optional[str] = None
    ) -> str:
        """
        Edit a document.
        
        Args:
            doc_id: Document ID
            new_content: New content to set or append
            append: If True, append instead of replace
            replace_pattern: Pattern to find and replace
            replacement: Replacement text
        
        Returns:
            Edit confirmation
        """
        if doc_id not in self.documents:
            return json.dumps({"error": f"Document '{doc_id}' not found"})
        
        doc = self.documents[doc_id]
        
        try:
            if replace_pattern and replacement is not None:
                doc["content"] = doc["content"].replace(replace_pattern, replacement)
            elif new_content:
                if append:
                    doc["content"] += "\n" + new_content
                else:
                    doc["content"] = new_content
            
            doc["updated_at"] = datetime.now().isoformat()
            
            logger.info(f"✏️ Edited document: {doc_id}")
            
            return json.dumps({
                "status": "updated",
                "document_id": doc_id,
                "updated_at": doc["updated_at"],
                "content_length": len(doc["content"])
            }, indent=2)
            
        except Exception as e:
            return json.dumps({"error": str(e)})
    
    @tool(description="Add a section to a document.")
    def add_section(
        self,
        doc_id: str,
        heading: str,
        content: str,
        level: int = 2
    ) -> str:
        """
        Add a section to a document.
        
        Args:
            doc_id: Document ID
            heading: Section heading
            content: Section content
            level: Heading level (1-6)
        
        Returns:
            Confirmation of section addition
        """
        if doc_id not in self.documents:
            return json.dumps({"error": f"Document '{doc_id}' not found"})
        
        doc = self.documents[doc_id]
        
        # Create section in markdown format
        heading_prefix = "#" * min(max(level, 1), 6)
        section_content = f"\n\n{heading_prefix} {heading}\n\n{content}"
        
        doc["content"] += section_content
        doc["sections"].append({
            "heading": heading,
            "level": level,
            "content_length": len(content)
        })
        doc["updated_at"] = datetime.now().isoformat()
        
        return json.dumps({
            "status": "section_added",
            "document_id": doc_id,
            "section": heading,
            "total_sections": len(doc["sections"])
        }, indent=2)
    
    @tool(description="Format content with markdown styling.")
    def format_content(
        self,
        text: str,
        format_type: str,
        options: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Format content with specific styling.
        
        Args:
            text: Text to format
            format_type: Format type (bold, italic, code, quote, list, link)
            options: Additional options (e.g., language for code, url for link)
        
        Returns:
            Formatted text
        """
        options = options or {}
        
        formatters = {
            "bold": lambda t: f"**{t}**",
            "italic": lambda t: f"*{t}*",
            "code": lambda t: f"`{t}`",
            "code_block": lambda t: f"```{options.get('language', '')}\n{t}\n```",
            "quote": lambda t: "\n".join(f"> {line}" for line in t.split("\n")),
            "list": lambda t: "\n".join(f"- {item}" for item in t.split("\n") if item.strip()),
            "numbered_list": lambda t: "\n".join(f"{i+1}. {item}" for i, item in enumerate(t.split("\n")) if item.strip()),
            "link": lambda t: f"[{t}]({options.get('url', '#')})",
            "heading": lambda t: f"{'#' * options.get('level', 2)} {t}"
        }
        
        if format_type in formatters:
            formatted = formatters[format_type](text)
            return json.dumps({
                "original": text,
                "formatted": formatted,
                "format_type": format_type
            }, indent=2)
        else:
            return json.dumps({"error": f"Unknown format type: {format_type}"})
    
    @tool(description="Generate a markdown table from data.")
    def generate_table(
        self,
        headers: List[str],
        rows: List[List[Any]],
        alignment: Optional[List[str]] = None
    ) -> str:
        """
        Generate a markdown table.
        
        Args:
            headers: Column headers
            rows: Table rows (list of lists)
            alignment: Column alignment (left, center, right)
        
        Returns:
            Markdown table
        """
        # Default alignment
        if not alignment:
            alignment = ["left"] * len(headers)
        
        # Alignment markers
        align_markers = {
            "left": ":---",
            "center": ":---:",
            "right": "---:"
        }
        
        # Build table
        header_row = "| " + " | ".join(str(h) for h in headers) + " |"
        separator_row = "| " + " | ".join(align_markers.get(a, ":---") for a in alignment) + " |"
        
        data_rows = []
        for row in rows:
            data_rows.append("| " + " | ".join(str(cell) for cell in row) + " |")
        
        table = "\n".join([header_row, separator_row] + data_rows)
        
        return json.dumps({
            "table": table,
            "columns": len(headers),
            "rows": len(rows)
        }, indent=2)
    
    @tool(description="Get the content of a document.")
    def get_document(self, doc_id: str) -> str:
        """
        Get a document's full content.
        
        Args:
            doc_id: Document ID
        
        Returns:
            Document content and metadata
        """
        if doc_id not in self.documents:
            return json.dumps({"error": f"Document '{doc_id}' not found"})
        
        doc = self.documents[doc_id]
        return json.dumps(doc, indent=2)
    
    @tool(description="List all available documents.")
    def list_documents(self) -> str:
        """
        List all documents.
        
        Returns:
            List of document summaries
        """
        docs = []
        for doc_id, doc in self.documents.items():
            docs.append({
                "id": doc_id,
                "title": doc["title"],
                "type": doc["type"],
                "content_length": len(doc["content"]),
                "sections": len(doc["sections"]),
                "created_at": doc["created_at"],
                "updated_at": doc["updated_at"]
            })
        
        return json.dumps({
            "count": len(docs),
            "documents": docs
        }, indent=2)
    
    @tool(description="Export a document to a specific format.")
    def export_document(
        self,
        doc_id: str,
        format: str = "markdown",
        include_metadata: bool = False
    ) -> str:
        """
        Export a document.
        
        Args:
            doc_id: Document ID
            format: Export format (markdown, html, text)
            include_metadata: Include document metadata
        
        Returns:
            Exported document content
        """
        if doc_id not in self.documents:
            return json.dumps({"error": f"Document '{doc_id}' not found"})
        
        doc = self.documents[doc_id]
        content = doc["content"]
        
        if format == "html":
            import markdown
            content = markdown.markdown(content, extensions=['tables', 'fenced_code'])
            if include_metadata:
                content = f"""<!DOCTYPE html>
<html>
<head>
    <title>{doc['title']}</title>
    <meta name="created" content="{doc['created_at']}">
</head>
<body>
{content}
</body>
</html>"""
        
        elif format == "text":
            # Simple conversion - strip markdown
            import re
            content = re.sub(r'#{1,6}\s', '', content)  # Remove headings
            content = re.sub(r'\*\*([^*]+)\*\*', r'\1', content)  # Remove bold
            content = re.sub(r'\*([^*]+)\*', r'\1', content)  # Remove italic
        
        return json.dumps({
            "document_id": doc_id,
            "format": format,
            "content": content
        }, indent=2)
    
    @tool(description="Create a code file with syntax-highlighted content.")
    def create_code_file(
        self,
        filename: str,
        code: str,
        language: str,
        description: Optional[str] = None
    ) -> str:
        """
        Create a code file as an artifact.
        
        Args:
            filename: Name of the file
            code: The code content
            language: Programming language
            description: Optional description
        
        Returns:
            Code file creation confirmation
        """
        doc_id = f"code_{len(self.documents) + 1}"
        
        document = {
            "id": doc_id,
            "title": filename,
            "type": "code",
            "language": language,
            "content": code,
            "description": description,
            "sections": [],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "metadata": {
                "filename": filename,
                "language": language,
                "lines": len(code.split("\n"))
            }
        }
        
        self.documents[doc_id] = document
        
        logger.info(f"💻 Created code file: {filename}")
        
        return json.dumps({
            "status": "created",
            "document_id": doc_id,
            "filename": filename,
            "language": language,
            "lines": document["metadata"]["lines"],
            "code": code
        }, indent=2)
