# 🎯 RESUME ANALYZER.AI

A next-generation, high-performance AI-powered Applicant Tracking System (ATS) simulator and resume evaluator. Built to help candidates expose their resumes to advanced screening filters and optimize their compatibility before applying to jobs.

---

## ⚡ Core Features

- **🧠 Multi-Provider AI Engine:**
  - **Google Gemini 3.5 Flash** (with automatic fallback to `1.5-flash` or `2.0-flash` on server overload).
  - **OpenAI GPT-4o-mini**.
  - **Groq Llama-3.3-70B-Versatile** (lightning-fast, 100% free-tier).
- **📥 Dynamic Ingestion Console:**
  - **File Upload:** Direct PDF parsing of text vectors.
  - **Image OCR:** Optical Character Recognition for JPG/PNG uploads powered by WebAssembly-based Tesseract.js.
  - **Raw Text Paste:** Direct input parsing.
  - **Portfolio Link Scraper:** Integrated web crawler that scrapes public portfolios/websites, strips tag noise, and parses text into evaluation matrices.
- **📊 Advanced ATS Analytics:**
  - **Overall ATS Score:** Comparative alignment percentages.
  - **Estimated Shortlist Odds:** Recruiter probability ratings.
  - **Quantifiable Impact Match:** Evaluates whether career achievements are backed by data and metrics.
  - **Critical Red Flags:** Flags issues like missing contact details, tables, or lack of quantifiable metrics.
  - **Missing Industry Keywords:** Targets keyword gap metrics.
  - **Checklists:** Actionable structural and formatting feedback.
- **📄 Export Reports:** Saves evaluations as print-friendly PDF files with custom high-contrast CSS overrides.
- **🔑 Secure Authentication & Profile Sync:** Custom database authentication integrated with Google OAuth for automatic avatar profile synchronization.
- **📜 History Ledger:** View logs of past evaluations with option to permanently delete records.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React (Vite), Tailwind CSS, Lucide Icons, Axios |
| **Backend** | Node.js, Express, Prisma ORM, Multer, Tesseract.js, PDF-Parse |
| **Database** | Neon serverless PostgreSQL |
| **Deployment** | Vercel (Frontend Client) & Render (Backend Service) |

---

## ⚙️ Environment Configurations

Create a `.env` file inside the `backend` folder and add the following variables:

```env
# Database Credentials
DATABASE_URL="postgresql://user:password@neon.tech/dbname?sslmode=require"

# Client Routing Configuration
FRONTEND_URL="https://your-vercel-domain.vercel.app"

# Authentication Secrets
JWT_SECRET="your-jwt-signing-secret"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# Dynamic AI Settings
# Supported Providers: "gemini", "openai", "groq"
AI_PROVIDER="gemini"
AI_MODEL_NAME="gemini-3.5-flash"

# AI Provider API Keys
GEMINI_API_KEY="AIzaSy..."
OPENAI_API_KEY="sk-..."
GROQ_API_KEY="gsk_..."
```

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js installed on your system
- A PostgreSQL database instance (or Neon project)

### Setup Backend Server
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Push database migrations:
   ```bash
   npx prisma db push
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

### Setup Frontend Client
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```
