@echo off
title Uninstall ExamSewa Virtual Camera
openfiles >nul 2>&1
if %errorlevel% neq 0 (
    echo Please run as Administrator!
    pause
    exit /b
)
set TARGET_DIR=%ProgramFiles%\ExamSewaCam
if exist "%TARGET_DIR%\ExamSewaCam.dll" (
    regsvr32 /u /s "%TARGET_DIR%\ExamSewaCam.dll"
    rmdir /S /Q "%TARGET_DIR%"
)
echo ExamSewa Virtual Camera successfully uninstalled.
pause
