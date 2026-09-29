# Deployment Notes

## Frontend (Vercel)
Deploy the `frontend` directory as a static site. Update `frontend/js/api.js`
with the deployed backend URL.

## Backend (Render Free)
- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

For production, configure persistent storage, CORS restrictions, authentication,
and a managed database. This prototype uses in-memory demo records by default.
