"""
Web scraper — aiohttp + BeautifulSoup for lightweight scraping.
Extracts text, metadata, and detects tech stack from HTML source.
"""

from __future__ import annotations

import re
import aiohttp
from bs4 import BeautifulSoup
from src.utils.logger import get_logger

logger = get_logger("tools.web_scraper")

# Known tech patterns to detect in HTML source
TECH_PATTERNS: dict[str, list[str]] = {
    "React": [r"react", r"__next", r"_react"],
    "Vue.js": [r"vue", r"__vue"],
    "Angular": [r"ng-", r"angular"],
    "Next.js": [r"__next", r"_next"],
    "WordPress": [r"wp-content", r"wordpress"],
    "Shopify": [r"shopify", r"cdn\.shopify"],
    "Django": [r"csrfmiddlewaretoken", r"django"],
    "Ruby on Rails": [r"rails", r"csrf-token"],
    "AWS": [r"amazonaws", r"aws"],
    "Google Cloud": [r"googleapis", r"gcloud"],
    "Stripe": [r"stripe\.com", r"stripe\.js"],
    "HubSpot": [r"hubspot", r"hs-scripts"],
    "Segment": [r"segment\.com", r"analytics\.js"],
    "Intercom": [r"intercom", r"intercomSettings"],
    "Tailwind CSS": [r"tailwindcss", r"tailwind"],
    "Bootstrap": [r"bootstrap"],
}


async def scrape_website(url: str, timeout: int = 15) -> dict:
    """
    Scrape a website and return cleaned text, metadata, and raw HTML.

    Returns:
        {
            "text": str,       # Clean text content (truncated)
            "meta": dict,      # Meta tags extracted
            "title": str,      # Page title
            "html": str,       # Raw HTML (for tech detection)
        }
    """
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        )
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                url, headers=headers, timeout=aiohttp.ClientTimeout(total=timeout),
                ssl=False,
            ) as response:
                html = await response.text()
    except Exception as e:
        logger.warning(f"Failed to scrape {url}: {e}")
        return {"text": "", "meta": {}, "title": "", "html": ""}

    soup = BeautifulSoup(html, "html.parser")

    # Remove noise elements
    for tag in soup(["script", "style", "nav", "footer", "header", "aside", "noscript"]):
        tag.decompose()

    # Extract clean text
    text = soup.get_text(separator="\n", strip=True)
    # Collapse multi-newlines
    text = re.sub(r"\n{3,}", "\n\n", text)

    # Extract metadata
    meta = {}
    for tag in soup.find_all("meta"):
        name = tag.get("name") or tag.get("property", "")
        content = tag.get("content", "")
        if name and content:
            meta[name] = content

    title = soup.title.string.strip() if soup.title and soup.title.string else ""

    return {
        "text": text[:8000],  # Cap to avoid token overflow
        "meta": meta,
        "title": title,
        "html": html,
    }


def detect_tech_stack(html: str) -> list[str]:
    """Detect technologies from HTML source using pattern matching."""
    if not html:
        return []

    html_lower = html.lower()
    detected = []

    for tech, patterns in TECH_PATTERNS.items():
        if any(re.search(p, html_lower) for p in patterns):
            detected.append(tech)

    return detected


def parse_job_listings(text: str) -> list[str]:
    """Extract job title-like strings from careers page text."""
    if not text:
        return []

    # Common job title patterns
    lines = text.split("\n")
    jobs = []
    job_keywords = [
        "engineer", "developer", "manager", "designer", "analyst",
        "director", "lead", "architect", "scientist", "coordinator",
        "specialist", "consultant", "intern", "head of", "vp ",
    ]

    for line in lines:
        line = line.strip()
        if 10 < len(line) < 80:  # Reasonable title length
            if any(kw in line.lower() for kw in job_keywords):
                jobs.append(line)

    return jobs[:15]  # Cap at 15 positions
