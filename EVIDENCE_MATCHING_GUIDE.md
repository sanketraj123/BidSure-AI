# Evidence Matching Upgrade

1. Start the backend and frontend as described in README.md.
2. Open http://127.0.0.1:5500
3. In the file picker, select multiple PDFs using Ctrl-click.
4. For a full compliant demonstration, select:
   - sample_bidder_compliance_document.pdf
   - sample_evidence/company_profile.pdf
   - sample_evidence/oem_authorization.pdf
   - sample_evidence/experience_certificate.pdf
   - sample_evidence/no_blacklisting_declaration.pdf
   - sample_evidence/technical_compliance_sheet.pdf
5. Click Upload & Extract, then Run Compliance Analysis.

Expected synthetic result: all 8 requirements Compliant and Risk Low.

The matching is keyword-based and synthetic. It is not official GeM, GST, PAN, Udyam, or government verification.
