@echo off
REM ============================================================================
REM GAMILIT - Script de Inicio de Servidores de Desarrollo (Windows)
REM ============================================================================
REM Este script inicia el Frontend (puerto 3005) y Backend (puerto 3006)
REM en modo desarrollo.
REM
REM Uso:
REM   start-dev.bat          # Inicia ambos servidores
REM   start-dev.bat frontend # Solo Frontend
REM   start-dev.bat backend  # Solo Backend
REM ============================================================================

setlocal EnableDelayedExpansion

REM Colores (limitados en CMD, usamos texto descriptivo)
set "PROJECT_DIR=%~dp0"
set "FRONTEND_DIR=%PROJECT_DIR%apps\frontend"
set "BACKEND_DIR=%PROJECT_DIR%apps\backend"

REM Archivos PID (en TEMP)
set "FRONTEND_PID_FILE=%TEMP%\gamilit-frontend.pid"
set "BACKEND_PID_FILE=%TEMP%\gamilit-backend.pid"

REM Archivos de log
set "FRONTEND_LOG=%TEMP%\gamilit-frontend.log"
set "BACKEND_LOG=%TEMP%\gamilit-backend.log"

echo.
echo ===============================================================
echo    GAMILIT - Inicio de Servidores de Desarrollo (Windows)
echo ===============================================================
echo.

REM Procesar argumentos
set "MODE=%~1"
if "%MODE%"=="" set "MODE=all"

if /i "%MODE%"=="frontend" (
    call :start_frontend
    goto :end
)

if /i "%MODE%"=="backend" (
    call :start_backend
    goto :end
)

REM Default: iniciar ambos
call :start_backend
echo.
call :start_frontend

:end
echo.
echo ===============================================================
echo [OK] Servidores iniciados
echo.
echo Para detener los servidores:
echo    stop-dev.bat
echo.
echo Para ver logs:
echo    type %FRONTEND_LOG%
echo    type %BACKEND_LOG%
echo ===============================================================
echo.
goto :eof

REM ============================================================================
REM FUNCIONES
REM ============================================================================

:stop_existing_server
REM Detiene servidor existente en un puerto
set "PORT=%~1"
set "NAME=%~2"

echo [INFO] Verificando puerto %PORT%...

REM Buscar proceso usando el puerto con netstat
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT%" ^| findstr "LISTENING" 2^>nul') do (
    set "PID=%%a"
    if not "!PID!"=="" (
        echo [WARN] Puerto %PORT% en uso por PID !PID!, deteniendo...
        taskkill /F /PID !PID! >nul 2>&1
        timeout /t 2 /nobreak >nul
    )
)
goto :eof

:start_frontend
echo [INFO] Iniciando Frontend (puerto 3005)...

REM Detener servidor existente
call :stop_existing_server 3005 "Frontend"

REM Iniciar servidor en nueva ventana
cd /d "%FRONTEND_DIR%"
start "GAMILIT-Frontend" cmd /c "npm run dev > "%FRONTEND_LOG%" 2>&1"

REM Esperar a que inicie
echo [INFO] Esperando que Frontend inicie...
timeout /t 5 /nobreak >nul

REM Verificar que el puerto esté escuchando
netstat -ano | findstr ":3005" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL%==0 (
    echo [OK] Frontend iniciado exitosamente
    echo      Local:   http://localhost:3005/
    echo      Log:     %FRONTEND_LOG%
) else (
    echo [WARN] Frontend puede estar iniciando. Verifica el log:
    echo        %FRONTEND_LOG%
)
goto :eof

:start_backend
echo [INFO] Iniciando Backend (puerto 3006)...

REM Detener servidor existente
call :stop_existing_server 3006 "Backend"

REM Iniciar servidor en nueva ventana
cd /d "%BACKEND_DIR%"
start "GAMILIT-Backend" cmd /c "npm run dev > "%BACKEND_LOG%" 2>&1"

REM Esperar a que inicie
echo [INFO] Esperando que Backend inicie...
timeout /t 8 /nobreak >nul

REM Verificar que el puerto esté escuchando
netstat -ano | findstr ":3006" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL%==0 (
    echo [OK] Backend iniciado exitosamente
    echo      Server:  http://localhost:3006
    echo      Docs:    http://localhost:3006/api/docs
    echo      Log:     %BACKEND_LOG%
) else (
    echo [WARN] Backend puede estar iniciando. Verifica el log:
    echo        %BACKEND_LOG%
)
goto :eof
