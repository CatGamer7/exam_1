# Dental BI Dashboard

A full-stack analytical dashboard built with FastAPI, React, Plotly, and PostgreSQL, designed to replace Yandex DataLens for the Dental Clinic dataset.

## Architecture
- **Backend**: FastAPI (Python 3.12) + Pandas (In-memory analytics)
- **Frontend**: React 18 + TypeScript + Vite + Plotly.js + Ant Design
- **Database**: PostgreSQL 16
- **Infrastructure**: Docker Compose (Dev/Prod profiles)

## Quick Start (Development Mode)

In development mode, the backend uses `uvicorn --reload` and the frontend uses the Vite dev server with Hot Module Replacement (HMR). Code is mounted via volumes, so changes reflect instantly.

1. **Prepare the Data**: 
   Ensure your cleaned dataset from Part A is exported as `data/out/cleaned_dataset.csv` (UTF-8 encoded).
2. **Start the Stack**:
   ```bash
   docker-compose up --build
   ```
3. **Access the App**:
   - Frontend (Vite Dev Server): [http://localhost:5173](http://localhost:5173)
   - Backend API (Swagger UI): [http://localhost:8000/docs](http://localhost:8000/docs)
   - Database: `localhost:5432` (User: `admin`, Pass: `secret`, DB: `dental_bi`)

*Note: The `ingest` container will automatically run once to create the schema and load the CSV data, then exit.*

## Release Mode (Production)

In release mode, the frontend is baked into an Nginx image, and the backend runs without hot-reloading.

1. **Switch to Production Build**:
   Open `docker-compose.yml` and uncomment the `target: prod` lines for the `backend` and `frontend` services.
   ```yaml
   backend:
     build: 
       context: ./backend
       target: prod # <--- Uncomment
   frontend:
     build: 
       context: ./frontend
       target: prod # <--- Uncomment
   ```
2. **Rebuild and Run**:
   ```bash
   docker-compose -f docker-compose.yml up --build
   ```
3. **Access the App**:
   - Frontend & API (via Nginx): [http://localhost:80](http://localhost:80)

## 🛠 Useful Commands

| Action | Command |
| :--- | :--- |
| **Start in Dev Mode** | `docker-compose up` |
| **Start in Prod Mode** | `docker-compose -f docker-compose.yml up` |
| **Rebuild Images** | `docker-compose up --build` |
| **Stop & Remove Containers** | `docker-compose down` |
| **Stop & Remove Containers + DB Data** | `docker-compose down -v` |
| **View Logs (All)** | `docker-compose logs -f` |
| **View Logs (Specific Service)** | `docker-compose logs -f backend` |
| **Re-run Data Ingestion** | `docker-compose run --rm ingest` |

## Project Structure

```text
├── backend/           # FastAPI application
│   ├── app/
│   │   ├── routers/   # API endpoints
│   │   ├── main.py    # FastAPI app instance
│   │   ├── db.py      # DB connection & caching
│   │   └── schemas.py # Pydantic models
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/          # React + Vite + Plotly application
│   ├── src/
│   │   ├── components/# UI components (Charts, Filters, Layout)
│   │   ├── App.tsx    # Main layout
│   │   ├── api.ts     # Axios API calls
│   │   └── main.tsx   # React entry point
│   ├── Dockerfile
│   ├── nginx.conf     # Nginx config for Prod
│   └── package.json
├── ingest/            # Standalone script for DDL/DML
│   ├── main.py        # Ingestion logic
│   ├── Dockerfile
│   └── requirements.txt
├── data/
│   └── out/           # Cleaned dataset (cleaned_dataset.csv)
├── docker-compose.yml           # Base config (Prod-ready)
└── docker-compose.override.yml  # Dev overrides (Volumes, HMR)
```