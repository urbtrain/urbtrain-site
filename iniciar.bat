@echo off
setlocal

cd /d "%~dp0"

if not exist "node_modules\" (
  echo Instalando dependencias...
  call npm install
  if errorlevel 1 (
    echo.
    echo Nao foi possivel instalar as dependencias.
    pause
    exit /b 1
  )
)

echo.
echo URBTRAIN local: http://localhost:3000
echo Pressione Ctrl+C para encerrar o servidor.
echo.

call npm run dev
