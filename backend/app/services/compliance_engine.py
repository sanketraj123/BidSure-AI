from datetime import datetime, timezone

from app.sandbox.mock_api import verify_all


DEFAULT_REQUIREMENTS = [
    {
        "id": "GST-01",
        "name": "GST Registration",
        "field": "gstin",
        "mandatory": True,
        "category": "Identity"
    },
    {
        "id": "PAN-01",
        "name": "PAN Verification",
        "field": "pan",
        "mandatory": True,
        "category": "Identity"
    },
    {
        "id": "UDY-01",
        "name": "Udyam/MSME Registration",
        "field": "udyam",
        "mandatory": False,
        "category": "Identity"
    },
    {
        "id": "DOC-01",
        "name": "Company Profile",
        "field": "company_profile",
        "mandatory": True,
        "category": "Evidence"
    },
    {
        "id": "DOC-02",
        "name": "OEM Authorization",
        "field": "oem_authorization",
        "mandatory": True,
        "category": "Evidence"
    },
    {
        "id": "DOC-03",
        "name": "Experience",
        "field": "experience",
        "mandatory": True,
        "category": "Evidence"
    },
    {
        "id": "DOC-04",
        "name": "No Blacklisting Declaration",
        "field": "no_blacklisting",
        "mandatory": True,
        "category": "Evidence"
    },
    {
        "id": "DOC-05",
        "name": "Technical Compliance",
        "field": "technical_compliance",
        "mandatory": True,
        "category": "Evidence"
    },
    {
        "id": "MII-01",
        "name": "Make in India / Local Content",
        "field": "make_in_india",
        "mandatory": False,
        "category": "Statutory"
    },
    {
        "id": "EPFO-01",
        "name": "EPFO Compliance",
        "field": "epfo",
        "mandatory": False,
        "category": "Statutory"
    },
    {
        "id": "ESIC-01",
        "name": "ESIC Compliance",
        "field": "esic",
        "mandatory": False,
        "category": "Statutory"
    },
    {
        "id": "STARTUP-01",
        "name": "Startup India",
        "field": "startup_india",
        "mandatory": False,
        "category": "Registration"
    },
    {
        "id": "NSIC-01",
        "name": "NSIC Registration",
        "field": "nsic",
        "mandatory": False,
        "category": "Registration"
    },
]


def analyze(extracted: dict, requirements=None):
    requirements = requirements or DEFAULT_REQUIREMENTS

    # -----------------------------------------
    # Analysis Timestamp
    # -----------------------------------------
    analysis_time = datetime.now(
        timezone.utc
    ).isoformat()

    # -----------------------------------------
    # Run Synthetic Government Verification
    # -----------------------------------------
    verification = verify_all(extracted)

    rows = []

    for req in requirements:
        field = req["field"]
        value = extracted.get(field)

        # -----------------------------------------
        # Document / Evidence Requirements
        # -----------------------------------------
        if field in {
            "company_profile",
            "oem_authorization",
            "experience",
            "no_blacklisting",
            "technical_compliance",
            "make_in_india",
            "epfo",
            "esic",
            "startup_india",
            "nsic"
        }:

            status = (
                "Compliant"
                if value is True
                else "Pending"
            )

            reason = (
                "Evidence keyword detected and mapped."
                if value is True
                else "Expected evidence was not detected in the submitted documents."
            )

        # -----------------------------------------
        # Government Identity Requirements
        # -----------------------------------------
        else:
            api_result = verification.get(
                field,
                {}
            )

            if not value:
                status = "Pending"

                reason = (
                    "Required identifier was not extracted "
                    "from the submitted documents."
                )

            elif api_result.get("valid"):
                status = "Compliant"

                reason = api_result.get(
                    "message",
                    "Synthetic government sandbox verification passed."
                )

                portal = api_result.get(
                    "portal"
                )

                if portal:
                    reason = (
                        f"{reason} Portal: {portal}."
                    )

            else:
                status = "Non-Compliant"

                reason = api_result.get(
                    "message",
                    "Synthetic government sandbox verification failed."
                )

                portal = api_result.get(
                    "portal"
                )

                if portal:
                    reason = (
                        f"{reason} Portal: {portal}."
                    )

        # -----------------------------------------
        # Store Requirement Result
        # -----------------------------------------
        rows.append({
            **req,
            "status": status,
            "reason": reason,
            "evidence": f"extracted.{field}",
            "sandbox": True
        })

    # -----------------------------------------
    # Count Results
    # -----------------------------------------
    counts = {
        status: sum(
            1
            for row in rows
            if row["status"] == status
        )
        for status in [
            "Compliant",
            "Non-Compliant",
            "Pending"
        ]
    }

    # -----------------------------------------
    # Compliance Score
    # -----------------------------------------
    total_checks = len(rows)

    if total_checks > 0:
        compliance_score = round(
            (
                counts["Compliant"] /
                total_checks
            ) * 100
        )
    else:
        compliance_score = 0

    # -----------------------------------------
    # Risk Calculation
    # -----------------------------------------
    if counts["Non-Compliant"]:
        risk = "High"

    elif counts["Pending"]:
        risk = "Medium"

    else:
        risk = "Low"

    # -----------------------------------------
    # AI Recommendation
    # -----------------------------------------
    if risk == "High":

        recommendation = (
            "High-risk bidder detected. Review non-compliant identity "
            "and statutory checks and resolve pending evidence before "
            "procurement decision."
        )

    elif risk == "Medium":

        recommendation = (
            "Bidder has unresolved requirements. Review pending evidence "
            "and complete verification before final procurement decision."
        )

    else:

        recommendation = (
            "Bidder evidence is currently compliant in the synthetic "
            "sandbox. Proceed with procurement officer review and final decision."
        )

    # -----------------------------------------
    # Audit Trail
    # -----------------------------------------
    audit_trail = {
        "analysis_id": (
            "AUDIT-"
            + datetime.now(
                timezone.utc
            ).strftime("%Y%m%d%H%M%S%f")
        ),
        "timestamp_utc": analysis_time,
        "event": "Bidder Compliance Analysis",
        "verification_mode": "Synthetic Government Sandbox",
        "total_checks": total_checks,
        "compliant": counts["Compliant"],
        "non_compliant": counts["Non-Compliant"],
        "pending": counts["Pending"],
        "compliance_score": compliance_score,
        "risk": risk,
        "ai_recommendation": recommendation,
        "final_decision": (
            "Pending Procurement Officer Review"
        )
    }

    # -----------------------------------------
    # Final Analysis Result
    # -----------------------------------------
    return {
        "requirements": rows,
        "counts": counts,
        "risk": risk,
        "compliance_score": compliance_score,
        "recommendation": recommendation,
        "verification": verification,
        "audit_trail": audit_trail,
        "note": (
            "Government checks use a synthetic prototype sandbox. "
            "Official API verification can replace these connectors "
            "when authorized access is available."
        )
    }