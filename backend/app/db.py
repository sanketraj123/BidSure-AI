from pathlib import Path
import sqlite3
from datetime import datetime, timezone

DB_PATH = Path(__file__).resolve().parents[2] / ".." / "database" / "gem_compliance.db"
DB_PATH = DB_PATH.resolve()
DB_PATH.parent.mkdir(parents=True, exist_ok=True)


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_connection() as conn:
        conn.execute("""
        CREATE TABLE IF NOT EXISTS uploads (
            id TEXT PRIMARY KEY,
            filename TEXT NOT NULL,
            document_type TEXT NOT NULL,
            extracted_json TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """)
        conn.execute("""
        CREATE TABLE IF NOT EXISTS analysis_runs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            result_json TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """)
        conn.commit()


def save_upload(file_id, filename, document_type, extracted_json):
    with get_connection() as conn:
        conn.execute(
            "INSERT INTO uploads VALUES (?, ?, ?, ?, ?)",
            (file_id, filename, document_type, extracted_json, datetime.now(timezone.utc).isoformat())
        )
        conn.commit()


def recent_uploads(limit=20):
    with get_connection() as conn:
        rows = conn.execute("SELECT * FROM uploads ORDER BY created_at DESC LIMIT ?", (limit,)).fetchall()
        return [dict(row) for row in rows]


def save_analysis(result_json):
    with get_connection() as conn:
        conn.execute("INSERT INTO analysis_runs (result_json, created_at) VALUES (?, ?)", (result_json, datetime.now(timezone.utc).isoformat()))
        conn.commit()
