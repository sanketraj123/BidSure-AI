from pathlib import Path
from pypdf import PdfReader

def extract_pdf_text(path: Path) -> str:
    text_parts = []
    try:
        reader = PdfReader(str(path))
        for page in reader.pages:
            text_parts.append(page.extract_text() or "")
    except Exception:
        return ""
    return "\n".join(text_parts)
