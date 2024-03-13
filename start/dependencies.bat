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
    pushd "%~dp0"
    cscript.exe /nologo "%~dp0..\scripts\delete_script.vbs"
    popd
)
