"""
LLM provider abstraction — supports Groq (free tier) and Ollama (local).

Groq: 30 req/min, ~6,000 tokens/min on free tier. Fastest free inference.
Ollama: Unlimited (limited by local hardware). Requires running Ollama server.
"""

from __future__ import annotations

import json
import re
import httpx
from config.settings import (
    LLM_PROVIDER, GROQ_API_KEY, GROQ_MODEL,
    OLLAMA_BASE_URL, OLLAMA_MODEL,
)
from src.utils.logger import get_logger

logger = get_logger("llm.provider")


async def generate(
    prompt: str,
    *,
    system_prompt: str = "You are a helpful AI assistant.",
    temperature: float = 0.3,
    max_tokens: int = 1000,
    response_format: str = "text",  # "text" | "json"
) -> str:
    """
    Generate a response from the configured LLM provider.

    Args:
        prompt: The user prompt.
        system_prompt: System-level instructions.
        temperature: Creativity (0.0 = deterministic, 1.0 = creative).
        max_tokens: Maximum tokens in response.
        response_format: "text" or "json" (adds JSON instruction).

    Returns:
        The generated text response.
    """
    if response_format == "json":
        system_prompt += "\nYou MUST respond with valid JSON only. No markdown, no explanations."

    if LLM_PROVIDER == "groq":
        return await _generate_groq(prompt, system_prompt, temperature, max_tokens)
    elif LLM_PROVIDER == "ollama":
        return await _generate_ollama(prompt, system_prompt, temperature, max_tokens)
    else:
        raise ValueError(f"Unknown LLM_PROVIDER: {LLM_PROVIDER}")


async def _generate_groq(
    prompt: str, system_prompt: str, temperature: float, max_tokens: int
) -> str:
    """Generate via Groq free tier API (OpenAI-compatible)."""
    if not GROQ_API_KEY:
        raise ValueError(
            "GROQ_API_KEY not set. Get a free key at https://console.groq.com"
        )

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
        ],
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload,
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]


async def _generate_ollama(
    prompt: str, system_prompt: str, temperature: float, max_tokens: int
) -> str:
    """Generate via local Ollama server."""
    payload = {
        "model": OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
        ],
        "stream": False,
        "options": {
            "temperature": temperature,
            "num_predict": max_tokens,
        },
    }

    async with httpx.AsyncClient(timeout=120) as client:
        response = await client.post(
            f"{OLLAMA_BASE_URL}/api/chat",
            json=payload,
        )
        response.raise_for_status()
        data = response.json()
        return data["message"]["content"]


def parse_json_response(text: str) -> dict:
    """
    Extract and parse JSON from an LLM response.
    Handles cases where the model wraps JSON in markdown code blocks.
    """
    # Strip markdown code fences if present
    cleaned = text.strip()
    if cleaned.startswith("```"):
        # Remove opening fence (```json or ```)
        cleaned = re.sub(r"^```(?:json)?\s*\n?", "", cleaned)
        # Remove closing fence
        cleaned = re.sub(r"\n?```\s*$", "", cleaned)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # Try to find JSON object in the text
        match = re.search(r"\{[\s\S]*\}", cleaned)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass

        logger.warning(f"Failed to parse JSON from LLM response: {text[:200]}")
        return {}
