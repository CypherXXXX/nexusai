"""
Application settings loaded from environment variables with sensible defaults.
"""

import os
import yaml
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend root
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

# ----- Paths -----
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
LEADS_DIR = DATA_DIR / "leads"

# Ensure data dirs exist
DATA_DIR.mkdir(exist_ok=True)
LEADS_DIR.mkdir(exist_ok=True)

# ----- LLM -----
LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "groq")  # "groq" | "ollama"
GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "qwen2.5:7b")

# ----- Web Search -----
TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "")

# ----- Email -----
GMAIL_ADDRESS: str = os.getenv("GMAIL_ADDRESS", "")
GMAIL_APP_PASSWORD: str = os.getenv("GMAIL_APP_PASSWORD", "")

# ----- Database -----
DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    f"sqlite+aiosqlite:///{DATA_DIR / 'salesforce_autopilot.db'}",
)

# ----- Scoring -----
QUALIFICATION_THRESHOLD: int = int(os.getenv("QUALIFICATION_THRESHOLD", "70"))
AUTO_REJECT_THRESHOLD: int = int(os.getenv("AUTO_REJECT_THRESHOLD", "20"))

# ----- Server -----
BACKEND_HOST: str = os.getenv("BACKEND_HOST", "0.0.0.0")
BACKEND_PORT: int = int(os.getenv("BACKEND_PORT", "8000"))
FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")


def load_scoring_rubric() -> dict:
    """Load scoring rubric from YAML config."""
    rubric_path = Path(__file__).parent / "scoring_rubric.yaml"
    if rubric_path.exists():
        with open(rubric_path, "r") as f:
            return yaml.safe_load(f)
    # Return default rubric if file not found
    return {
        "qualification_threshold": QUALIFICATION_THRESHOLD,
        "auto_reject_threshold": AUTO_REJECT_THRESHOLD,
        "criteria": [
            {
                "name": "b2b_fit",
                "description": "Is this a B2B company?",
                "max_points": 20,
                "evaluation_prompt": (
                    "Is this company selling to other businesses (B2B)? "
                    "Score 20 if yes, 5 if mixed, 0 if pure B2C."
                ),
            },
            {
                "name": "company_size",
                "description": "Company has 50+ employees",
                "max_points": 20,
                "evaluation_prompt": (
                    "Based on available data, estimate employee count. "
                    "Score 20 for 200+, 15 for 50-200, 10 for 20-50, 5 for <20."
                ),
            },
            {
                "name": "tech_stack_fit",
                "description": "Uses relevant technologies",
                "max_points": 20,
                "evaluation_prompt": (
                    "Does the company use technologies like React, Python, Node.js, "
                    "or cloud services? Score based on alignment with modern stacks."
                ),
            },
            {
                "name": "buying_signals",
                "description": "Shows active buying signals",
                "max_points": 20,
                "evaluation_prompt": (
                    "Look for hiring activity, recent funding, tech stack changes, "
                    "or growth indicators. Score accordingly."
                ),
            },
            {
                "name": "reachability",
                "description": "Contact info availability",
                "max_points": 20,
                "evaluation_prompt": (
                    "Is there a valid contact email and name? "
                    "Score 20 for both, 10 for one, 0 for neither."
                ),
            },
        ],
    }
