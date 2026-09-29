# GeM Compliance AI v2.1

## Improvements
- Premium command-center frontend with responsive layout, sidebar navigation, KPI cards, upload dropzone, pipeline view, toast notifications, health check and polished results table.
- Backend version updated to 2.1.0.
- SQLite now stores uploads and analysis runs.
- Existing synthetic sandbox verification remains intentionally local and non-official.

## Run
```cmd
cd backend
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```
In another terminal:
```cmd
cd frontend
python -m http.server 5500
```
Open http://127.0.0.1:5500
