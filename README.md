# 🧠 NexusAI: The Autonomous Sales Engineer

<div align="center">

![NexusAI Hero](https://img.shields.io/badge/Status-Active_Development-success?style=for-the-badge&logo=statuspage)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge&logo=open-source-initiative)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

<br/>

**Automate the tedious 80% of your sales process.**<br/>
NexusAI is an intelligent CRM agent that autonomously researches leads, scores them with verifiable logic, and drafts hyper-personalized cold outreach that actually converts.

</div>

---

## 🚨 The Problem

Modern sales development (SDR) is fundamentally broken:
1.  **Manual Research**: SDRs spend 15-30 minutes per lead just to understand what a company does.
2.  **Context Switching**: Jumping between LinkedIn, News, and Company Websites kills productivity.
3.  **Generic Outreach**: "I saw you're hiring" emails get ignored because they lack depth.
4.  **Inconsistent Scoring**: Leads are qualified based on gut feeling rather than data.

## 💡 The Solution: NexusAI

NexusAI fixes this by treating lead qualification as an **engineering problem**. It builds a **structured knowledge graph** for every company in your pipeline. It "reads" their website, analyzes their tech stack, finds their funding status, and identifies key decision-makers—all before you even look at the lead.

---

## ⚡ How It Works (The Workflow)

NexusAI uses a sophisticated **LangGraph** autonomous agent to process leads.

### 1️⃣ Ingestion & Initial Scan
The user inputs a domain (e.g., `stripe.com`) or uploads a CSV. The system instantly validates the target and initializes a unique research session.

### 2️⃣ Deep Autonomous Research
The **Research Agent** activates, utilizing multiple intelligence sources:
- **Tavily AI**: Performs deep, multi-hop searches to find strategic initiatives, recent news, and pain points.
- **DuckDuckGo**: Cross-references findings for factual accuracy.
- **Scraping**: Extracts metadata directly from the company's landing pages.

### 3️⃣ Intelligence Enrichment
Raw data is structured into a comprehensive profile:
- **Tech Stack Analysis**: Detects frameworks, cloud providers, and tools used.
- **Decision Makers**: Identifies key stakeholders (CEO, CTO, VP Engineering).
- **Firmographics**: Mapping industry, employee count, and funding status.

### 4️⃣ Cognitive Scoring (0-100)
A **Llama 3.3 (70B)** model evaluates the enriched profile against your Ideal Customer Profile (ICP).
- **+ Points**: Hiring for relevant roles, recent funding, technical fit.
- **- Points**: Incompatible tech stack, no recent activity.
*Outcome: A precise score with a human-readable justification.*

### 5️⃣ Hyper-Personalized Drafting
If the lead qualifies (Score > 70%), the **Drafting Agent**:
- Synthesizes all research into a coherent narrative.
- Writes a "Look, we did our homework" email referencing specific company challenges.
- **Zero Hallucinations**: Every claim is backed by the research data.

---

## 📖 User Manual

### What is a Lead?
In NexusAI, a "Lead" is simply a **Company Domain** (e.g., `openai.com`, `vercel.com`). You do not need contact names or emails initially—the AI attempts to find them during research.

### Single Lead Research
1.  Go to the **Dashboard**.
2.  Click **Add Lead**.
3.  Enter the company URL (e.g., `https://stripe.com` or just `stripe.com`).
4.  The agent will immediately begin processing.

### Bulk Upload (CSV)
You can process hundreds of leads at once.
1.  Prepare a CSV file.
2.  **Required Header**: The file MUST have a column named `company_url`.
3.  (Optional) `company_name` column.
4.  Upload via the **Import Leads** button.

---

## 🛠️ Technology Stack & Tools

NexusAI is built on a modern, high-performance stack designed for reliability and scale.

### Backend (The Brain)
*   **FastAPI**: High-performance, async Python framework perfect for concurrent AI tasks.
*   **LangGraph**: Provides stateful, cyclical agent workflows. Unlike linear chains, this allows the agent to "loop back" if research is insufficient.
*   **Groq**: Powers the **Llama 3.3 70B** model with near-instant inference speeds (<200ms), making real-time scoring possible.
*   **Tavily AI**: Search engine optimized for LLMs. It returns clean, parsed text instead of raw HTML, reducing hallucination risks.
*   **SQLite + aiosqlite**: Lightweight, file-based persistence. Deployed with a persistent disk for reliability.

### Frontend (The Face)
*   **Next.js 16**: The latest React framework with Server Components for a fast, SEO-friendly dashboard.
*   **Tailwind CSS v4**: Utility-first CSS engine for the sleek, glassmorphism UI.
*   **Framer Motion**: Cinematic, fluid interactions that make the dashboard feel alive.
*   **Clerk**: Enterprise-grade authentication.
*   **SWR**: React Hooks for data fetching with "stale-while-revalidate" caching strategy.

---

## 📂 Project Structure

```bash
📦 nexusai
├── 📂 backend                 # FastAPI Python Application
│   ├── 📂 api                 # API Routes & Middleware
│   ├── 📂 src                 # Core Logic
│   │   ├── 📂 graph           # LangGraph Agent Nodes (Research, Score, Draft)
│   │   ├── 📂 database        # SQLAlchemy Models & CRUD
│   │   ├── 📂 models          # Pydantic Schemas
│   │   └── 📂 utils           # Helpers (Logger, API Clients)
│   ├── main.py                # Server Entry Point
│   └── requirements.txt       # Python Dependencies
│
├── 📂 frontend                # Next.js 16 Application
│   ├── 📂 src
│   │   ├── 📂 app             # App Router Pages
│   │   ├── 📂 components      # Shadcn UI & Custom Components
│   │   ├── 📂 hooks           # SWR Data Hooks
│   │   └── 📂 lib             # API Client & Utilities
│   ├── package.json           # Node.js Dependencies
│   └── next.config.ts         # Next.js Configuration
│
└── README.md                  # Project Documentation
```

---

## 🚀 Getting Started (Local Development)

### 1. Clone the Repository
```bash
git clone https://github.com/CypherXXXX/nexusai.git
cd nexusai
```

### 2. Backend Setup
The backend handles all AI logic and database connections.

```bash
cd backend

# Create virtual environment
python -m venv .venv
# Activate: 
# Windows: .venv\Scripts\activate
# Mac/Linux: source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with your API keys (see .env.example)
python main.py
```

### 3. Frontend Setup
The frontend is the visual dashboard.

```bash
cd frontend
npm install
npm run dev
```

---

<div align="center">
  <p>Built with ❤️ by CypherXXXX</p>
</div>
