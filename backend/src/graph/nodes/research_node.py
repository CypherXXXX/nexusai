from __future__ import annotations

from datetime import datetime, timezone

from src.models.lead_state import LeadState
from src.tools.web_scraper import scrape_website, detect_tech_stack, parse_job_listings
from src.tools.web_search import duckduckgo_search, tavily_search
from src.utils.logger import get_logger

logger = get_logger("graph.research")


async def research_node(state: LeadState) -> dict:
    company = state.get("company_name", "Unknown")
    website = state.get("company_website", "")
    logger.info(f"Researching: {company} ({website})")

    updates: dict = {
        "status": "enriching",
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    if website:
        try:
            scraped = await scrape_website(website)
            if scraped["text"]:
                updates["website_content"] = scraped["text"]
                updates["tech_stack"] = detect_tech_stack(scraped["html"])
                logger.info(f"Scraped {website}: {len(scraped['text'])} chars")

            for subpage in ["/about", "/contact", "/team", "/about-us", "/contact-us"]:
                try:
                    page = await scrape_website(f"{website.rstrip('/')}{subpage}")
                    if page["text"] and len(page["text"]) > 80:
                        existing = updates.get("website_content", "")
                        updates["website_content"] = (
                            existing + f"\n\n=== {subpage.upper()} PAGE ===\n" + page["text"]
                        )[:12000]
                except Exception:
                    pass

            try:
                careers = await scrape_website(f"{website.rstrip('/')}/careers")
                if careers["text"]:
                    jobs = parse_job_listings(careers["text"])
                    if jobs:
                        updates["open_positions"] = jobs
                        logger.info(f"Found {len(jobs)} job listings")
            except Exception:
                pass
        except Exception as e:
            logger.warning(f"Website scrape failed for {website}: {e}")

    try:
        search_results = await duckduckgo_search(
            query=f"{company} company overview products services what does {company} do",
            max_results=10,
        )
        if search_results:
            updates["search_results"] = search_results
            logger.info(f"DDG overview: {len(search_results)} results for {company}")
    except Exception as e:
        logger.warning(f"DuckDuckGo overview search failed: {e}")

    try:
        leadership_results = await duckduckgo_search(
            query=f"{company} CEO founder CTO leadership team LinkedIn executive",
            max_results=8,
        )
        if leadership_results:
            existing = updates.get("search_results", [])
            updates["search_results"] = existing + leadership_results
            logger.info(f"DDG leadership: {len(leadership_results)} results")
    except Exception as e:
        logger.warning(f"Leadership search failed: {e}")

    try:
        hr_results = await duckduckgo_search(
            query=f"{company} HR email human resources careers@ jobs@ recruitment contact email",
            max_results=5,
        )
        if hr_results:
            existing = updates.get("search_results", [])
            updates["search_results"] = existing + hr_results
            logger.info(f"DDG HR email: {len(hr_results)} results")
    except Exception as e:
        logger.warning(f"HR email search failed: {e}")

    try:
        email_results = await duckduckgo_search(
            query=f"{company} contact email address info@ hello@ hr@",
            max_results=5,
        )
        if email_results:
            existing = updates.get("search_results", [])
            updates["search_results"] = existing + email_results
    except Exception as e:
        logger.warning(f"Email search failed: {e}")

    try:
        linkedin_results = await duckduckgo_search(
            query=f"site:linkedin.com/company {company}",
            max_results=3,
        )
        if linkedin_results:
            existing = updates.get("search_results", [])
            updates["search_results"] = existing + linkedin_results
            logger.info(f"DDG LinkedIn: {len(linkedin_results)} results")
    except Exception as e:
        logger.warning(f"LinkedIn search failed: {e}")

    try:
        size_results = await duckduckgo_search(
            query=f"{company} employees revenue funding valuation crunchbase",
            max_results=5,
        )
        if size_results:
            existing = updates.get("search_results", [])
            updates["search_results"] = existing + size_results
            logger.info(f"DDG company size: {len(size_results)} results")
    except Exception as e:
        logger.warning(f"Company size search failed: {e}")

    try:
        news_results = await duckduckgo_search(
            query=f"{company} latest news funding announcement 2024 2025",
            max_results=8,
        )
        if news_results:
            structured_news = []
            for n in news_results[:5]:
                structured_news.append({
                    "title": n.get("title", ""),
                    "url": n.get("url", ""),
                    "snippet": n.get("snippet", ""),
                    "source": _extract_domain(n.get("url", "")),
                })
            updates["recent_news"] = structured_news
            logger.info(f"DDG news: {len(structured_news)} articles found")
    except Exception as e:
        logger.warning(f"News search failed: {e}")

    if not updates.get("search_results"):
        try:
            tavily_results = await tavily_search(
                query=f"{company} company overview CEO HR contact email", max_results=8
            )
            if tavily_results:
                updates["search_results"] = tavily_results
                logger.info(f"Tavily: {len(tavily_results)} results")
        except Exception as e:
            logger.warning(f"Tavily search failed: {e}")

    updates.setdefault("website_content", "")
    updates.setdefault("search_results", [])
    updates.setdefault("tech_stack", [])
    updates.setdefault("open_positions", [])
    updates.setdefault("recent_news", [])

    logger.info(f"Research complete for {company}")
    return updates


def _extract_domain(url: str) -> str:
    try:
        from urllib.parse import urlparse
        parsed = urlparse(url)
        domain = parsed.netloc.replace("www.", "")
        return domain
    except Exception:
        return ""
