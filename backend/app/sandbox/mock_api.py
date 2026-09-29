import re


def verify_gstin(value):
    if not value:
        return {
            "valid": False,
            "message": "GSTIN not provided"
        }

    value = str(value).strip().upper()

    pattern = r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$"

    if re.match(pattern, value):
        return {
            "valid": True,
            "status": "Active",
            "registration_status": "Active",
            "return_filing": "Regular",
            "portal": "GSTN",
            "message": "GST registration and return-filing status validated in synthetic sandbox.",
            "source": "GSTN Sandbox"
        }

    return {
        "valid": False,
        "status": "Invalid",
        "registration_status": "Invalid",
        "portal": "GSTN",
        "message": "GSTIN format is invalid.",
        "source": "GSTN Sandbox"
    }


def verify_pan(value):
    if not value:
        return {
            "valid": False,
            "message": "PAN not provided"
        }

    value = str(value).strip().upper()

    pattern = r"^[A-Z]{5}[0-9]{4}[A-Z]$"

    if re.match(pattern, value):
        return {
            "valid": True,
            "status": "Valid",
            "income_tax_status": "Compliant",
            "portal": "Income Tax",
            "message": "PAN and Income Tax identity validated in synthetic sandbox.",
            "source": "PAN/Income Tax Sandbox"
        }

    return {
        "valid": False,
        "status": "Invalid",
        "income_tax_status": "Unverified",
        "portal": "Income Tax",
        "message": "PAN format is invalid.",
        "source": "PAN/Income Tax Sandbox"
    }


def verify_udyam(value):
    if not value:
        return {
            "valid": False,
            "message": "Udyam number not provided"
        }

    value = str(value).strip().upper()

    pattern = r"^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7,10}$"

    if re.match(pattern, value):
        return {
            "valid": True,
            "status": "Active",
            "registration_status": "Active",
            "enterprise_type": "MSME",
            "portal": "Udyam",
            "message": "Udyam registration validated in synthetic sandbox.",
            "source": "Udyam Sandbox"
        }

    return {
        "valid": False,
        "status": "Invalid",
        "registration_status": "Invalid",
        "portal": "Udyam",
        "message": "Udyam number format is invalid.",
        "source": "Udyam Sandbox"
    }


def verify_all(extracted: dict) -> dict:
    return {
        "gstin": verify_gstin(extracted.get("gstin")),
        "pan": verify_pan(extracted.get("pan")),
        "udyam": verify_udyam(extracted.get("udyam"))
    }