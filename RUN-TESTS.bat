@echo off
title PostureFit - Automated Verification Test Suite
color 0B
echo ======================================================================
echo           🧪 POSTUREFIT - AUTOMATED TEST SUITE RUNNER
echo ======================================================================
echo.

call npm.cmd test

echo.
echo ======================================================================
echo Test execution complete.
pause
