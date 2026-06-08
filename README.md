# 🔮 PokeMarket.ai

> An AI agent that manages your Pokémon card collection through conversation — built with **Gemini**, **Google Cloud Agent Builder (ADK)**, and **MongoDB's MCP server**.

PokeMarket.ai goes beyond a chatbot: it *takes actions* on a real database. Ask it questions, add cards to your collection, look up live market prices, and track your portfolio's total value and gain/loss — and it always pauses for your approval before changing anything.

Built for the **Building Agents for Real-World Challenges** hackathon — **MongoDB partner track**.

🎥 **Demo video:** _<add your video link here>_

<!-- Add a screenshot: drop an image (e.g. screenshot.png) in the repo, then it shows below -->
![PokeMarket.ai screenshot](screenshot.png)

---

## ✨ Features

- **Conversational catalog** — search a database of Pokémon cards by name, set, number, rarity, type, and HP.
- **Collection management** — add, update, and remove the cards you own, with quantities consolidated cleanly (one record per card + condition, not duplicate rows).
- **Cost-basis tracking** — records what you paid per card.
- **Live valuation** — looks up current market prices on demand via a pricing API.
- **Portfolio totals** — reports total cards owned, total invested, current market value, and total gain/loss ($ and %).
- **Human-in-the-loop** — the agent describes every change and waits for your explicit approval before writing to the database.
- **Custom web UI** — a themed chat interface that renders card images and tables.

---

## 🏗️ Architecture

```
┌─────────────┐     HTTP      ┌──────────────────┐
│ Web Frontend │ ───────────▶ │  ADK Agent       │
│ (pokemarket. │              │  (Gemini brain)  │
│  html)       │ ◀─────────── │                  │
└─────────────┘               └───────┬──────────┘
                                       │ tools
                          ┌────────────┴─────────────┐
                          ▼                          ▼
                  ┌────────────────┐        ┌─────────────────┐
                  │ MongoDB MCP    │        │ get_price tool  │
                  │ server →       │        │ → tcgapi.dev    │
                  │ Atlas (on GCP) │        │                 │
                  └────────────────┘        └─────────────────┘
```

- **Brain:** Gemini, served via **Google Cloud Vertex AI**
- **Agent framework:** **ADK** (the dev kit inside Google Cloud Agent Builder)
- **Partner integration (MCP):** **MongoDB MCP server** for all database reads/writes
- **Database:** **MongoDB Atlas** (free M0 tier, hosted on a Google Cloud region)
- **Card data:** [TCGdex](https://tcgdex.dev) (free, open-source)
- **Pricing:** [tcgapi.dev](https://tcgapi.dev) (free tier)
- **Frontend:** single-file HTML/CSS/JS

Two MongoDB collections in one `pokemon` database:
- `cards` — the catalog (read-only)
- `holdings` — the cards the user owns

---

## 📋 Prerequisites

- Python 3.11+
- Node.js 20.19+ (runs the MongoDB MCP server)
- A Google Cloud project with billing enabled and the **Vertex AI API** enabled
- A MongoDB Atlas account (free M0 cluster)
- A [tcgapi.dev](https://tcgapi.dev) API key (free)
- `gcloud` CLI installed and authenticated

---

## ⚙️ Setup

**1. Clone and create a virtual environment**
```bash
git clone <your-repo-url>
cd pokemon-agent
python -m venv venv
venv\Scripts\activate          # Windows;  Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
```

**2. Authenticate to Google Cloud (Vertex AI)**
```bash
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable aiplatform.googleapis.com
```

**3. Create a `.env` file** in the project root (see `.env.example`):
```
GOOGLE_GENAI_USE_VERTEXAI=TRUE
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
MDB_MCP_CONNECTION_STRING=mongodb+srv://USER:PASS@cluster0.xxxx.mongodb.net/pokemon
TCG_API_KEY=your_tcgapi_dev_key
```
> ⚠️ **Never commit `.env`** — it contains secrets. It's already in `.gitignore`.

**4. Load the card data**
```bash
python import_cards.py        # full catalog (names + images)
python import_sets.py         # optional: specific sets with full detail
```

---

## ▶️ Running the app

**Easiest (Windows):** double-click `start_pokemarket.bat` — it starts the agent, serves the page, and opens your browser.

**Manual (two terminals):**

Terminal 1 — the agent backend:
```bash
adk api_server --port 8000 --allow_origins=regex:.* .
```
Terminal 2 — the web server:
```bash
python -m http.server 5500
```
Then open: `http://127.0.0.1:5500/pokemon_agent/pokemarket.html`

> The **first** message is slow (the MCP server warms up). Send "how many cards are in the database?" once to warm it, then it's fast.

---

## 📁 Project structure

```
pokemon-agent/
├── pokemon_agent/
│   ├── __init__.py        # exposes the agent
│   ├── agent.py           # the ADK agent + instructions
│   ├── price_tool.py      # get_price() tool
│   └── pokemarket.html    # the web frontend
├── import_cards.py        # loads the TCGdex catalog into MongoDB
├── import_sets.py         # loads specific sets with full detail
├── start_pokemarket.bat   # one-click launcher (Windows)
├── requirements.txt
├── .env                   # secrets (NOT committed)
├── .env.example           # template
└── .gitignore
```

---

## 💬 Example prompts

- "How many cards are in the database?"
- "Show me cards in Darkness Ablaze with their numbers and types."
- "Add 2 of Darkness Ablaze 020, near-mint." *(agent asks the price, then pauses for approval)*
- "What's Charizard ex worth?"
- "What's my collection worth?"

---

## ⚖️ Data & legal

- Card data from [TCGdex](https://tcgdex.dev) (open-source). Pricing from [tcgapi.dev](https://tcgapi.dev).
- This project is **not affiliated with, endorsed by, or sponsored by Nintendo or The Pokémon Company.** Pokémon and all related names are trademarks of their respective owners. This is a non-commercial hobbyist/hackathon project.

---

## 🚧 Future work

- Cache prices in MongoDB (daily snapshots) for faster portfolio totals and value-over-time history
- Streaming responses (`/run_sse`) for token-by-token replies
- Deploy to Cloud Run for a live URL
- Card-scanning via image recognition

---

## 🙏 Built with

Gemini · Google Cloud Agent Builder (ADK) · MongoDB Atlas + MCP · TCGdex · tcgapi.dev
