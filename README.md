# GapFinder AI — Sphoorthy Engineering College Hackathon 2026

**AI-powered study gap analyzer, diagnostic tester, and actionable revision planner for engineering students.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![JavaScript](https://img.shields.io/badge/Language-JavaScript%20(ES6%2B%20%2F%20JSX)-yellow)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ecf8e)](https://supabase.com/)

---

## 1. Project Overview & Problem Statement

College students frequently revise topics they already understand while unconsciously neglecting their actual knowledge gaps. 

**GapFinder AI** solves this problem by directly analyzing the student's own curriculum materials (syllabi, lecture notes, textbook extracts, and question papers). Rather than being just another generic "chat with PDFs" wrapper, GapFinder AI:
1. **Maps your course curriculum** into concrete units and subtopics.
2. **Generates grounded diagnostic quizzes** exclusively from retrieved course material passages.
3. **Evaluates student answers** with exact citations, explaining both why the correct answer is right and why the chosen option was wrong.
4. **Calculates statistical topic gap classifications**:
   - **Weak**: `< 50%` accuracy
   - **Medium**: `50% to 79%` accuracy
   - **Strong**: `≥ 80%` accuracy
   - **Insufficient Data**: Flags topics with only 1 question to prevent premature classification.
5. **Generates an actionable revision timetable** that prioritizes weak topics without exceeding the student's daily study time budget.
6. **Provides a grounded Explain-This-Topic Assistant** that strictly refuses to hallucinate when topics are outside the uploaded materials.

---

## 2. Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                 STUDENT / JUDGE                                   |
+-----------------------------------------+-----------------------------------------+
                                          |
                      +-------------------+-------------------+
                      |                                       |
                      v                                       v
         [ 1-Click Demo / Login ]                [ Upload PDF / TXT ]
                      |                                       |
                      v                                       v
         [ Local / Supabase Store ]            [ Text Extractor (pdf-parse) ]
                      |                                       |
                      |                                       v
                      |                         [ Semantic Chunker (~1200 chars) ]
                      |                                       |
                      |                                       v
                      |                         [ Vector Embeddings Generator ]
                      |                          (TF-IDF Cosine & Gemini 004)
                      |                                       |
                      +---------------------------------------+
                                          |
                                          v
                              +-----------------------+
                              |   RAG Vector Store    |
                              +-----------+-----------+
                                          |
            +-----------------------------+-----------------------------+
            |                             |                             |
            v                             v                             v
  [ Diagnostic Quiz Engine ]      [ Gap Analysis Engine ]       [ Grounded QA Chat ]
  - Top-k passage retrieval       - Topic-level aggregation     - Strictly factual
  - 4 options, 1 correct          - Weak / Medium / Strong      - Exact citations
  - Hidden answers pre-submit     - Pedagogical actions         - Refusal on out-of-scope
            |                             |                             |
            +-----------------------------+-----------------------------+
                                          |
                                          v
                          [ Actionable Revision Planner ]
                          - Prioritizes weak topics (55%)
                          - Allocates within daily study budget
                          - Cites lecture notes & tasks
```

---

## 3. Technology Stack

- **Framework**: Next.js 14 App Router
- **Language**: JavaScript (ES6+ / JSX)
- **Styling**: Tailwind CSS with custom responsive design
- **Database & Auth**: Supabase PostgreSQL with `pgvector` support & Universal In-Memory Demo Storage
- **PDF Extraction**: `pdf-parse` with scanned image-only PDF detection
- **RAG & Vector Retrieval**:
  - Semantic sliding window chunker with section & page tracking
  - Hybrid retrieval: Cosine Similarity with Dense Vector Projections + BM25 keyword weighting
  - Built-in deterministic vector embedding engine + optional Google Gemini (`text-embedding-004`)
- **LLM Grounding Engine**: Google Gemini API (`gemini-1.5-flash`) / OpenAI with deterministic rule-based grounded synthesis fallback

---

## 4. Key Hackathon Features

| Feature | Description |
|---|---|
| **A. Authentication** | Supabase Auth + 1-Click Demo Judge Access (`judge@sphoorthy.edu`). |
| **B. Material Upload** | PDF & TXT file upload with scanned image-only detection (prompts user for OCR). |
| **C. Topic Mapping** | Auto-extracts units and topics from syllabus; correlates notes passages. |
| **D. True RAG Pipeline** | Overlapping chunking, vector embeddings, top-k cosine similarity retrieval, citations. |
| **E. Diagnostic Quiz** | 5+ multiple-choice questions grounded in retrieved passages; answers hidden until submit. |
| **F. Answer Evaluation** | Computes score, explains why correct answer is right and why selected option is wrong. |
| **G. Gap Report** | Classifies topics into Weak, Medium, Strong, or Insufficient Data with reasons & actions. |
| **H. Revision Plan** | Allocates daily study minutes (e.g. 60m), prioritizing weak topics without exceeding limit. |
| **I. Explain-This-Topic** | Grounded Q&A assistant citing document & section; explicitly refuses out-of-source queries. |
| **J. Progress Dashboard** | Real-time statistics, topic proficiency bars, and score progression history. |

---

## 5. Quick Start & Local Setup

### Prerequisites
- Node.js `v18+` or `v20+` or `v22+`
- npm

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/gapfinder-ai.git
cd gapfinder-ai

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Demo Testing Guide for Hackathon Judges

To evaluate the full workflow immediately:
1. Open [http://localhost:3000](http://localhost:3000) and click **"Launch Demo Mode for Judges"**.
2. **Review Uploaded Materials**: Go to **"My Materials"** to inspect pre-seeded Sphoorthy Engineering College **Data Structures (CS301PC)** syllabus and comprehensive lecture notes.
3. **Inspect Topic Map**: Open **"Topic Map"** to see Units I to V mapped directly to lecture note passages.
4. **Take Diagnostic Quiz**:
   - Go to **"Diagnostic Quiz"**.
   - Select "All Topics" and 5 questions, then click **"Generate Diagnostic Quiz"**.
   - Select your answers and click **"Submit Diagnostic Quiz"**.
   - Observe the score, explanations, and verbatim citations.
5. **View Gap Report**:
   - Go to **"Gap Report"** to view topic mastery classifications (`Weak`, `Medium`, `Strong`, or `Insufficient Data`).
6. **Generate Revision Plan**:
   - Go to **"Revision Plan"**.
   - Set available daily time (e.g., 60 minutes) and click **"Generate Revision Plan"**.
   - Verify that tasks prioritize weak topics and total planned time strictly does not exceed 60 minutes.
7. **Ask Your Material**:
   - Go to **"Ask Your Material"**.
   - Click a preset prompt like *"What is the balance factor condition for an AVL tree?"* to verify cited answers.
   - Click an out-of-syllabus prompt like *"Explain quantum teleportation"* to verify that the assistant strictly refuses to hallucinate.

---

## 7. Supabase Database Setup & Schema

If connecting to a Supabase project:
1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Copy and run the entire SQL script from [`supabase/schema.sql`](supabase/schema.sql).
4. The schema enables:
   - `vector` extension
   - `profiles` table with Row Level Security (RLS)
   - `documents` and `document_chunks` with `vector(768)`
   - `topics`, `quizzes`, `questions`, `quiz_attempts`, and `revision_plans`
   - `match_document_chunks` RPC function for semantic similarity retrieval.

---

## 8. Environment Variables Configuration

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Gemini API Key (Optional: for cloud embeddings and generative responses)
GEMINI_API_KEY=AIzaSy...
```

*Note: If `GEMINI_API_KEY` is not provided, GapFinder AI uses its built-in deterministic TF-IDF Cosine Similarity RAG engine, ensuring tests never fail or hallucinate!*

---

## 9. Vercel Deployment Instructions

1. Push the repository to GitHub.
2. Sign in to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import your `gapfinder-ai` repository.
4. Add the environment variables from `.env.local`.
5. Click **"Deploy"**. The app will build and deploy on Vercel's global edge network.

---

## 10. Limitations & Future Enhancements

- **Handwritten Notes OCR**: Currently handles selectable digital PDFs and text files; image-based scanned notes require user OCR. Future upgrade: Tesseract / Google Cloud Vision OCR integration.
- **Adaptive Difficulty**: Dynamically scaling quiz question difficulty from Bloom's Taxonomy Level 1 (Recall) to Level 4 (Analysis) as topic accuracy improves.
- **Canvas / Blackboard LMS Integration**: One-click import of syllabi and course assignments from university LMS portals.

---

Developed for **Sphoorthy Engineering College Hackathon 2026**.
