@echo off
title FlowForge Portable
echo Initializing...

:: 1. Clean up ports
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8188 ^| findstr LISTENING') do (taskkill /f /pid %%a >nul 2>&1)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (taskkill /f /pid %%a >nul 2>&1)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (taskkill /f /pid %%a >nul 2>&1)

:: 2. Start ComfyUI in background
start "" /b .\ComfyUI_windows_portable\python_embeded\python.exe -s ComfyUI_windows_portable\ComfyUI\main.py --windows-standalone-build --disable-auto-launch

timeout /t 10 /nobreak >nul

:: 3. Setup and start Frontend
echo Starting Frontend...
cd frontend

if not exist "node_modules" (
    echo Installing missing dependencies...
    call npm install
)
start "" /b npm run dev
cd ..

:: 4. Start the browser launcher using a clean Python script
echo Preparing browser launcher...
echo import urllib.request, time, os > launch_browser.py
echo while True: >> launch_browser.py
echo     try: >> launch_browser.py
echo         if urllib.request.urlopen('http://localhost:8000').getcode() == 200: >> launch_browser.py
echo             os.system('start http://localhost:5173') >> launch_browser.py
echo             break >> launch_browser.py
echo     except: >> launch_browser.py
echo         pass >> launch_browser.py
echo     time.sleep(1) >> launch_browser.py

start "" /b .\ComfyUI_windows_portable\python_embeded\python.exe launch_browser.py

:: 5. Launch FastAPI (Blocks the main terminal window)
echo Starting FlowForge API...
.\ComfyUI_windows_portable\python_embeded\python.exe -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload

:: 6. Cleanup after API stops
:cleanup
echo.
echo Cleaning up processes...
:: /F = Force, /T = Terminate child processes as well
taskkill /f /t /im python.exe >nul 2>&1
taskkill /f /t /im node.exe >nul 2>&1

:: Double check with ports to ensure nothing is lingering
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8188 ^| findstr LISTENING') do (taskkill /f /pid %%a >nul 2>&1)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (taskkill /f /pid %%a >nul 2>&1)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (taskkill /f /pid %%a >nul 2>&1)

:: Delete the temporary launcher script
del launch_browser.py >nul 2>&1
echo Done. You can close this window now.
pause