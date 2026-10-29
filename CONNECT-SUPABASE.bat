@echo off
setlocal enabledelayedexpansion

echo =======================================================
echo    PostureFit - Automated Supabase Cloud Connector
echo =======================================================
echo.
echo You only need 2 things from your Supabase Dashboard:
echo 1. Project URL (e.g. https://xyzabcdefg.supabase.co)
echo 2. Anon Key or Service Role Key
echo.
echo Where to find them:
echo Go to: https://supabase.com/dashboard
echo Click: Settings (Gear icon) -^> API
echo.
echo -------------------------------------------------------

set /p SUPA_URL="1. Paste your Supabase Project URL: "
if "!SUPA_URL!"=="" (
    echo [ERROR] Supabase URL cannot be empty.
    pause
    exit /b 1
)

set /p SUPA_KEY="2. Paste your Supabase Anon Key (or Service Role Key): "
if "!SUPA_KEY!"=="" (
    echo [ERROR] Supabase Key cannot be empty.
    pause
    exit /b 1
)

echo.
echo Writing connection credentials to .env file...

(
echo PORT=5000
echo NODE_ENV=development
echo CLIENT_URL=http://localhost:5173
echo SUPABASE_URL=!SUPA_URL!
echo SUPABASE_ANON_KEY=!SUPA_KEY!
echo SUPABASE_SERVICE_ROLE_KEY=!SUPA_KEY!
echo ADMIN_SECRET_KEY=posturefit_super_secret_admin_token_2026
echo POINTS_EXERCISE_COMPLETION=20
echo POINTS_BREAK_COMPLETION=10
echo POINTS_DAILY_GOAL_BONUS=50
echo POINTS_STREAK_7_DAY_BONUS=100
) > .env

echo.
echo [SUCCESS] .env file configured successfully!
echo.
echo -------------------------------------------------------
echo NEXT STEP IN SUPABASE (One-time setup for your tables):
echo -------------------------------------------------------
echo 1. In your Supabase Dashboard, click 'SQL Editor' on the left.
echo 2. Click 'New query'.
echo 3. Copy and paste the entire content of this file:
echo    supabase\migrations\20261024000000_init_posturefit.sql
echo 4. Click 'Run'.
echo.
echo That's it! All 11 tables, 25 exercises, and 5 challenges
echo will be automatically created in your Supabase database!
echo.
echo You can now restart PostureFit with START-POSTUREFIT.bat!
echo -------------------------------------------------------
pause
