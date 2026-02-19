@echo off
echo Starting Gemini Quiz Master...
echo.
echo NOTE: Make sure you have opened "index.html" and entered your Gemini API Key.
echo.
echo Launching Google Chrome...

REM Try to launch Chrome with file access flags
start chrome --allow-file-access-from-files "%~dp0index.html"

REM If Chrome is not in PATH, you might need to specify the full path, e.g.:
REM "C:\Program Files\Google\Chrome\Application\chrome.exe" --allow-file-access-from-files "%~dp0index.html"
