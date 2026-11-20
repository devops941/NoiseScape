@echo off
title NoiseScape - Backend API (FastAPI)
cd /d "%~dp0backend"
call venv\Scripts\activate.bat
echo ========================================================
echo   Starting NoiseScape FastAPI Backend Server...
echo   URL: http://localhost:8000
echo   Docs: http://localhost:8000/docs
echo ========================================================
uvicorn app.main:app --reload --port 8000
pause

