@echo off
echo Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo.
    echo ERROR! There was a problem installing dependencies.
    echo.
    pause
) else (
    echo.
    echo Dependencies installed successfully.
    echo.
    pause
)
