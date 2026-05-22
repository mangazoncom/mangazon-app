@echo off
title Text Converter - Startup Script
cls

echo ==========================================================
echo  Text Converter App (Local Startup Script)
echo ==========================================================
echo.
echo Requirements: Node.js (https://nodejs.org)
echo.

rem Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is not found.
    echo Please install Node.js from https://nodejs.org
    echo.
    pause
    exit /b 1
)

rem Check if node_modules exists, if not, run npm install
if not exist "node_modules" (
    echo [1/2] Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] "npm install" failed.
        pause
        exit /b 1
    )
)

rem Open browser
echo [2/2] Opening browser at http://localhost:3000...
start "" "http://localhost:3000"

rem Run the local server
call npm run dev
if errorlevel 1 (
    echo [ERROR] Failed to start local server.
    pause
    exit /b 1
)
