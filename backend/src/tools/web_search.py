"""
Web search tools — DuckDuckGo (unlimited, free) and Tavily (1000/month free tier).
Now fully asynchronous to prevent blocking the event loop.
"""

from __future__ import annotations

import asyncio
from duckduckgo_search import DDGS
from config.settings import TAVILY_API_KEY
from src.utils.logger import get_logger

logger = get_logger("tools.web_search")


async def duckduckgo_search(query: str, max_results: int = 10) -> list[dict]:
    """
    Search via DuckDuckGo — completely free, no API key needed.
    Wraps the synchronous client in a thread to avoid blocking.
    """
    def _run_ddg():
        try:
            with DDGS() as ddgs:
                return list(ddgs.text(query, max_results=max_results))
        except Exception as e:
            logger.error(f"DuckDuckGo search failed (sync): {e}")
            return []

    try:
        results = await asyncio.to_thread(_run_ddg)
        return [
            {
                "title": r.get("title", ""),
                "url": r.get("href", ""),
                "snippet": r.get("body", ""),
            }
            for r in results
        ]
    except Exception as e:
        logger.error(f"DuckDuckGo search failed: {e}")
        return []


async def tavily_search(query: str, max_results: int = 5) -> list[dict]:
    """
    Search via Tavily — free tier: 1,000 searches/month.
    Wraps the synchronous client in a thread to avoid blocking.
    """
    if not TAVILY_API_KEY:
        logger.info("Tavily API key not set, skipping.")
        return []

    def _run_tavily():
        try:
            # Import inside function to avoid dependency issues if not installed
            from tavily import TavilyClient
            client = TavilyClient(api_key=TAVILY_API_KEY)
            return client.search(query=query, max_results=max_results)
        except ImportError:
            logger.warning("Tavily python package not installed.")
            return {}
        except Exception as e:
            logger.warning(f"Tavily search failed (sync): {e}")
            return {}

    try:
        response = await asyncio.to_thread(_run_tavily)
        return [
            {
                "title": r.get("title", ""),
                "url": r.get("url", ""),
                "snippet": r.get("content", ""),
                "score": r.get("score", 0),
            }
            for r in response.get("results", [])
        ]
    except Exception as e:
        logger.warning(f"Tavily search failed: {e}")
        return []
