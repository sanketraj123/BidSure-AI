# 🚀 BidSure AI
### AI-Powered Procurement Compliance & Bidder Verification Platform

**Verify Smarter. Procure with Confidence.**

BidSure AI is an intelligent procurement compliance and bidder verification platform designed to streamline the evaluation of Government e-Marketplace (GeM) tenders. It analyzes tender and bidder documents, extracts relevant information, evaluates compliance requirements, identifies potential risks, and generates AI-assisted recommendations through an interactive dashboard.

🌐 **Live Demo:** https://bidsure-ai-sanket.vercel.app/

📂 **GitHub Repository:** https://github.com/sanketraj123/BidSure-AI

---

## 🎯 Project Overview

Government procurement involves verifying multiple statutory, financial, technical, and eligibility requirements before qualifying bidders.

BidSure AI aims to simplify this process through automated document extraction, compliance verification, risk assessment, and audit-ready reporting.

The platform provides a centralized workspace where procurement officers can review bidder compliance and make informed decisions.

## ✨ Key Features

### 📄 1. Document Ingestion & Extraction
- Upload tender and bidder PDF documents.
- Extract relevant information from uploaded documents.
- Organize bidder evidence for compliance evaluation.

### 🤖 2. AI-Assisted Compliance Verification
- Evaluate 13 compliance requirements.
- Verify GST registration, PAN and Udyam/MSME identifiers.
- Check statutory and tender-specific documentation.
- Identify missing, inconsistent and non-compliant evidence.

### 📊 3. Compliance Scoring & Risk Assessment
- Generate an automated compliance score.
- Classify bidders into three risk levels:
  - 🟢 Low Risk
  - 🟡 Medium Risk
  - 🔴 High Risk
- Display compliant, non-compliant and pending requirements.

### 🧠 4. AI-Powered Recommendations
- Generate recommendations based on verification results.
- Highlight missing documentation.
- Support procurement officers in reviewing potential compliance risks.

### 📋 5. Audit Trail & Reporting
- Generate unique analysis records.
- Maintain verification summaries.
- Export JSON audit reports.
- Track compliance scores, risk levels and recommendations.

### 👨‍💼 6. Procurement Officer Review
- Review bidder compliance results.
- Examine risk assessments and AI recommendations.
- Record qualification decisions and remarks.
- Keep final procurement decisions under human supervision.

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Programming Language | Python |
| Backend | FastAPI |
| Frontend | HTML, CSS, JavaScript |
| Database | PostgreSQL / Project database components |
| Document Processing | PDF Text Extraction |
| API Testing | FastAPI Swagger UI |
| Version Control | Git & GitHub |
| Backend Deployment | Render |
| Frontend Deployment | Vercel |

## 🏗️ Project Architecture

```text
BidSure-AI/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   └── services/
│   ├── sandbox/
│   ├── uploads/
│   └── requirements.txt
│
├── frontend/
│   ├── index.html
│   ├── css/
│   └── js/
│
├── database/
├── sample_evidence/
├── .gitignore
└── README.md
```

## ⚙️ Run Locally on Windows

### Prerequisites
- Python installed
- Git installed
- Visual Studio Code (recommended)

### 1. Clone the Repository

```cmd
git clone https://github.com/sanketraj123/BidSure-AI.git
```

### 2. Navigate to the Project

```cmd
cd BidSure-AI
```

### 3. Start the Backend

Open a terminal:

```cmd
cd backend
python -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Backend API:

http://127.0.0.1:8000

API Documentation:

http://127.0.0.1:8000/docs

### 4. Start the Frontend

Open a second terminal:

```cmd
cd frontend
python -m http.server 5500
```

Open the application:

http://127.0.0.1:5500

## 🔐 Verification Disclaimer

**Synthetic Sandbox Prototype**

This project currently uses synthetic verification data and simulated government verification responses for demonstration and testing purposes.

It is not connected to official government verification APIs or databases.

The compliance assessment and AI-generated recommendations are intended to assist the procurement review process. Final bidder qualification or disqualification decisions remain the responsibility of the authorized Procurement Officer.

## 🎯 Expected Impact

- Reduce manual document verification effort.
- Improve bidder evaluation efficiency.
- Identify missing and inconsistent documentation.
- Support risk-based procurement assessment.
- Improve transparency through audit-ready records.
- Standardize compliance review workflows.

## 👨‍💻 Developer

**Sanket Rajgude**

BE – Artificial Intelligence & Data Science

Interested in Artificial Intelligence, Python Development, Automation and Building Real-World Technology Solutions.

## 📬 Project Links

- 🌐 Live Application: https://bidsure-ai-sanket.vercel.app/
- 💻 GitHub: https://github.com/sanketraj123/BidSure-AI
- ⚡ Backend API: https://gem-compliance-ai-tjr8.onrender.com
- 📖 API Documentation: https://gem-compliance-ai-tjr8.onrender.com/docs

---

⭐ If you find this project interesting, feel free to explore the repository and share your feedback.

**BidSure AI — Verify Smarter. Procure with Confidence.**
