# 🔮 PokeMarket.ai

> An AI agent that manages your Pokémon card collection through conversation — built with **Gemini (Vertex AI)**, **Google Cloud Agent Builder (ADK)**, and **MongoDB's MCP server**.

PokeMarket.ai goes beyond a chatbot: it *takes actions* on a real database. Ask it questions, look up live market prices, organize your collection into distinct decks, and track your portfolio's total value and gain/loss—and it always pauses for your approval before changing anything.

Built for production and optimized for ultra-lean Google Cloud Run performance using direct Model Context Protocol execution.

---

## ✨ Features

- **Conversational Catalog** — Search a curated database of 725+ high-quality Pokémon cards by name, set, number, rarity, type, and HP.
- **Deck Management** — Add, update, and sort your cards across **4 distinct decks** simultaneously (e.g., *Main Binder, Tournament Deck, Trade Bait, and Investment Portfolio*).
- **Collection Consolidation** — Quantities are consolidated cleanly (one database record per card + condition matrix, avoiding duplicate rows).
- **Cost-Basis Tracking** — Records exactly what you paid per card to compute precise margins.
- **Optimized Batch Valuation** — Evaluates full portfolios concurrently via a custom `get_prices_batch` utility using a thread pool to avoid 504 gateway timeouts.
- **Portfolio Totals** — Live calculations reporting total cards owned, total invested capital, current market value, and net gain/loss ($ and %).
- **Human-in-the-Loop Safety** — The agent explicitly describes every pending database modification and waits for your confirmation before writing.
- **Production-Ready Cold Starts** — Decoupled from slow dynamic NPM network resolutions (`npx --no-install`), ensuring snappy initialization under container resource constraints.

---

## 🏗️ Architecture

We engineered a high-throughput, dual-runtime backend container deployed on **Google Cloud Run**:

* **Brain:** `gemini-2.5-flash` orchestrated via the **Google Agent Development Kit (ADK)** for advanced tool routing and intent recognition.
* **Partner Integration (MCP):** A **MongoDB MCP Server** running natively as a secure Node.js sub-process inside the container, allowing the AI to discover schemas and query collections dynamically.
* **Data Core:** A cloud-hosted **MongoDB Atlas** cluster storing our specialized index profiles.
* **Valuation Authority:** Direct, multi-threaded interface hooks to the **PokeTrace API** for aggregate market values.

### Database Schema Definition
Two optimized MongoDB collections are hosted inside the `pokemon` database:
* `cards` — The indexed card catalog (~725 curated cards, read-only baseline).
* `holdings` — User inventory portfolios mapped by deck assignment, purchase price, and physical condition.

---

## 📋 Prerequisites

- Python 3.11+
- Node.js 20.x (Baked directly into the Docker runtime build)
- A Google Cloud project with billing and the **Vertex AI API** enabled
- A MongoDB Atlas account (Free M0 Cluster supported)
- A PokeTrace API key
- `gcloud` CLI installed and authenticated on your local machine

---

## ⚙️ Setup

**1. Clone the repository and configure the environment**

git clone <your-repo-url>
cd pokemon-agent
python -m venv venv
source venv/bin/activate       # Mac/Linux; Windows: venv\Scripts\activate
pip install -r requirements.txt
2. Authenticate to Google Cloud (Vertex AI)

gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable aiplatform.googleapis.com
3. Configure Environment Variables
Create a .env file in the project root:

GOOGLE_GENAI_USE_VERTEXAI=TRUE
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
MDB_MCP_CONNECTION_STRING=mongodb+srv://USER:PASS@cluster.xxxx.mongodb.net/?appName=Clustercards
POKETRACE_API_KEY=your_poketrace_api_key

⚠️ Security Warning: Never commit .env files to remote version control. It is protected under .gitignore.

## ▶️ Running the App
Local Development
To test the environment locally, initialise the processes across two terminals:

Terminal 1 (Agent Backend Engine):

adk api_server --port 8080 --allow_origins="*" .
Terminal 2 (Frontend Integration):
Serve your web directory or connect your web application routing straight to the live exposed port at http://localhost:8080/run.

## 🚀 Deployment (Google Cloud Run)
The application includes a production-ready, multi-stage Dockerfile packaging both Python and Node runtimes to maintain an ultra-lean footprint on free-tier architecture.

Deploy the image directly using Windows Terminal (PowerShell execution):

gcloud run deploy pokemarket-backend `
  --source . `
  --region us-central1 `
  --min-instances 1 `
  --cpu 1 `
  --memory 1Gi `
  --allow-unauthenticated `
  --update-env-vars GOOGLE_GENAI_USE_VERTEXAI=TRUE,MDB_MCP_CONNECTION_STRING="your_mongodb_uri",POKETRACE_API_KEY="your_poketrace_key"


## 💡 Optimization Insight: Setting --min-instances 1 keeps the container pre-warmed, keeping your Node.js subprocesses and database handshakes fully alive to eliminate cold-start latency.

## 💬 Example Prompts
Try interacting with the agent using these natural language commands:

"Check if there are any Charizard variants in our catalog."

"Add 1 near-mint Umbreon to my Investment Portfolio deck. I paid $85 for it."

"What is the total value and profit margin across all 4 of my decks right now?"

"Move my holo Pikachu from my Trade Bait binder over to my Tournament Deck."

## ⚖️ Disclaimer
This project is not affiliated with, endorsed by, or sponsored by Nintendo or The Pokémon Company. Pokémon and all related names are trademarks of their respective owners. Eliminating execution lag by natively mapping the MCP binary layout.

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
