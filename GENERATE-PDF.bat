@echo off
title PostureFit - Black Book PDF Generator
color 0b

echo =======================================================================
echo          POSTUREFIT BLACK BOOK REPORT - PDF GENERATOR
echo       Shree Shankar Narayan College - University of Mumbai
echo =======================================================================
echo.

set HTML_FILE=%~dp0POSTUREFIT-BLACK-BOOK-PROJECT-REPORT.html
set PDF_FILE=%~dp0POSTUREFIT-BLACK-BOOK-PROJECT-REPORT.pdf

echo [1/3] Generating High-Resolution 69-Page Academic Black Book PDF...
echo Please wait, compiling diagrams and formatting...

powershell -Command "Start-Process -FilePath 'C:\Program Files\Google\Chrome\Application\chrome.exe' -ArgumentList @('--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--print-to-pdf=%PDF_FILE%', 'file:///%HTML_FILE%') -Wait"

if exist "%PDF_FILE%" (
    echo.
    echo [2/3] SUCCESS! PDF successfully created at:
    echo %PDF_FILE%
    echo.
    echo [3/3] Opening PDF for preview...
    start "" "%PDF_FILE%"
) else (
    echo.
    echo [!] Chrome headless generation encountered an issue.
    echo Opening HTML report in browser. Press Ctrl + P and select 'Save as PDF'.
    start "" "%HTML_FILE%"
)

echo.
echo =======================================================================
echo Complete. Press any key to close this window.
echo =======================================================================
pause >nul
