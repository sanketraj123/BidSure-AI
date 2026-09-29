# GeM Compliance AI — Evidence Workspace v2

A local Smart India Hackathon prototype for synthetic GeM bid compliance demonstrations.

## Improvements in v2
- Modern responsive UI with clear ingestion, analysis and results sections.
- Multi-PDF upload with document category selection.
- Evidence keyword mapping for 8 requirements.
- SQLite upload history database.
- Backend health and API documentation endpoints.
- Exportable JSON audit report.

## Run on Windows

### Backend terminal
```cmd
cd backend
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

### Frontend terminal
```cmd
cd frontend
python -m http.server 5500
```
Open http://127.0.0.1:5500

**Important:** All verification data is synthetic. This prototype is not connected to official government APIs.
