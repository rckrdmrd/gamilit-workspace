# Scripts de Desarrollo para Windows

Este documento describe los scripts `.bat` equivalentes a los scripts `.sh` de Linux para desarrollo en Windows.

## Scripts Disponibles

| Script Windows | Script Linux | Descripción |
|----------------|--------------|-------------|
| `start-dev.bat` | `start-dev.sh` | Inicia servidores de desarrollo |
| `stop-dev.bat` | `stop-dev.sh` | Detiene servidores de desarrollo |
| `apps/database/seeds/load-dev-seeds.bat` | `apps/database/seeds/load-dev-seeds.sh` | Carga seeds de desarrollo |

## Uso

### Iniciar Servidores de Desarrollo

```cmd
REM Iniciar ambos servidores (Frontend + Backend)
start-dev.bat

REM Solo Frontend (puerto 3005)
start-dev.bat frontend

REM Solo Backend (puerto 3006)
start-dev.bat backend
```

Los servidores se inician en ventanas separadas:
- **Frontend:** http://localhost:3005
- **Backend:** http://localhost:3006
- **API Docs:** http://localhost:3006/api/docs

### Detener Servidores

```cmd
REM Detener ambos servidores
stop-dev.bat

REM Solo Frontend
stop-dev.bat frontend

REM Solo Backend
stop-dev.bat backend
```

### Cargar Seeds de Desarrollo

```cmd
REM Con DATABASE_URL como argumento
apps\database\seeds\load-dev-seeds.bat "postgresql://user:password@localhost:5432/gamilit_dev"

REM O usando variable de entorno
set DATABASE_URL=postgresql://user:password@localhost:5432/gamilit_dev
apps\database\seeds\load-dev-seeds.bat
```

**Requisitos:**
- PostgreSQL instalado
- `psql.exe` en el PATH del sistema

## Logs

Los logs se guardan en el directorio temporal:
- Frontend: `%TEMP%\gamilit-frontend.log`
- Backend: `%TEMP%\gamilit-backend.log`
- Seeds: `apps\database\seeds\load-dev-seeds-YYYYMMDD_HHMMSS.log`

## Diferencias con Linux

| Aspecto | Linux (.sh) | Windows (.bat) |
|---------|-------------|----------------|
| Detección de puertos | `lsof -i:PORT` | `netstat -ano \| findstr :PORT` |
| Matar proceso | `kill -9 PID` | `taskkill /F /PID PID` |
| Proceso en background | `cmd &` | `start "Title" cmd /c "..."` |
| Variables de entorno | `export VAR=value` | `set VAR=value` |
| Colores en terminal | ANSI codes | Limitado (texto plano) |

## Troubleshooting

### El servidor no inicia

1. Verifica que no haya otro proceso en el puerto:
   ```cmd
   netstat -ano | findstr :3005
   netstat -ano | findstr :3006
   ```

2. Mata el proceso manualmente:
   ```cmd
   taskkill /F /PID <PID_NUMBER>
   ```

### psql no encontrado

Agrega PostgreSQL al PATH:
1. Busca la ruta de instalación (ej: `C:\Program Files\PostgreSQL\15\bin`)
2. Agrégala a las variables de entorno del sistema

### npm no encontrado

Asegúrate de que Node.js esté instalado y en el PATH:
```cmd
node --version
npm --version
```

## Alternativa: Usar Git Bash

Si prefieres usar los scripts originales de Linux, puedes ejecutarlos con Git Bash:

```bash
# En Git Bash
./start-dev.sh
./stop-dev.sh
./apps/database/seeds/load-dev-seeds.sh "postgresql://..."
```

O desde CMD:
```cmd
bash start-dev.sh
bash stop-dev.sh
```
