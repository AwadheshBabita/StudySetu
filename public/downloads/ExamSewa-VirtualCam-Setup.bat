@echo off
:: ExamSewa Virtual Camera Driver Installer
title ExamSewa Virtual Camera Setup
echo ====================================================
echo        ExamSewa Virtual Camera Driver Setup
echo ====================================================
echo.

openfiles >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Kripya is file par Right Click karein aur 'Run as Administrator' chunein!
    echo Please run this installer as Administrator.
    echo.
    pause
    exit /b
)

set TARGET_DIR=%ProgramFiles%\ExamSewaCam
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"

echo [1/3] Copying files to %TARGET_DIR%...
copy /Y "%~dp0ExamSewaCam.dll" "%TARGET_DIR%\" >nul

echo [2/3] Registering ExamSewa Virtual Camera with Windows...
regsvr32 /s "%TARGET_DIR%\ExamSewaCam.dll"

echo [3/3] Setting Device Name to 'ExamSewa Virtual Camera'...
reg add "HKCR\CLSID\{860BB310-5D01-11d0-BD3B-00A0C911CE86}\Instance\{E8A34F50-1B21-4E65-9F7C-99B7F1D5D4E1}" /v FriendlyName /t REG_SZ /d "ExamSewa Virtual Camera" /f >nul 2>&1

echo.
echo ====================================================
echo SUCCESS! ExamSewa Virtual Camera safaltapoorvak install ho gaya!
echo Ab aap BPSC / CTET portal par 'ExamSewa Virtual Camera' chun sakte hain.
echo ====================================================
echo.
pause
