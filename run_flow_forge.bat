@echo off
title FlowForge Portable
echo Initializing...

:: Terminates existing processes on ports 8188 (ComfyUI) and 8000 (API)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8188 ^| findstr LISTENING') do (taskkill /f /pid %%a >nul 2>&1)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (taskkill /f /pid %%a >nul 2>&1)

:: Starts ComfyUI in background
start "" /b .\ComfyUI_windows_portable\python_embeded\python.exe -s ComfyUI_windows_portable\ComfyUI\main.py --windows-standalone-build --disable-auto-launch

timeout /t 10 /nobreak >nul

echo Starting FlowForge API...
:: Launches FastAPI using uvicorn for maximum stability in the embedded environment
:: Added --reload to help you during the development phase
.\ComfyUI_windows_portable\python_embeded\python.exe -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload

:: Final cleanup after the API is closed
echo Cleaning up processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8188 ^| findstr LISTENING') do (taskkill /f /pid %%a >nul 2>&1)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (taskkill /f /pid %%a >nul 2>&1)

pause