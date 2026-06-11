# 🔮 PokeMarket.ai

> An AI agent that manages your Pokémon card collection through conversation — built with **Gemini (Vertex AI)**, **Google Cloud Agent Builder (ADK)**, and **MongoDB's MCP server**.

PokeMarket.ai goes beyond a chatbot: it *takes actions* on a real database. Ask it questions, add cards to your collection, look up live market prices, and track your portfolio's total value and gain/loss — and it always pauses for your approval before changing anything.

Built for production and optimized for ultra-lean Cloud Run performance using direct Model Context Protocol execution.


---

## ✨ Features

- **Conversational catalog** — search a database of Pokémon cards by name, set, number, rarity, type, and HP.
- **Collection management** — add, update, and remove the cards you own, with quantities consolidated cleanly (one record per card + condition, not duplicate rows).
- **Cost-basis tracking** — records what you paid per card.
- **Optimized Batch valuation** — evaluates full portfolios concurrently via `get_prices_batch` using a throttled, resource-safe thread pool.
- **Portfolio totals** — reports total cards owned, total invested, current market value, and total gain/loss ($ and %).
- **Human-in-the-loop** — the agent describes every change and waits for your explicit approval before writing to the database.
- **Production-Ready Cold Starts** — completely decoupled from slow dynamic package resolution (`npx`), enabling snappy initialization under Google Cloud Run.

---

## 🏗️ Architecture

+───────────────────────────────+
|         Web Frontend          |
| (pokemarket-ai-two.vercel.app)|
+───────────────────────────────+
│
│ HTTP (POST /run)
▼
+───────────────────────────────+
|        Cloud Run App          |
|   ┌───────────────────────┐   |
|   |   Python ADK Agent    |   |
|   |    (Gemini Brain)     |   |
|   └───────────┬───────────┘   |
|               │               |
|       ┌───────┴───────┐       |
|       ▼               ▼       |
| ┌───────────┐   ┌───────────┐ |
| |  Node.js  |   |  Python   | |
| |  MongoDB  |   |           | |
| |   MCP     |   |price_tool | |
| |  Subproc  |   |   (.py)   | |
| └─────┬─────┘   └─────┬─────┘ |
+───────┼───────────────┼───────+
│               │
▼               ▼
+────────────────+ +────────────+
| MongoDB Atlas  | | PokeTrace  |
| (Cloud Hosted) | | Pricing API|
+────────────────+ +────────────+


- **Brain:** Gemini 2.5 Flash, served via **Google Cloud Vertex AI**
- **Agent framework:** **ADK** (the development kit inside Google Cloud Agent Builder)
- **Partner integration (MCP):** **MongoDB MCP server** for all database reads/writes running as a direct `node` sub-process
- **Database:** **MongoDB Atlas** (hosted on a Google Cloud region)
- **Pricing:** [PokeTrace API](https://poketrace.com) (optimized with variant and condition tracking)

Two MongoDB collections in one `pokemon` database:
- `cards` — the catalog (~23,000 cards, read-only)
- `holdings` — the cards the user owns

---

## 📋 Prerequisites

- Python 3.11+
- Node.js 20.x (runs the MongoDB MCP server)
- A Google Cloud project with billing enabled and the **Vertex AI API** enabled
- A MongoDB Atlas account
- A PokeTrace API key
- `gcloud` CLI installed and authenticated

---

## ⚙️ Setup

**1. Clone and create a virtual environment**

git clone <your-repo-url>
cd pokemon-agent
python -m venv venv
source venv/bin/activate       # Mac/Linux; Windows: venv\Scripts\activate
pip install -r requirements.txt


2. Authenticate to Google Cloud (Vertex AI)
   
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable aiplatform.googleapis.com


4. Create a .env file in the project root:

GOOGLE_GENAI_USE_VERTEXAI=TRUE
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
MDB_MCP_CONNECTION_STRING=mongodb+srv://USER:PASS@cluster.xxxx.mongodb.net/?appName=Clustercards
POKETRACE_API_KEY=your_poketrace_api_key
⚠️ Never commit .env — it contains secrets. It is already in .gitignore.

## ▶️ Running the app
Local Development
Terminal 1 — the agent backend:

adk api_server --port 8080 --allow_origins="*" .

Terminal 2 — frontend integration:
Serve your web application or connect your frontend routing straight to http://localhost:8080/run.

## 🚀 Deployment (Google Cloud Run)
The application includes a production-ready Dockerfile that packages both Python 3.11 and Node v20 runtimes together, eliminating execution lag by natively mapping the MCP binary layout.

Production Build & Deploy Command
Deploy to Cloud Run with allocated scaling configuration to completely erase cold-start latency drops:

gcloud run deploy pokemarket-backend \
  --image us-central1-docker.pkg.dev/pokemarket-499016/pokemarket-repo/pokemarket-backend \
  --region us-central1 \
  --allow-unauthenticated \
  --cpu=2 \
  --memory=2Gi \
  --no-cpu-throttling \
  --min-instances=1 \
  --set-env-vars "MDB_MCP_CONNECTION_STRING=mongodb+srv://USER:PASS@cluster.xxxx.mongodb.net/?appName=Clustercards,GOOGLE_GENAI_USE_VERTEXAI=TRUE,GOOGLE_CLOUD_PROJECT=pokemarket-499016,GOOGLE_CLOUD_LOCATION=us-central1"
  
Why these settings matter:
--cpu=2 & --memory=2Gi: Prevents runtime starvation during concurrent Python ADK schema building and Node engine execution loops.

--no-cpu-throttling: Guarantees full clock speed performance on cold container allocations.

--min-instances=1: Keeps a hot instance ready for sub-second API endpoint processing.

## 💬 Example prompts
"How many cards are in the database?"

"Show me cards in Darkness Ablaze with their numbers and types."

"Add 2 of Darkness Ablaze 020, near-mint." (agent asks the price, then pauses for approval)

"What's Charizard ex worth?"

"What's my collection worth?"

## ⚖️ Data & legal
Card indexing definitions and pricing aggregations powered by PokeTrace API.

This project is not affiliated with, endorsed by, or sponsored by Nintendo or The Pokémon Company. Pokémon and all related names are trademarks of their respective properties.
