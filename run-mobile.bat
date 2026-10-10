@echo off
echo ==========================================
echo     PICKLEPLAY EXPO GO RUNNER
echo ==========================================
echo.

cd /d "%~dp0mobile"

if not exist "node_modules" (
    echo Installing Expo mobile dependencies (first time setup)...
    call npm install --legacy-peer-deps
)

echo.
echo Starting Expo server...
echo Scan the QR code below using the Expo Go app on your phone!
echo.

call npx expo start
