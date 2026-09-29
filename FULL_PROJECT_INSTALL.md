# Full Project Installation

This ZIP contains the complete GeM Compliance AI project with the premium frontend integrated.

## Run backend (Windows CMD)

Open CMD in the project root, then run:

```cmd
cd backend
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

Keep this terminal open.

## Run frontend

Open the `frontend` folder in VS Code and run `index.html` with Live Server.

The frontend connects to:

`http://127.0.0.1:8000/api`

## Important

- Do not include or copy an old `.venv` folder from another project.
- The sandbox data is synthetic and is not official government verification.
- Upload tender PDF as Tender and bidder/supporting PDFs as Bidder Evidence.
