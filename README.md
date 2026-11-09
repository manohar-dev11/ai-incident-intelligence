# AI Incident Intelligence Platform

An incident management and log intelligence platform built with **FastAPI, Python, React, TypeScript, and SQLite**. It helps developers track application incidents, upload log files, detect errors, identify severity levels, and explore stored log entries through a web dashboard.

> **Project status:** Core incident management, analytics, log ingestion, and Log Explorer functionality are implemented. AI-powered root cause analysis and knowledge-base assistance are planned for future development.

## Features

### Incident Management
- Create, view, and update incidents.
- Track incident severity: Low, Medium, High, and Critical.
- Track incident status: Open, Investigating, and Resolved.
- Search and filter incidents.
- Detect duplicate incidents using fingerprints.

### Log Intelligence
- Upload application log files (`.log` and `.txt`).
- Parse log files and identify relevant error messages.
- Detect severity using rule-based patterns.
- Store detected log entries in SQLite.
- Generate incidents from detected log events.
- Avoid creating duplicate incidents.

### Log Explorer
- View stored log entries.
- Search log messages.
- Filter by severity and filename.
- Sort by timestamp, line number, severity, and filename.
- Navigate results using pagination.

### Analytics Dashboard
- View total incidents.
- Track open, investigating, and resolved incidents.
- View incident severity distribution.
- Monitor incident activity through dashboard visualizations.

## Technology Stack

| Component | Technology |
|---|---|
| Backend | Python, FastAPI |
| Database | SQLite |
| ORM | SQLAlchemy |
| Validation | Pydantic |
| Frontend | React, TypeScript |
| Build Tool | Vite |
| HTTP Client | Axios |
| Charts | Recharts |
| Icons | Lucide React |
| API Documentation | Swagger UI |

## Project Structure

```text
ai-incident-intelligence/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── incidents.py
│   │   │   ├── logs.py
│   │   │   └── analytics.py
│   │   ├── database/
│   │   │   └── connection.py
│   │   ├── models/
│   │   │   ├── incident.py
│   │   │   └── log_entry.py
│   │   ├── schemas/
│   │   ├── services/
│   │   │   └── log_parser.py
│   │   └── main.py
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
│
├── data/
│   ├── knowledge_base/
│   └── sample_logs/
│
├── docs/
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Incidents.tsx
│   │   │   ├── LogExplorer.tsx
│   │   │   └── LogExplorer.css
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── index.css
│   └── package.json
│
├── scripts/
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

Install the following:

- Python 3.11 or newer (a compatible Python version is recommended for your installed dependencies).
- Node.js and npm.
- Git.

### 1. Clone the repository

```bash
git clone https://github.com/manohar-dev11/ai-incident-intelligence.git
cd ai-incident-intelligence
```

### 2. Set up the backend

Open a terminal in the project directory:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 3. Start the backend

```powershell
python -m uvicorn app.main:app --reload
```

Backend URL:

`http://127.0.0.1:8000`

Interactive API documentation:

`http://127.0.0.1:8000/docs`

### 4. Set up the frontend

Open a second terminal in the project directory:

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL:

`http://localhost:5173`

## API Overview

| Endpoint | Purpose |
|---|---|
| `GET /health` | Backend health check |
| `/incidents/` | Incident management |
| `/logs/` | Log upload and log entry operations |
| `GET /logs/entries` | Retrieve, filter, sort, and paginate log entries |
| `GET /analytics/summary` | Dashboard analytics |

For request parameters, response formats, and interactive testing, visit the Swagger documentation at `/docs`.

## Log Severity Detection

The current parser uses deterministic keyword patterns:

| Detected keywords | Assigned severity |
|---|---|
| CRITICAL, FATAL, PANIC | Critical |
| ERROR, EXCEPTION, TRACEBACK | High |
| WARN, WARNING | Medium |

Blank lines and lines without matching severity keywords are ignored by the current parser.

## Planned Improvements

- AI-powered incident root cause analysis.
- Local language model integration using Ollama.
- Retrieval-Augmented Generation (RAG) for knowledge-base assistance.
- Similar incident recommendations.
- Automated incident summaries.
- More comprehensive automated tests.
- Docker-based deployment.
- GitHub Actions CI/CD pipeline.

These are planned features and are not represented as currently implemented.

## Development Notes

- The application currently uses SQLite for local persistence.
- Log severity detection currently relies on rule-based patterns.
- Duplicate detection applies to incident creation; repeated uploads can still create additional log-entry records.
- Keep local databases, virtual environments, and secret configuration files out of Git.

## Author

**Manohar Bandra**

GitHub: [@manohar-dev11](https://github.com/manohar-dev11)

Repository: [AI Incident Intelligence Platform](https://github.com/manohar-dev11/ai-incident-intelligence)
