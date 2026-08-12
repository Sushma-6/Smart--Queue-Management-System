@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   Smart Queue - Auto Demo Launcher
echo ========================================
echo.

REM --- Step 1: Detect current Wi-Fi IPv4 address ---
echo Detecting current IP address...

set "CURRENT_IP="
for /f "tokens=2 delims=:" %%A in ('ipconfig ^| findstr /C:"Wireless LAN adapter Wi-Fi" /A:1000') do (
    rem placeholder, not used directly
)

REM More reliable method: parse ipconfig output, find the block under "Wi-Fi" and grab IPv4 line
set "FOUND_WIFI_SECTION=0"
for /f "usebackq delims=" %%L in (`ipconfig`) do (
    set "LINE=%%L"
    echo !LINE! | findstr /C:"Wireless LAN adapter Wi-Fi" >nul
    if !errorlevel! equ 0 (
        set "FOUND_WIFI_SECTION=1"
    )
    if "!FOUND_WIFI_SECTION!"=="1" (
        echo !LINE! | findstr /C:"IPv4 Address" >nul
        if !errorlevel! equ 0 (
            for /f "tokens=2 delims=:" %%B in ("!LINE!") do (
                set "CURRENT_IP=%%B"
            )
            set "FOUND_WIFI_SECTION=0"
        )
    )
)

REM Trim leading space from IP
set "CURRENT_IP=%CURRENT_IP: =%"

if "%CURRENT_IP%"=="" (
    echo ERROR: Could not detect a Wi-Fi IPv4 address.
    echo Make sure you are connected to Wi-Fi, then try again.
    echo You can also open this file in a text editor and set CURRENT_IP manually.
    pause
    exit /b 1
)

echo Detected IP: %CURRENT_IP%
echo.

REM --- Step 2: Update client/.env with the detected IP ---
set "ENV_FILE=client\.env"

echo Updating %ENV_FILE% ...
(
    echo HOST=%CURRENT_IP%
    echo REACT_APP_HOST=%CURRENT_IP%
) > "%ENV_FILE%"

echo %ENV_FILE% updated successfully.
echo.

REM --- Step 3: Make sure MongoDB is running ---
echo Checking MongoDB service status...
sc query MongoDB | findstr /C:"RUNNING" >nul
if %errorlevel% equ 0 (
    echo MongoDB is already running.
) else (
    echo Starting MongoDB service...
    net start MongoDB
    if !errorlevel! neq 0 (
        echo.
        echo WARNING: Could not start MongoDB automatically.
        echo If this window is not running as Administrator, right-click
        echo this .bat file and choose "Run as administrator", then try again.
        echo.
        pause
    )
)
echo.

REM --- Step 4: Start backend server in a new window ---
echo Starting backend server...
start "Smart Queue - Server" cmd /k "cd /d %~dp0server && node server.js"

REM Give the server a moment to boot
timeout /t 3 /nobreak >nul

REM --- Step 5: Start frontend client in a new window ---
echo Starting frontend client...
start "Smart Queue - Client" cmd /k "cd /d %~dp0client && npm start"

echo.
echo ========================================
echo   All set!
echo   Your app should open shortly at:
echo   http://%CURRENT_IP%:3000
echo   Scan the QR code shown on that page.
echo ========================================
echo.
pause
