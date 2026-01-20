@echo off
REM ============================================================================
REM GAMILIT - Script de Detencion de Servidores de Desarrollo (Windows)
REM ============================================================================
REM Este script detiene el Frontend (puerto 3005) y Backend (puerto 3006)
REM
REM Uso:
REM   stop-dev.bat           # Detiene ambos servidores
REM   stop-dev.bat frontend  # Solo Frontend
REM   stop-dev.bat backend   # Solo Backend
REM ============================================================================

setlocal EnableDelayedExpansion

echo.
echo ===============================================================
echo    GAMILIT - Detencion de Servidores de Desarrollo (Windows)
echo ===============================================================
echo.

REM Procesar argumentos
set "MODE=%~1"
if "%MODE%"=="" set "MODE=all"

if /i "%MODE%"=="frontend" (
    call :stop_server 3005 "Frontend"
    goto :end
)

if /i "%MODE%"=="backend" (
    call :stop_server 3006 "Backend"
    goto :end
)

REM Default: detener ambos
call :stop_server 3006 "Backend"
call :stop_server 3005 "Frontend"

:end
echo.
echo ===============================================================
echo [OK] Servidores detenidos
echo ===============================================================
echo.
goto :eof

REM ============================================================================
REM FUNCIONES
REM ============================================================================

:stop_server
set "PORT=%~1"
set "NAME=%~2"
set "FOUND=0"

echo [INFO] Deteniendo %NAME% (puerto %PORT%)...

REM Buscar y matar procesos usando el puerto
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT%" ^| findstr "LISTENING" 2^>nul') do (
    set "PID=%%a"
    if not "!PID!"=="" (
        echo [INFO] Deteniendo proceso PID !PID!...
        taskkill /F /PID !PID! >nul 2>&1
        if !ERRORLEVEL!==0 (
            echo [OK] Proceso !PID! detenido
            set "FOUND=1"
        ) else (
            echo [WARN] No se pudo detener proceso !PID!
        )
    )
)

REM Tambien buscar por nombre de ventana (si se inicio con start-dev.bat)
taskkill /FI "WINDOWTITLE eq GAMILIT-%NAME%*" /F >nul 2>&1

if "!FOUND!"=="0" (
    echo [INFO] %NAME% no estaba corriendo
)
goto :eof

:kill_by_port
REM Funcion auxiliar para matar proceso por puerto
set "KILL_PORT=%~1"
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%KILL_PORT%" ^| findstr "LISTENING" 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
)
goto :eof
