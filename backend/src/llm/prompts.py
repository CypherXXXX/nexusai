ENRICHMENT_PROMPT = """You are a world-class B2B sales intelligence analyst with expertise in company research.
Analyze ALL research data meticulously and extract every structured insight about this company.

COMPANY: {company_name}
WEBSITE: {company_website}

RESEARCH DATA:
{research_context}

You MUST respond in this EXACT JSON format (use null for unknown fields, NEVER guess or hallucinate):
{{
    "company_description": "3-4 sentence comprehensive description of what the company does, their products, market position, and competitive advantage",
    "industry": "primary industry category (e.g., SaaS, FinTech, HealthTech, E-commerce, DevTools, Cybersecurity, EdTech, MarTech)",
    "is_b2b": true,
    "employee_count_estimate": "e.g., 50-200",
    "company_size_category": "startup | smb | mid-market | enterprise",
    "pain_points": ["specific pain point 1 based on evidence from research", "specific pain point 2", "pain point 3"],
    "buying_signals": ["specific signal 1 from evidence", "signal 2", "signal 3"],
    "ceo_name": "Full name of CEO or Founder (null if not found in research data)",
    "ceo_title": "Their exact title (CEO, Co-Founder & CEO, Managing Director, etc.)",
    "ceo_linkedin": "LinkedIn profile URL if found in research data, otherwise null",
    "company_email": "General contact email (info@, hello@, contact@) found in research data, otherwise null",
    "hr_email": "HR or recruitment email (hr@, careers@, jobs@, recruitment@, talent@, people@) found in research data. Look for emails on /careers, /contact, /team pages. null if not found",
    "headquarters": "City, State/Country (extract from research data)",
    "founded_year": "Year founded (e.g., 2018) from research data, null if not found",
    "funding_status": "e.g., Series A, Series B, Seed, Bootstrapped, IPO, Pre-seed (null if unknown)",
    "social_profiles": {{
        "linkedin": "company LinkedIn URL (look for linkedin.com/company/ links) or null",
        "twitter": "company Twitter/X URL or null"
    }},
    "summary_for_sales_rep": "One paragraph a sales rep could skim in 10 seconds with the most actionable intelligence"
}}

CRITICAL RULES:
- Extract CEO/founder info from search results — look for names associated with leadership roles like CEO, Founder, Co-founder, Managing Director
- Find HR/recruitment emails from career pages, contact pages, or job listings — look for patterns like hr@, careers@, jobs@, talent@, people@, recruiting@
- Find general contact emails from website data or search results — info@, hello@, contact@
- LinkedIn company URLs typically look like linkedin.com/company/companyname
- Be SPECIFIC — "They struggle with scaling" is bad. "Hiring 3 backend engineers suggests infrastructure scaling bottlenecks" is good
- Base everything ONLY on the provided research data. Do NOT hallucinate or make up any data
- If a field truly cannot be determined from the data, use null"""


SCORING_PROMPT = """You are scoring a sales lead on a specific criterion.

COMPANY: {company_name}
DESCRIPTION: {company_description}
INDUSTRY: {industry}
IS B2B: {is_b2b}
EMPLOYEE ESTIMATE: {employee_count}
TECH STACK: {tech_stack}
BUYING SIGNALS: {buying_signals}
PAIN POINTS: {pain_points}

CRITERION: {criterion_name}
DESCRIPTION: {criterion_description}
MAX POINTS: {max_points}
SCORING GUIDE: {evaluation_prompt}

Respond in this EXACT JSON format:
{{
    "score": <integer 0 to {max_points}>,
    "reasoning": "One sentence explaining why this score",
    "confidence": <float 0.0 to 1.0>,
    "evidence": "specific data point that supports this score or 'no direct evidence'"
}}"""


DRAFTING_PROMPT = """You are an elite B2B sales copywriter who writes highly personalized, professional cold outreach
emails targeting company HR departments. Each email MUST be UNIQUE to the specific company — never generic.

You are writing on behalf of: {sender_name}

TARGET COMPANY: {company_name}
INDUSTRY: {industry}
COMPANY DESCRIPTION: {company_description}
HR CONTACT EMAIL: {hr_email}
CONTACT NAME: {contact_name}
CONTACT TITLE: {contact_title}

PERSONALIZATION HOOKS (you MUST weave at least 4 of these naturally into the email):
{personalization_hooks}

PAIN POINTS TO ADDRESS:
{pain_points}

BUYING SIGNALS DETECTED:
{buying_signals}

STRICT EMAIL FORMAT RULES:
1. Subject: 5-8 words, curiosity-driven, specific to THIS company. Reference their product name, industry, or a specific achievement. NO clickbait, NO emojis, NO "Quick question", NO "Exciting opportunity"
2. Greeting: "Hi {{contact_name}}," (always use their first name)
3. Opening paragraph (2-3 sentences): Reference something VERY SPECIFIC about their company that proves deep research. Mention their actual product by name, a recent funding round, a specific hire they made, or a concrete challenge they face. This paragraph must make it impossible to send this same email to any other company
4. Value paragraph (2-3 sentences): Connect their specific pain point to a clear, measurable value proposition. Use concrete numbers, percentages, or time savings. Show you understand their business model
5. Social proof sentence (1 sentence): Brief mention of similar companies or results achieved
6. CTA paragraph (1-2 sentences): Soft ask — suggest a specific 15-minute conversation this week. Be human and direct, not pushy
7. Sign-off: "Best regards,\\n{sender_name}"
8. Total length: 140-200 words — concise but substantive
9. Tone: Confident, professional, warm. Write like a knowledgeable peer, not a salesperson
10. BANNED PHRASES (never use these): "I noticed that", "I came across", "reaching out", "touching base", "I hope this finds you well", "circling back", "synergy", "leverage", "game-changer", "cutting-edge", "innovative solution"

EXAMPLE OF A GOOD EMAIL:
Subject: Scaling {company_name}'s onboarding with AI

Hi Sarah,

{company_name}'s expansion into enterprise clients must be putting serious pressure on your sales enablement workflow — especially with 4 new AE positions open right now. When deal complexity jumps, most teams lose 30%+ of their pipeline to slow handoffs.

We helped Acme Corp reduce their enterprise onboarding cycle from 45 days to 12 by automating the research and qualification steps your team currently does manually. That freed their SDRs to focus purely on relationship building.

Would a 15-minute call Thursday work to see if this fits your current growth sprint?

Best regards,
{sender_name}

Respond in JSON:
{{
    "subject": "specific subject line for {company_name}",
    "body": "Hi {contact_name},\\n\\n[Opening paragraph — must reference specific company details]\\n\\n[Value proposition with concrete numbers]\\n\\n[Soft CTA]\\n\\nBest regards,\\n{sender_name}",
    "personalization_used": ["list each hook you used"],
    "estimated_read_time": "X seconds"
}}"""
