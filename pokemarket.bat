@echo off
REM ============================================================
REM  PokeMarket.ai launcher
REM  Put this file in D:\gemini\pokemon-agent (the PROJECT ROOT:
REM  the folder containing venv, .env, and the pokemon_agent folder).
REM  Double-click to start the whole app.
REM ============================================================

cd /d %~dp0

REM --- 1. Free up port 8000 if a stale agent is still holding it ---
echo Clearing any old agent on port 8000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do taskkill /PID %%a /F >nul 2>&1

REM --- 2. Activate the virtual environment ---
call venv\Scripts\activate.bat

REM --- 3. Start the agent backend (with CORS allowed) ---
echo Starting the agent backend...
start "PokeMarket Agent" cmd /k "adk api_server --port 8000 --allow_origins=regex:.* ."

REM --- 4. Wait for the agent to boot ---
echo Waiting for the agent to start...
timeout /t 8 /nobreak >nul

REM --- 5. Start the web server that serves the page ---
echo Starting the web server...
start "PokeMarket Web" cmd /k "python -m http.server 5500"

REM --- 6. Open the app in the browser ---
timeout /t 2 /nobreak >nul
echo Opening PokeMarket.ai...
start "" "http://127.0.0.1:5500/pokemon_agent/pokemarket.html"

echo.
echo ============================================================
echo  PokeMarket.ai is starting. Two helper windows opened:
echo    - "PokeMarket Agent"  (the AI backend, port 8000)
echo    - "PokeMarket Web"    (serves the page, port 5500)
echo.
echo  TIP: the first message is slow (the agent warms up).
echo       Send "how many cards are in the database?" once to warm it.
echo.
echo  To STOP the app, close both helper windows.
echo ============================================================
echo Press any key to close this window (the app keeps running).
pause >nul