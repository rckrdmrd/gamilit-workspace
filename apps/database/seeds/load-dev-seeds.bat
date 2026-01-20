@echo off
REM ============================================================================
REM Script: Carga de Seeds para Ambiente DEV (Windows)
REM Fecha: 2026-01-20
REM ============================================================================
REM
REM DESCRIPCION:
REM   Este script carga los seeds de desarrollo en el orden correcto,
REM   respetando las dependencias entre schemas.
REM
REM USO:
REM   load-dev-seeds.bat [DATABASE_URL]
REM
REM EJEMPLO:
REM   load-dev-seeds.bat "postgresql://user:password@localhost:5432/gamilit_dev"
REM
REM REQUISITOS:
REM   - PostgreSQL psql.exe en el PATH
REM   - Acceso a la base de datos
REM
REM ============================================================================

setlocal EnableDelayedExpansion

REM ============================================================================
REM CONFIGURACION
REM ============================================================================

set "DATABASE_URL=%~1"

if "%DATABASE_URL%"=="" (
    if defined DATABASE_URL (
        set "DATABASE_URL=%DATABASE_URL%"
    ) else (
        echo [ERROR] DATABASE_URL no esta configurada
        echo.
        echo Uso: %~nx0 ^<DATABASE_URL^>
        echo Ejemplo: %~nx0 "postgresql://user:password@localhost:5432/gamilit_dev"
        echo.
        echo O establece la variable de entorno DATABASE_URL
        exit /b 1
    )
)

set "SCRIPT_DIR=%~dp0"
set "SEEDS_DIR=%SCRIPT_DIR%dev"

REM Crear nombre de log con timestamp
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "TIMESTAMP=%dt:~0,8%_%dt:~8,6%"
set "LOG_FILE=%SCRIPT_DIR%load-dev-seeds-%TIMESTAMP%.log"

REM ============================================================================
REM INICIO
REM ============================================================================

echo.
echo ===============================================================
echo    GAMILIT - Carga de Seeds DEV (Windows)
echo ===============================================================
echo.
echo [INFO] Timestamp: %TIMESTAMP%
echo [INFO] Log: %LOG_FILE%
echo [INFO] Seeds: %SEEDS_DIR%
echo.

REM Verificar que psql existe
where psql >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] psql no encontrado en PATH
    echo [ERROR] Instala PostgreSQL y agrega bin/ al PATH
    exit /b 1
)

REM Verificar conexion a base de datos
echo [INFO] Verificando conexion a base de datos...
psql "%DATABASE_URL%" -c "SELECT 1" >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] No se puede conectar a la base de datos
    echo [ERROR] Verifica DATABASE_URL y que PostgreSQL este corriendo
    exit /b 1
)
echo [OK] Conexion verificada
echo.

REM ============================================================================
REM CARGA DE SEEDS EN ORDEN
REM ============================================================================

echo [INFO] Iniciando carga de seeds...
echo.

REM Orden de carga respetando dependencias
call :execute_sql "%SEEDS_DIR%\01-core.sql" "Core schema seeds"
call :execute_sql "%SEEDS_DIR%\02-gamification.sql" "Gamification seeds"
call :execute_sql "%SEEDS_DIR%\03-social.sql" "Social seeds"
call :execute_sql "%SEEDS_DIR%\04-content.sql" "Content seeds"
call :execute_sql "%SEEDS_DIR%\05-progress.sql" "Progress tracking seeds"
call :execute_sql "%SEEDS_DIR%\06-audit.sql" "Audit logging seeds"
call :execute_sql "%SEEDS_DIR%\07-admin.sql" "Admin dashboard seeds"
call :execute_sql "%SEEDS_DIR%\08-testing.sql" "Testing data seeds"

echo.
echo ===============================================================
echo [OK] Carga de seeds completada
echo [INFO] Log guardado en: %LOG_FILE%
echo ===============================================================
echo.
goto :eof

REM ============================================================================
REM FUNCIONES
REM ============================================================================

:execute_sql
set "SQL_FILE=%~1"
set "DESCRIPTION=%~2"

echo [INFO] %DESCRIPTION%...

if not exist "%SQL_FILE%" (
    echo [WARN] Archivo no encontrado (opcional): %SQL_FILE%
    echo [WARN] Archivo no encontrado: %SQL_FILE% >> "%LOG_FILE%"
    goto :eof
)

psql "%DATABASE_URL%" -f "%SQL_FILE%" >> "%LOG_FILE%" 2>&1
if %ERRORLEVEL%==0 (
    echo [OK] Completado: %~nx1
) else (
    echo [ERROR] Error ejecutando: %SQL_FILE%
    echo [ERROR] Ver detalles en: %LOG_FILE%
)
goto :eof
