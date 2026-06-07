@echo off
title FlowForge Portable
echo Initializing...

:: Finds the Process ID (PID) using port 8188 and terminates it safely if it exists
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8188 ^| findstr LISTENING') do (taskkill /f /pid %%a >nul 2>&1)

:: Starts ComfyUI in a background process and immediately continues script execution
start "" /b .\ComfyUI_windows_portable\python_embeded\python.exe -s ComfyUI_windows_portable\ComfyUI\main.py --windows-standalone-build --disable-auto-launch

:: Pauses for 10 seconds to allow the ComfyUI server to boot up and open the port
timeout /t 10 /nobreak >nul

echo Running workflow...
.\ComfyUI_windows_portable\python_embeded\python.exe run_workflow.py

:: Finds the Process ID (PID) using port 8188 and terminates it safely if it exists
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8188 ^| findstr LISTENING') do (taskkill /f /pid %%a >nul 2>&1)

pause