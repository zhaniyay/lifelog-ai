# LifeLog AI

A full-stack application for logging and analyzing life activities using AI.

## Features

- 🔐 Google OAuth authentication
- 📁 File uploads (text, audio, images)
- 🎵 Audio transcription with OpenAI Whisper
- 📷 Image text extraction with Tesseract OCR
- 🗄️ PostgreSQL data storage
- 📅 Chronological timeline UI
- 📊 Weekly AI-generated summaries
- 🔍 Semantic search with Sentence Transformers
- ⚡ Background processing with Celery + Redis
- 🐳 Docker containerization

## Tech Stack

### Backend
- FastAPI
- PostgreSQL
- Celery + Redis
- OpenAI Whisper
- Tesseract OCR
- Sentence Transformers
- FAISS

### Frontend
- Next.js
- Tailwind CSS
- TypeScript

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your API keys
3. Run with Docker:
   ```bash
   docker-compose up --build
   ```

## Environment Variables

- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `OPENAI_API_KEY`: OpenAI API key for GPT-4 and Whisper
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Secret for JWT tokens

## Project Structure

```
lifelog-ai/
├── backend/          # FastAPI backend
├── frontend/         # Next.js frontend
├── docker-compose.yml
├── .env.example
└── README.md
```
