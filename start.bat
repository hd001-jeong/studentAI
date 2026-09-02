@echo off
title StudentAI Launcher

echo ==============================
echo       StudentAI START
echo ==============================

echo [1] FastAPI Backend Starting...
start "StudentAI Backend" cmd /k "cd /d "%~dp0backend" && venv\Scripts\python.exe -m uvicorn main:app --reload"

echo [2] React Frontend Starting...
start "StudentAI Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ==============================
echo StudentAI started!
echo Backend  : http://127.0.0.1:8000
echo Frontend : http://localhost:5173
echo ==============================