# NoiseGuard — Backend Service

FastAPI-powered REST backend for environmental noise monitoring, data ingestion, threshold calculation, and analytics reporting.

## Setup & Running

```bash
# 1. Create a virtual environment
python -m venv venv

# 2. Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Copy environment configuration
copy .env.example .env

# 5. Run development server
uvicorn app.main:app --reload --port 8000
```

## Running Unit Tests
```bash
pytest
```
Interactive API docs are available at `http://localhost:8000/docs` (Swagger UI) and `http://localhost:8000/redoc`.

