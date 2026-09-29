# GeM Compliance AI — Premium Frontend

This package replaces the existing `frontend` folder with a premium procurement/evidence workspace UI.

## Design direction
- Editorial / premium dashboard aesthetic inspired by high-end SaaS and portfolio interfaces.
- Dark navy + restrained violet visual system.
- Strong typography, generous whitespace, cards with subtle borders/shadows.
- Sidebar navigation, hero command center, upload workspace, metrics, requirement matrix and evidence cards.
- Responsive for laptop and mobile.
- No framework/build step required.

## API expectation
The frontend expects the FastAPI backend at:
`http://127.0.0.1:8000`

Endpoints used:
- `POST /api/documents/upload`
- `POST /api/analysis/run`

## Install
Copy this package's `frontend` contents over the existing project `frontend` folder.

Then run the backend normally and open `frontend/index.html` through VS Code Live Server.

Important: verification remains synthetic in the current prototype.
