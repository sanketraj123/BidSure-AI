CREATE TABLE IF NOT EXISTS uploads (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    document_type TEXT NOT NULL,
    extracted_json TEXT NOT NULL,
    created_at TEXT NOT NULL
);
