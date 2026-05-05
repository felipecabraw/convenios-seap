@echo off
setlocal

cd /d "%~dp0"

set "URL=http://127.0.0.1:5173"

echo.
echo SIGIC - ambiente local
echo Iniciando servidor Vite com atualizacao em tempo real...
echo.

if not exist "node_modules" (
  echo Dependencias nao encontradas. Instalando com npm install...
  call npm install
  if errorlevel 1 (
    echo.
    echo Falha ao instalar dependencias.
    pause
    exit /b 1
  )
)

start "" "%URL%"

echo.
echo Navegador aberto em %URL%
echo Mantenha esta janela aberta enquanto estiver desenvolvendo.
echo Pressione Ctrl+C para parar o servidor.
echo.

call npm run dev -- --host 127.0.0.1

endlocal
