@echo off
cd /d "%~dp0"
call npm ci --ignore-scripts
if errorlevel 1 goto failed
call npm run build
if errorlevel 1 goto failed
call npm run setup
if errorlevel 1 goto failed
call npm run register
if errorlevel 1 goto failed
echo Setup complete. Open start.cmd to keep the bot running.
pause
exit /b 0
:failed
echo Setup stopped. Read the error above and README.md.
pause
exit /b 1
