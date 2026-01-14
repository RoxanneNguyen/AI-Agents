"""
Browser Tool - Web browsing and research capabilities
Uses Playwright for browser automation
"""

from typing import Optional, Dict, Any, List
from dataclasses import dataclass
import asyncio
import json
from loguru import logger

from agno.tools import Toolkit, tool

from config import settings


@dataclass
class SearchResult:
    """Represents a search result"""
    title: str
    url: str
    snippet: str


@dataclass
class PageContent:
    """Represents extracted page content"""
    url: str
    title: str
    content: str
    links: List[Dict[str, str]]
    metadata: Dict[str, Any]


class BrowserToolkit(Toolkit):
    """
    Browser toolkit for web browsing and research.
    
    Capabilities:
    - Web search
    - Page navigation and content extraction
    - Screenshot capture
    - Form interaction
    """
    
    def __init__(self):
        super().__init__(name="browser")
        self.browser = None
        self.context = None
        self.page = None
        
        # Register tools
        self.register(self.web_search)
        self.register(self.visit_page)
        self.register(self.extract_content)
        self.register(self.take_screenshot)
        self.register(self.click_element)
        self.register(self.fill_form)
        self.register(self.get_page_links)
    
    async def _ensure_browser(self):
        """Ensure browser is initialized"""
        if self.browser is None:
            try:
                from playwright.async_api import async_playwright
                self.playwright = await async_playwright().start()
                self.browser = await self.playwright.chromium.launch(
                    headless=settings.browser_headless
                )
                self.context = await self.browser.new_context(
                    viewport={"width": 1280, "height": 720},
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                )
                self.page = await self.context.new_page()
                logger.info("🌐 Browser initialized")
            except Exception as e:
                logger.error(f"Failed to initialize browser: {e}")
                raise
    
    async def _close_browser(self):
        """Close the browser"""
        if self.browser:
            await self.browser.close()
            await self.playwright.stop()
            self.browser = None
            self.context = None
            self.page = None
    
    @tool(description="Search the web for information. Returns a list of search results with titles, URLs, and snippets.")
    def web_search(self, query: str, num_results: int = 5) -> str:
        """
        Search the web for information.
        
        Args:
            query: The search query
            num_results: Number of results to return (default 5)
        
        Returns:
            JSON string of search results
        """
        try:
            from duckduckgo_search import DDGS
            
            results = list(DDGS().text(keywords=query, max_results=num_results))
            
            logger.info(f"🔍 Search returned {len(results)} results for: {query}")
            return json.dumps({"query": query, "results": results}, indent=2)
            
        except Exception as e:
            logger.error(f"Search error: {e}")
            return json.dumps({"error": str(e), "query": query})
    
    @tool(description="Visit a web page and return its content. Use this to read articles, documentation, or any web content.")
    def visit_page(self, url: str) -> str:
        """
        Visit a web page and extract its content.
        
        Args:
            url: The URL to visit
        
        Returns:
            The page content as text
        """
        import httpx
        from bs4 import BeautifulSoup
        
        try:
            response = httpx.get(
                url,
                timeout=settings.browser_timeout / 1000,
                follow_redirects=True,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                }
            )
            
            soup = BeautifulSoup(response.text, "html.parser")
            
            # Remove script and style elements
            for element in soup(["script", "style", "nav", "footer", "header"]):
                element.decompose()
            
            # Get title
            title = soup.title.string if soup.title else "No title"
            
            # Get main content
            main_content = soup.find("main") or soup.find("article") or soup.find("body")
            text = main_content.get_text(separator="\n", strip=True) if main_content else ""
            
            # Truncate if too long
            if len(text) > 10000:
                text = text[:10000] + "\n...[Content truncated]"
            
            result = {
                "url": url,
                "title": title,
                "content": text,
                "status": response.status_code
            }
            
            logger.info(f"📄 Visited page: {url}")
            return json.dumps(result, indent=2)
            
        except Exception as e:
            logger.error(f"Error visiting {url}: {e}")
            return json.dumps({"error": str(e), "url": url})
    
    @tool(description="Extract specific content from the current page using CSS selectors or text patterns.")
    def extract_content(self, url: str, selector: Optional[str] = None) -> str:
        """
        Extract content from a page using selectors.
        
        Args:
            url: The URL to extract from
            selector: CSS selector to extract specific elements (optional)
        
        Returns:
            Extracted content
        """
        import httpx
        from bs4 import BeautifulSoup
        
        try:
            response = httpx.get(url, timeout=10, follow_redirects=True)
            soup = BeautifulSoup(response.text, "html.parser")
            
            if selector:
                elements = soup.select(selector)
                content = [el.get_text(strip=True) for el in elements]
            else:
                content = soup.get_text(separator="\n", strip=True)
            
            return json.dumps({
                "url": url,
                "selector": selector,
                "content": content
            }, indent=2)
            
        except Exception as e:
            return json.dumps({"error": str(e)})
    
    @tool(description="Take a screenshot of a web page. Returns the screenshot as base64.")
    def take_screenshot(self, url: str) -> str:
        """
        Take a screenshot of a web page.
        
        Args:
            url: The URL to screenshot
        
        Returns:
            Base64 encoded screenshot
        """
        # For synchronous use, we'll use a placeholder
        # In production, this would use Playwright async
        return json.dumps({
            "url": url,
            "message": "Screenshot capability requires async browser. Use visit_page for content.",
            "status": "not_available_in_sync_mode"
        })
    
    @tool(description="Click on an element on the current page using a CSS selector.")
    def click_element(self, selector: str) -> str:
        """
        Click on a page element.
        
        Args:
            selector: CSS selector for the element to click
        
        Returns:
            Result of the click action
        """
        return json.dumps({
            "selector": selector,
            "message": "Click action requires active browser session",
            "status": "use_async_mode"
        })
    
    @tool(description="Fill a form field on the current page.")
    def fill_form(self, selector: str, value: str) -> str:
        """
        Fill a form field.
        
        Args:
            selector: CSS selector for the form field
            value: Value to fill
        
        Returns:
            Result of the fill action
        """
        return json.dumps({
            "selector": selector,
            "value": value,
            "message": "Form fill requires active browser session",
            "status": "use_async_mode"
        })
    
    @tool(description="Get all links from a web page.")
    def get_page_links(self, url: str, filter_pattern: Optional[str] = None) -> str:
        """
        Get all links from a web page.
        
        Args:
            url: The URL to extract links from
            filter_pattern: Optional regex pattern to filter links
        
        Returns:
            List of links found on the page
        """
        import httpx
        from bs4 import BeautifulSoup
        import re
        from urllib.parse import urljoin
        
        try:
            response = httpx.get(url, timeout=10, follow_redirects=True)
            soup = BeautifulSoup(response.text, "html.parser")
            
            links = []
            for a in soup.find_all("a", href=True):
                href = a["href"]
                text = a.get_text(strip=True)
                
                # Make absolute URL
                absolute_url = urljoin(url, href)
                
                # Apply filter if provided
                if filter_pattern:
                    if not re.search(filter_pattern, absolute_url):
                        continue
                
                links.append({
                    "text": text[:100] if text else "",
                    "url": absolute_url
                })
            
            # Remove duplicates
            seen = set()
            unique_links = []
            for link in links:
                if link["url"] not in seen:
                    seen.add(link["url"])
                    unique_links.append(link)
            
            logger.info(f"🔗 Found {len(unique_links)} links on {url}")
            return json.dumps({
                "url": url,
                "link_count": len(unique_links),
                "links": unique_links[:50]  # Limit to 50 links
            }, indent=2)
            
        except Exception as e:
            return json.dumps({"error": str(e), "url": url})
