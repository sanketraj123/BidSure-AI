from pathlib import Path
import json
from app.sandbox.mock_data import MOCK_RECORDS
Path("database/mock_records.json").write_text(json.dumps(MOCK_RECORDS, indent=2))
print("Synthetic sandbox records exported.")
