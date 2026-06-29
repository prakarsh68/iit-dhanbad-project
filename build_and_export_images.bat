@echo off
echo =======================================================================
echo  AEGIS: Build and Export Docker Images
echo =======================================================================
echo.
echo This script will build the Docker images for AEGIS and export them 
echo as tar files (aegis-frontend.tar and aegis-backend.tar).
echo.
echo Checking if Docker is running...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running or not installed.
    echo Please make sure Docker Desktop is installed, running, and added to PATH.
    echo.
    pause
    exit /b %errorlevel%
)

echo [1/4] Building Docker images via Docker Compose...
docker compose build
if %errorlevel% neq 0 (
    echo [ERROR] Docker build failed.
    pause
    exit /b %errorlevel%
)
echo.

echo [2/4] Saving aegis-frontend image to aegis-frontend.tar...
docker save aegis-frontend:latest -o aegis-frontend.tar
if %errorlevel% neq 0 (
    echo [ERROR] Failed to save frontend image.
    pause
    exit /b %errorlevel%
)
echo.

echo [3/4] Saving aegis-backend image to aegis-backend.tar...
docker save aegis-backend:latest -o aegis-backend.tar
if %errorlevel% neq 0 (
    echo [ERROR] Failed to save backend image.
    pause
    exit /b %errorlevel%
)
echo.

echo [4/4] Done!
echo =======================================================================
echo Export completed successfully!
echo Files generated:
echo   - aegis-frontend.tar
echo   - aegis-backend.tar
echo.
echo You can now send these tar files directly to your supervisor.
echo =======================================================================
pause
