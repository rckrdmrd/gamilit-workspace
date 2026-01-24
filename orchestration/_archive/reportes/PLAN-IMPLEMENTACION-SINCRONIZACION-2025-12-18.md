# PLAN DE IMPLEMENTACION Y CORRECCIONES - SINCRONIZACION WORKSPACES

**Fecha:** 2025-12-18
**Ejecutor:** Requirements-Analyst (Claude Opus 4.5)
**Estado:** FASE 3 - PLANIFICACION

---

## RESUMEN EJECUTIVO DE HALLAZGOS

Basado en el analisis ejecutado por 4 subagentes especializados:

| Componente | Estado | Accion Requerida |
|------------|--------|------------------|
| Database DDL | 100% SINCRONIZADO | Ninguna |
| Database Seeds | 100% SINCRONIZADO | Ninguna |
| Frontend (912 archivos) | 100% SINCRONIZADO | Ninguna |
| Backend Codigo | 100% SINCRONIZADO | Ninguna |
| Backend Dependencias | Versiones diferentes | Opcional: Actualizar en VIEJO |
| Configuraciones .env | 100% SINCRONIZADAS | Ninguna |
| Scripts Produccion | FALTANTES en NUEVO | **CRITICO: Copiar** |
| ecosystem.config.js | Path hardcodeado | **CRITICO: Actualizar** |
| Secretos (JWT, Session) | Valores inseguros | **CRITICO: Generar nuevos** |

---

## PLAN DE IMPLEMENTACION

### PRIORIDAD P0: CRITICAS (Bloquean deployment)

#### TAREA 1: Copiar scripts de produccion al workspace NUEVO

**Justificacion:** Los scripts `update-production.sh` y `diagnose-production.sh` son esenciales para el workflow de deployment y no existen en el workspace NUEVO.

**Origen:** `~/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit/scripts/`
**Destino:** `~/workspace/projects/gamilit/scripts/`

**Comandos:**
```bash
cd ~/workspace/projects/gamilit
mkdir -p scripts

# Copiar scripts
cp ~/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit/scripts/update-production.sh scripts/
cp ~/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit/scripts/diagnose-production.sh scripts/

# Dar permisos de ejecucion
chmod +x scripts/*.sh
```

**Verificacion:**
```bash
ls -la scripts/*.sh
# Debe mostrar ambos scripts con permisos de ejecucion
```

**Impacto:**
- Sin dependencias
- Habilita el workflow de deployment desde workspace NUEVO

---

#### TAREA 2: Crear directorio de backups

**Justificacion:** El script `update-production.sh` requiere un directorio de backups que no existe.

**Comandos:**
```bash
mkdir -p ~/backups
chmod 700 ~/backups
```

**Verificacion:**
```bash
ls -la ~ | grep backups
# Debe mostrar el directorio con permisos 700
```

**Impacto:**
- Dependencia de TAREA 1
- Requerido antes de ejecutar update-production.sh

---

### PRIORIDAD P1: ALTAS (Recomendadas antes de deployment)

#### TAREA 3: Actualizar path en ecosystem.config.js

**Justificacion:** La linea 138 contiene el path del workspace VIEJO hardcodeado.

**Archivo:** `~/workspace/projects/gamilit/ecosystem.config.js`

**Cambio requerido:**
```javascript
// Linea 138, DE:
path: '/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit',

// A:
path: '/home/isem/workspace/projects/gamilit',
```

**Verificacion:**
```bash
grep -n "path:" ~/workspace/projects/gamilit/ecosystem.config.js
```

**Impacto:**
- Sin dependencias
- Critico para PM2 en servidor de produccion

---

#### TAREA 4: Generar secretos seguros para produccion

**Justificacion:** JWT_SECRET y SESSION_SECRET tienen valores por defecto inseguros.

**Comandos para generar:**
```bash
# Generar JWT_SECRET
echo "JWT_SECRET=$(openssl rand -base64 32)"

# Generar SESSION_SECRET
echo "SESSION_SECRET=$(openssl rand -base64 32)"
```

**Configurar en servidor de produccion:**
```bash
# En ~/.bashrc o /etc/environment del servidor 74.208.126.102
export JWT_SECRET="[valor_generado_1]"
export SESSION_SECRET="[valor_generado_2]"
export DB_PASSWORD="[password_real]"
```

**Verificacion:**
```bash
echo $JWT_SECRET | wc -c
# Debe mostrar al menos 44 caracteres (base64 de 32 bytes)
```

**Impacto:**
- Sin dependencias de codigo
- CRITICO para seguridad en produccion

---

### PRIORIDAD P2: MEDIAS (Mejoras recomendadas)

#### TAREA 5: Sincronizar dependencias del backend (OPCIONAL)

**Justificacion:** El workspace NUEVO tiene versiones mas recientes con mejoras de seguridad.

**Diferencias principales:**
| Paquete | NUEVO | VIEJO |
|---------|-------|-------|
| @nestjs/terminus | ^11.0.0 | ^10.2.0 |
| @nestjs/throttler | ^6.0.0 | ^5.0.1 |
| helmet | ^8.1.0 | ^7.1.0 |
| typeorm | ^0.3.22 | ^0.3.17 |

**Nuevas dependencias en NUEVO:**
- nodemailer ^7.0.11
- web-push ^3.6.7

**Accion:**
- NO REQUIERE ACCION INMEDIATA
- El codigo es compatible con ambas versiones
- Actualizar gradualmente en workspace VIEJO si se desea

---

#### TAREA 6: Copiar documentacion de sincronizacion

**Justificacion:** Mantener la documentacion centralizada.

**Comandos:**
```bash
# Copiar PRODUCTION-UPDATE.md al workspace NUEVO (ya existe en VIEJO)
cp ~/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit/PRODUCTION-UPDATE.md \
   ~/workspace/projects/gamilit/

# Copiar scripts/README.md
cp ~/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit/scripts/README.md \
   ~/workspace/projects/gamilit/scripts/
```

**Impacto:**
- Dependencia de TAREA 1
- Facilita el workflow del agente en produccion

---

### PRIORIDAD P3: BAJAS (Mejoras futuras)

#### TAREA 7: Configurar HTTPS/SSL

**Estado actual:** HTTP sin SSL
**Accion:** Configurar Let's Encrypt + Nginx (futuro)

**Requisitos previos:**
- Dominio configurado (gamilit.com)
- DNS apuntando a 74.208.126.102
- Nginx instalado

**Archivos a modificar cuando se configure:**
```bash
# Backend .env.production
CORS_ORIGIN=https://gamilit.com,https://www.gamilit.com

# Frontend .env.production
VITE_API_PROTOCOL=https
VITE_WS_PROTOCOL=wss
```

---

## MATRIZ DE DEPENDENCIAS

```
TAREA 1 (Scripts) ─────> TAREA 2 (Backups dir)
                  └────> TAREA 6 (Docs)

TAREA 3 (ecosystem.config.js) ─────> Sin dependencias

TAREA 4 (Secretos) ─────> Sin dependencias de codigo
                          Requiere acceso a servidor produccion

TAREA 5 (Dependencias) ─────> OPCIONAL, sin dependencias

TAREA 7 (HTTPS) ─────> Requiere dominio DNS
                       Requiere Nginx
                       Requiere certificado SSL
```

---

## ORDEN DE EJECUCION RECOMENDADO

### Fase A: Preparacion Workspace NUEVO (Local)

```
1. TAREA 1: Copiar scripts de produccion
2. TAREA 6: Copiar documentacion
3. TAREA 3: Actualizar ecosystem.config.js
4. Commit y push de cambios
```

### Fase B: Preparacion Servidor Produccion (74.208.126.102)

```
5. TAREA 2: Crear directorio de backups
6. TAREA 4: Configurar variables de entorno seguras
```

### Fase C: Deployment

```
7. Ejecutar update-production.sh
8. Ejecutar diagnose-production.sh
9. Validar funcionamiento
```

---

## CHECKLIST PRE-DEPLOYMENT

### Workspace NUEVO (Desarrollo)
- [ ] Scripts de produccion copiados (TAREA 1)
- [ ] Documentacion copiada (TAREA 6)
- [ ] ecosystem.config.js actualizado (TAREA 3)
- [ ] Commit realizado con cambios
- [ ] Push a repositorio remoto

### Servidor Produccion (74.208.126.102)
- [ ] Directorio ~/backups existe (TAREA 2)
- [ ] DB_PASSWORD configurado
- [ ] JWT_SECRET configurado (TAREA 4)
- [ ] SESSION_SECRET configurado (TAREA 4)
- [ ] CORS_ORIGIN configurado
- [ ] PostgreSQL corriendo
- [ ] PM2 instalado globalmente

---

## VALIDACION POST-IMPLEMENTACION

### Verificar scripts copiados
```bash
ls -la ~/workspace/projects/gamilit/scripts/
# Esperado: update-production.sh, diagnose-production.sh con +x
```

### Verificar configuracion PM2
```bash
grep "path:" ~/workspace/projects/gamilit/ecosystem.config.js | head -1
# Esperado: path con workspace NUEVO
```

### Verificar directorio backups
```bash
ls -la ~/backups
# Esperado: directorio vacio con permisos 700
```

### Verificar variables de entorno (en produccion)
```bash
echo $JWT_SECRET | wc -c
echo $SESSION_SECRET | wc -c
echo $DB_PASSWORD | wc -c
# Todos deben tener longitud > 0
```

---

## ESTIMACION DE IMPACTO

| Tarea | Tiempo | Riesgo | Downtime |
|-------|--------|--------|----------|
| TAREA 1 | 2 min | Bajo | 0 |
| TAREA 2 | 1 min | Bajo | 0 |
| TAREA 3 | 5 min | Bajo | 0 |
| TAREA 4 | 5 min | Bajo | 0 |
| TAREA 5 | 30 min | Medio | Posible |
| TAREA 6 | 2 min | Bajo | 0 |
| TAREA 7 | 2+ hrs | Alto | Posible |

**Total P0+P1:** ~15 minutos, sin downtime

---

## ROLLBACK

Si algo falla despues de ejecutar el deployment:

```bash
# 1. Detener servicios
pm2 stop all

# 2. Restaurar desde backup
BACKUP_DIR=$(ls -td ~/backups/*/ | head -1)
PGPASSWORD="$DB_PASSWORD" psql -h localhost -U gamilit_user -d gamilit_platform < $BACKUP_DIR/database/*.sql

# 3. Restaurar configs
cp $BACKUP_DIR/config/* ~/workspace/projects/gamilit/apps/backend/
cp $BACKUP_DIR/config/* ~/workspace/projects/gamilit/apps/frontend/

# 4. Volver al workspace VIEJO si es necesario
cd ~/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit
pm2 start ecosystem.config.js
```

---

## SIGUIENTE PASO

Proceder a **FASE 4: Validacion de planeacion vs analisis** para verificar:
- Que todas las dependencias estan cubiertas
- Que no faltan objetos o componentes
- Que el orden de ejecucion respeta las dependencias

---

*Generado por Requirements-Analyst | Sistema SIMCO*
*Fase 3 de 5 del Plan de Sincronizacion*
