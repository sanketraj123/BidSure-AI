import re


def extract_fields(text: str) -> dict:
    upper = text.upper()

    patterns = {
        "gstin": r"\bGSTIN\b\s*[:\-]?\s*([A-Z0-9][A-Z0-9\-]*)",
        "pan": r"\bPAN\b\s*[:\-]?\s*([A-Z0-9][A-Z0-9\-]*)",
        "udyam": r"\bUDYAM(?:\s*/?\s*MSME)?(?:\s+REGISTRATION)?(?:\s+NUMBER|\s+NO)?\s*[:\-]?\s*([A-Z0-9][A-Z0-9\-]*)",
    }

    result = {}

    for key, pattern in patterns.items():
        match = re.search(pattern, upper)

        if match:
            result[key] = match.group(1).strip()
        else:
            result[key] = None

    checks = {
        "company_profile": [
            "COMPANY PROFILE",
            "COMPANY INFORMATION",
        ],
        "oem_authorization": [
            "OEM AUTHORIZATION",
            "AUTHORIZED OEM",
            "OEM LETTER",
        ],
        "experience": [
            "EXPERIENCE",
            "WORK ORDER",
            "SUPPLY EXPERIENCE",
        ],
        "no_blacklisting": [
            "NO BLACKLISTING",
            "NOT BLACKLISTED",
            "BLACKLISTING DECLARATION",
            "NO BLACKLISTING / DEBARMENT",
            "NO ADVERSE RECORD",
        ],
        "technical_compliance": [
            "TECHNICAL COMPLIANCE",
            "TECHNICAL SPECIFICATION",
            "COMPLIANCE SHEET",
        ],
        "make_in_india": [
            "MAKE IN INDIA",
            "LOCAL CONTENT",
        ],
        "epfo": [
            "EPFO",
            "EMPLOYEES PROVIDENT FUND",
        ],
        "esic": [
            "ESIC",
            "EMPLOYEES STATE INSURANCE",
        ],
        "startup_india": [
            "STARTUP INDIA",
            "STARTUP RECOGNITION",
        ],
        "nsic": [
            "NSIC",
            "NSIC REGISTRATION",
        ],
    }

    for field, words in checks.items():
        result[field] = any(word in upper for word in words)

    return result