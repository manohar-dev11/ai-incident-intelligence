# AI Incident Intelligence Platform

A full-stack application for tracking software incidents, exploring application logs, and investigating possible root causes with local AI.

Built with **FastAPI, React, TypeScript, SQLite, and Ollama**, the platform brings incident management, log analysis, and troubleshooting suggestions into a single dashboard.

> **Status:** In active development. The core application, AI-assisted root cause analysis, and an initial classification evaluation tool are implemented.

## Features

### Incident management

- Create, view, update, and delete incidents through the API.
- Track severity (Low, Medium, High, Critical) and status (Open, Investigating, Resolved).
- Search and filter incidents, and update their status or severity from the dashboard.
- Identify duplicate incidents using fingerprints.

### Log analysis

- Upload `.log` and `.txt` files (up to 5 MB).
- Parse logs and detect severity using keyword-based rules.
- Create incidents from detected events while avoiding duplicate incident creation.
- Browse stored log entries with search, filters, sorting, and pagination.

### Dashboard

- View incident counts, current statuses, and recent incidents.
- Explore severity distribution through charts.
- Open incident details and request root cause analysis.

### AI-assisted root cause analysis

- Analyze incident titles and descriptions with **Qwen2.5 1.5B** running locally through **Ollama**.
- Receive a probable cause, incident category, and troubleshooting recommendations.
- Use predefined rules when Ollama is unavailable or the AI response is invalid.
- Prefer a recognized rule-based classification when it conflicts with the AI category.
- See whether an analysis came from the AI model or the rule engine.

AI output is a **suggestion, not a confirmed diagnosis**. The system does not automatically verify root causes or apply fixes.

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI, SQLAlchemy, Pydantic |
| Database | SQLite |
| Frontend | React, TypeScript, Vite |
| UI and charts | Lucide React, Recharts |
| API requests | Axios |
| Local AI | Ollama, Qwen2.5 1.5B |
| Testing | Python `unittest` |

## Getting started

### Requirements

- Python and pip
- Node.js and npm
- [Ollama](https://ollama.com/download) for AI-generated analysis (optional for rule-based analysis)

### 1. Clone the repository

```bash
git clone https://github.com/manohar-dev11/ai-incident-intelligence.git
cd ai-incident-intelligence
```

### 2. Start the backend

On Windows PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

The backend runs at **http://127.0.0.1:8000**. Interactive API documentation is available at **http://127.0.0.1:8000/docs**.

Run the backend from the `backend` directory so the application imports and local SQLite database path resolve correctly.

### 3. Set up local AI (optional)

Install Ollama, then download the model:

```powershell
ollama pull qwen2.5:1.5b
```

Ensure the Ollama service is running. By default, the backend connects to Ollama at `http://127.0.0.1:11434`.

Without Ollama, incident analysis can still return rule-based recommendations.

### 4. Start the frontend

Open a **second terminal** from the project root:

```powershell
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**.

## How it works

1. Upload an application log or manage an incident manually.
2. The backend stores incidents and parsed log entries in SQLite.
3. Use the dashboard to search, filter, and inspect incidents.
4. Select **Analyze Root Cause** from an incident's details.
5. The backend requests an AI analysis from Ollama, validates the response, and uses rule-based analysis where needed.
6. Review the suggested cause and troubleshooting steps before taking action.

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET / POST | `/incidents/` | List or create incidents |
| GET / PUT / DELETE | `/incidents/{incident_id}` | Read, update, or delete an incident |
| POST | `/incidents/{incident_id}/analyze` | Analyze an incident's probable root cause |
| POST | `/logs/upload` | Upload and parse a log file |
| GET | `/logs/entries` | Search and browse log entries |
| GET | `/analytics/summary` | Dashboard statistics |

See **`/docs`** for request parameters and response schemas.

## Classification evaluation

The repository includes a small evaluation tool for the **rule-based incident classifier**. It checks predictions against labeled examples and reports accuracy and misclassified cases.

| Dataset | Correct | Accuracy |
|---|---:|---:|
| Development (12 cases) | 12/12 | 100% |
| Challenge (12 cases) | 2/12 | 16.67% |

These are results on **small, synthetic datasets**, not production performance figures or measurements of the Ollama model. The rules were refined using the development cases; the challenge cases exposed gaps in handling unfamiliar terminology.

Run the evaluations from `backend`:

```powershell
python -m app.evaluation.evaluate --dataset development
python -m app.evaluation.evaluate --dataset challenge
```

Run the backend unit tests:

```powershell
python -m unittest discover -s app/tests -p "test_*.py" -v
```

More details are in [`docs/evaluation_baseline.md`](docs/evaluation_baseline.md).

## Current limitations

- Severity detection and fallback classification rely on predefined patterns.
- AI-generated explanations may be incomplete or incorrect.
- The local model's speed depends on available system resources.
- The evaluation datasets are small and synthetic.
- The app currently uses SQLite for local persistence.

## What's next

- Compare AI-only, rule-based, and hybrid classification on broader test cases.
- Add a searchable knowledge base and retrieval-augmented assistance.
- Find similar historical incidents and improve investigation context.
- Expand automated API tests and introduce CI checks.
- Add deployment support and improve frontend performance.

## Author

**Manohar Bandra**  
GitHub: [@manohar-dev11](https://github.com/manohar-dev11)

---

*Built to explore how full-stack development and local AI can make incident investigation more useful.*
