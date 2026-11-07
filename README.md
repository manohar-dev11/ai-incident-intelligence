# AI Incident Intelligence Platform

An intelligent incident management platform designed to help developers track, manage, and investigate application incidents.

**Project Status:** Backend Foundation Completed — AI and Log Intelligence Features Under Development.

## Overview

The AI Incident Intelligence Platform aims to simplify application incident management through automated log analysis, incident detection, severity classification, and AI-assisted troubleshooting.

The current implementation provides a REST API for managing incidents, backed by an SQLite database.

## Current Features

- **Incident Creation:** Create incidents with title, description, severity, status, and source.
- **Incident Listing:** Retrieve all stored incidents.
- **Incident Details:** Retrieve an individual incident using its ID.
- **Incident Updates:** Update incident information, including severity and status.
- **Incident Deletion:** Delete incidents by ID.
- **Input Validation:** Validate incoming data using Pydantic.
- **Database Persistence:** Store incident records using SQLite and SQLAlchemy.
- **Interactive API Documentation:** Explore and test endpoints through Swagger UI.

## Technology Stack

| Technology | Purpose |
|---|---|
| Python | Backend programming |
| FastAPI | REST API development |
| SQLAlchemy | Database ORM |
| SQLite | Database |
| Pydantic | Request and response validation |
| Uvicorn | ASGI server |
| Git & GitHub | Version control |

## Project Structure

```text
ai-incident-intelligence/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── incidents.py
│   │   │
│   │   ├── core/
│   │   ├── database/
│   │   │   └── connection.py
│   │   │
│   │   ├── models/
│   │   │   └── incident.py
│   │   │
│   │   ├── schemas/
│   │   │   └── incident.py
│   │   │
│   │   ├── services/
│   │   └── main.py
│   │
│   ├── tests/
│   └── requirements.txt
│
├── data/
│   ├── knowledge_base/
│   └── sample_logs/
│
├── docs/
├── frontend/
├── scripts/
│
├── .gitignore
└── README.md
```

## Installation and Setup

### Prerequisites

- Python 3.10 or newer (Python package compatibility may vary)
- pip
- Git

### 1. Clone the repository

```bash
git clone https://github.com/manohar-dev11/ai-incident-intelligence.git
cd ai-incident-intelligence
```

### 2. Navigate to the backend

```bash
cd backend
```

### 3. Create a virtual environment

**Windows PowerShell:**

```powershell
python -m venv .venv
```

### 4. Activate the virtual environment

```powershell
.\.venv\Scripts\Activate.ps1
```

### 5. Install dependencies

```powershell
pip install -r requirements.txt
```

### 6. Start the backend server

```powershell
uvicorn app.main:app --reload
```

The backend will be available at:

```text
http://127.0.0.1:8000
```

## API Documentation

FastAPI automatically generates interactive API documentation.

**Swagger UI:**

```text
http://127.0.0.1:8000/docs
```

**Alternative API documentation:**

```text
http://127.0.0.1:8000/redoc
```

## Available API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Backend welcome endpoint |
| GET | `/health` | Check backend health |
| POST | `/incidents/` | Create an incident |
| GET | `/incidents/` | Retrieve all incidents |
| GET | `/incidents/{incident_id}` | Retrieve an incident |
| PUT | `/incidents/{incident_id}` | Update an incident |
| DELETE | `/incidents/{incident_id}` | Delete an incident |

## Incident Data Example

Example request for creating an incident:

```json
{
  "title": "Database Connection Failure",
  "description": "Application cannot connect to the production database.",
  "severity": "critical",
  "status": "open",
  "source": "manual"
}
```

### Supported Severity Levels

- Low
- Medium
- High
- Critical

### Supported Incident Statuses

- Open
- Investigating
- Resolved

## Current Development Progress

- [x] Project structure setup
- [x] Python environment setup
- [x] FastAPI backend initialization
- [x] SQLite database integration
- [x] SQLAlchemy incident model
- [x] Pydantic validation schemas
- [x] Create incident API
- [x] Retrieve all incidents API
- [x] Retrieve incident by ID API
- [x] Update incident API
- [x] Delete incident API
- [x] Manual Swagger API testing

## Upcoming Features

- [ ] Application log file ingestion
- [ ] Log parsing and processing
- [ ] Automatic error detection
- [ ] Incident severity classification
- [ ] Automatic incident generation from logs
- [ ] AI-powered root cause analysis
- [ ] Retrieval-Augmented Generation (RAG)
- [ ] Knowledge base integration
- [ ] React + TypeScript dashboard
- [ ] Incident analytics and reporting
- [ ] Automated testing
- [ ] Docker integration
- [ ] CI/CD with GitHub Actions

## Project Goals

The long-term goal is to build a practical incident intelligence system that can:

1. Collect application logs.
2. Identify unusual behavior and errors.
3. Automatically generate incidents.
4. Classify incidents based on severity.
5. Provide AI-assisted root cause analysis.
6. Recommend troubleshooting steps using technical documentation.
7. Present incident information through an interactive dashboard.

## Learning Outcomes

This project provides practical experience with:

- REST API development
- Backend architecture
- Database design
- SQLAlchemy ORM
- Data validation
- API testing
- Git and GitHub workflows
- AI and machine learning integration (planned)

## Author

**Manohar**

GitHub: [@manohar-dev11](https://github.com/manohar-dev11)

---

*This project is under active development as a hands-on software engineering portfolio project.*
