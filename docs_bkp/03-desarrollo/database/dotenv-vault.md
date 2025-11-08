# GUÍA DE INTEGRACIÓN - dotenv-vault
**GAMILIT Platform - Gestión Segura de Secrets**
**Fecha:** 2025-11-02
**Agente:** ATLAS-DATABASE

---

## 📋 TABLA DE CONTENIDOS

1. [¿Qué es dotenv-vault?](#1-qué-es-dotenv-vault)
2. [Arquitectura de Secrets](#2-arquitectura-de-secrets)
3. [Scripts Creados](#3-scripts-creados)
4. [Flujo Completo](#4-flujo-completo)
5. [Comandos Rápidos](#5-comandos-rápidos)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. ¿Qué es dotenv-vault?

**dotenv-vault** es un sistema de gestión de secrets que:
- ✅ Encripta secrets localmente
- ✅ Sincroniza entre ambientes (dev/prod)
- ✅ Versionado de secrets
- ✅ No expone secrets en Git
- ✅ Integración con CI/CD

### Beneficios vs .env tradicional

| Aspecto | .env tradicional | dotenv-vault |
|---------|------------------|--------------|
| **Seguridad** | ⚠️ Texto plano | ✅ Encriptado |
| **Sync** | ❌ Manual | ✅ Automático |
| **Versionado** | ❌ No | ✅ Sí |
| **Rollback** | ❌ No | ✅ Sí |
| **Multi-ambiente** | ⚠️ Complejo | ✅ Simple |

---

## 2. Arquitectura de Secrets

### Ubicación de Secrets

```
gamilit/projects/gamilit/
├── apps/
│   ├── backend/
│   │   ├── .env.dev              # Secrets dev (local, encriptado)
│   │   ├── .env.prod             # Secrets prod (encriptado)
│   │   ├── .env.vault            # Vault de dotenv-vault
│   │   └── .env.me              # Secrets locales (NO commitear)
│   │
│   ├── frontend/
│   │   ├── .env.dev              # Frontend dev
│   │   └── .env.prod             # Frontend prod
│   │
│   └── database/
│       ├── scripts/
│       │   ├── manage-secrets.sh  # 🔑 Gestión de secrets
│       │   └── init-database-v3.sh # BD con vault
│       │
│       └── database-credentials-{env}.txt  # Backup legible
```

### Flujo de Secrets

```
┌─────────────────────┐
│  manage-secrets.sh  │  Genera passwords
│   generate --env    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  .env.{environment} │  Archivo local (encriptado)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  manage-secrets.sh  │  Sincroniza
│   sync --env        │
└──────────┬──────────┘
           │
           ├─────────────────────────────┐
           │                             │
           ▼                             ▼
┌──────────────────────┐     ┌──────────────────────┐
│   dotenv-vault       │     │  backend/.env.dev    │
│   (cloud encriptado) │     │  frontend/.env.dev   │
└──────────────────────┘     └──────────────────────┘
                                        │
                                        ▼
                             ┌──────────────────────┐
                             │ init-database-v3.sh  │
                             │ (lee automáticamente)│
                             └──────────────────────┘
```

---

## 3. Scripts Creados

### 3.1. manage-secrets.sh

**Ubicación:** `/apps/database/scripts/manage-secrets.sh`
**Propósito:** Gestión centralizada de secrets con dotenv-vault

**Comandos:**

```bash
# Inicializar vault (solo primera vez)
./manage-secrets.sh init --env dev

# Generar nuevos secrets
./manage-secrets.sh generate --env dev

# Sincronizar a vault y backend
./manage-secrets.sh sync --env dev

# Exportar para uso inmediato
./manage-secrets.sh export --env prod

# Ver estado de secrets
./manage-secrets.sh status --env dev

# Rotar passwords
./manage-secrets.sh rotate --env prod
```

**Secrets Generados:**
- `DB_PASSWORD` (32 caracteres)
- `JWT_SECRET` (64 caracteres base64)
- `JWT_REFRESH_SECRET` (64 caracteres base64)
- `ENCRYPTION_KEY` (64 caracteres base64)

### 3.2. init-database-v3.sh

**Ubicación:** `/apps/database/scripts/init-database-v3.sh`
**Propósito:** Inicialización BD con soporte dotenv-vault

**Opciones:**

```bash
# Lectura automática desde vault (RECOMENDADO)
./init-database-v3.sh --env prod

# Usar password exportado
source /tmp/gamilit-db-secrets-prod.sh
./init-database-v3.sh --env prod --use-exported-password

# Password manual (fallback)
./init-database-v3.sh --env prod --password "tu_password_32chars"
```

**Prioridades de Password:**
1. ✅ Password exportado (`--use-exported-password`)
2. ✅ Leer desde vault (`.env.$ENVIRONMENT`)
3. ✅ Password manual (`--password`)
4. ⚠️ Generar nuevo (fallback)

---

## 4. Flujo Completo

### 4.1. Primera Vez - Desarrollo

```bash
cd /apps/database/scripts

# Paso 1: Inicializar dotenv-vault (solo primera vez)
./manage-secrets.sh init --env dev

# Paso 2: Generar secrets
./manage-secrets.sh generate --env dev
# Output: Genera DB_PASSWORD, JWT_SECRET, etc.

# Paso 3: Sincronizar a vault
./manage-secrets.sh sync --env dev
# Output: Secrets guardados en dotenv-vault y .env.dev

# Paso 4: Inicializar base de datos (lee automáticamente)
./init-database-v3.sh --env dev

# Paso 5: Verificar
./manage-secrets.sh status --env dev
```

**Resultado:**
- ✅ Secrets generados y encriptados
- ✅ BD inicializada con password seguro
- ✅ Backend configurado automáticamente
- ✅ Frontend actualizado

### 4.2. Primera Vez - Producción

```bash
cd /apps/database/scripts

# Paso 1: Generar secrets para prod
./manage-secrets.sh generate --env prod

# Paso 2: Sincronizar a vault
./manage-secrets.sh sync --env prod

# Paso 3: Verificar secrets
./manage-secrets.sh status --env prod

# Paso 4: Inicializar BD en servidor remoto
# (Asegúrate de tener acceso SSH/VPN al servidor)
./init-database-v3.sh --env prod --force

# Paso 5: Validar
psql -h 74.208.126.102 -U gamilit_user -d gamilit_platform -c "SELECT version();"
```

**⚠️ IMPORTANTE para Producción:**
- Configura SSH/VPN antes
- Valida SSL está habilitado
- Guarda backup del password
- Documenta en gestor de passwords del equipo

### 4.3. Rotación de Passwords

```bash
# Rotar password de producción
./manage-secrets.sh rotate --env prod

# Reiniciar BD con nuevo password
./init-database-v3.sh --env prod --force

# Reiniciar backend (recargará nuevos secrets automáticamente)
cd /apps/backend
npm run dev
```

---

## 5. Comandos Rápidos

### Cheatsheet - Desarrollo

```bash
# Generar y sincronizar
./manage-secrets.sh generate --env dev && ./manage-secrets.sh sync --env dev

# Init BD (automático)
./init-database-v3.sh --env dev --force

# Ver estado
./manage-secrets.sh status --env dev
```

### Cheatsheet - Producción

```bash
# Generar secrets prod
./manage-secrets.sh generate --env prod

# Sincronizar
./manage-secrets.sh sync --env prod

# Exportar para uso inmediato
./manage-secrets.sh export --env prod
source /tmp/gamilit-db-secrets-prod.sh

# Init BD
./init-database-v3.sh --env prod --use-exported-password

# Limpiar secrets temporales
unset GAMILIT_DB_PASSWORD
rm -f /tmp/gamilit-db-secrets-prod.sh
```

### Verificar Todo Funciona

```bash
# 1. Verificar secrets en vault
cd /apps/backend
cat .env.dev | grep DB_PASSWORD

# 2. Verificar BD
psql -U gamilit_user -d gamilit_platform -c "SELECT COUNT(*) FROM pg_tables;"

# 3. Verificar backend puede conectarse
cd /apps/backend
npm run dev
# Debería iniciar sin errores de conexión

# 4. Verificar frontend
cd /apps/frontend
cat .env.dev | grep VITE_JWT_SECRET
```

---

## 6. Troubleshooting

### Problema: "DB_PASSWORD no encontrado en .env.dev"

**Causa:** Secrets no sincronizados

**Solución:**
```bash
./manage-secrets.sh generate --env dev
./manage-secrets.sh sync --env dev
```

### Problema: "dotenv-vault: command not found"

**Causa:** CLI no instalado

**Solución:**
```bash
npm install -g dotenv-vault
# o usar con npx (ya incluido en scripts)
```

### Problema: "Password incorrecto al conectar a BD"

**Causa:** Desincronización entre vault y BD

**Solución:**
```bash
# Opción 1: Reiniciar BD con password del vault
./init-database-v3.sh --env dev --force

# Opción 2: Actualizar vault con password actual
# Editar manualmente .env.dev y luego:
./manage-secrets.sh sync --env dev
```

### Problema: "No se puede conectar a 74.208.126.102"

**Causa:** Sin acceso SSH/VPN al servidor

**Solución:**
```bash
# Verificar conectividad
ping 74.208.126.102

# Verificar puerto PostgreSQL
nc -zv 74.208.126.102 5432

# Configurar SSH tunnel si es necesario
ssh -L 5432:localhost:5432 user@74.208.126.102
```

### Problema: "Backend no lee nuevos secrets"

**Causa:** Backend cacheado

**Solución:**
```bash
# Reiniciar backend
cd /apps/backend
npm run dev

# O forzar recarga
pkill -f "npm run dev"
npm run dev
```

---

## 7. Mejores Prácticas

### ✅ DO

- ✅ Usar `manage-secrets.sh` para todos los secrets
- ✅ Rotar passwords periódicamente (cada 90 días)
- ✅ Guardar backup del password en gestor del equipo
- ✅ Usar `init-database-v3.sh` sin `--password` (lee de vault)
- ✅ Mantener `.env.vault` en Git (está encriptado)
- ✅ Documentar cambios de secrets en changelog

### ❌ DON'T

- ❌ Commitear `.env.dev` o `.env.prod` sin encriptar
- ❌ Compartir passwords por Slack/Email
- ❌ Usar `--password` en producción (usa vault)
- ❌ Hardcodear passwords en código
- ❌ Reutilizar passwords entre ambientes
- ❌ Dejar archivos temporales de secrets

---

## 8. Integración con CI/CD

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup dotenv-vault
        run: npm install -g dotenv-vault

      - name: Load secrets from vault
        env:
          DOTENV_KEY: ${{ secrets.DOTENV_KEY_PROD }}
        run: npx dotenv-vault pull prod

      - name: Initialize database
        run: |
          cd apps/database/scripts
          ./init-database-v3.sh --env prod --force
```

### Variables de Entorno en CI

Configurar en GitHub Secrets:
- `DOTENV_KEY_DEV` - Key de vault para desarrollo
- `DOTENV_KEY_PROD` - Key de vault para producción

---

## 9. Arquitectura de Archivos

### ¿Qué commitear en Git?

```
✅ COMMITEAR:
  - .env.vault              (encriptado por dotenv-vault)
  - .env.example            (template sin valores)
  - manage-secrets.sh       (script de gestión)
  - init-database-v3.sh     (script BD)
  - config/dev.conf         (configuración pública)
  - config/prod.conf        (configuración pública)

❌ NO COMMITEAR:
  - .env.dev                (secrets locales)
  - .env.prod               (secrets producción)
  - .env.me                 (secrets personales)
  - database-credentials-*.txt (backup legible)
  - /tmp/gamilit-*          (archivos temporales)
```

### Archivo .gitignore

```gitignore
# Secrets locales
.env
.env.dev
.env.prod
.env.*.local
.env.me

# Credentials backup
database-credentials-*.txt

# Temporales
/tmp/gamilit-*

# Vault está OK (está encriptado)
# .env.vault  <- COMMITEAR ESTE
```

---

## 10. Resumen Ejecutivo

### Scripts Creados

1. **manage-secrets.sh** (840 líneas)
   - Genera secrets seguros
   - Sincroniza con dotenv-vault
   - Exporta para uso inmediato
   - Rota passwords

2. **init-database-v3.sh** (450 líneas)
   - Lee automáticamente de vault
   - Sin necesidad de `--password`
   - Soporte multi-ambiente
   - Sincronización automática

### Flujo Simplificado

```bash
# Una vez: Configurar vault
./manage-secrets.sh init --env dev
./manage-secrets.sh generate --env dev
./manage-secrets.sh sync --env dev

# Siempre: Usar BD (automático)
./init-database-v3.sh --env dev
```

### Beneficios

✅ **Seguridad:** Secrets encriptados
✅ **Automatización:** Sin passwords manuales
✅ **Trazabilidad:** Versionado de secrets
✅ **Multi-ambiente:** dev/prod separados
✅ **Rollback:** Fácil volver a versión anterior
✅ **CI/CD Ready:** Integración completa

---

**Autor:** ATLAS-DATABASE
**Fecha:** 2025-11-02
**Versión:** 1.0
**Archivo:** `/apps/database/scripts/GUIA-DOTENV-VAULT.md`

---

**FIN DE LA GUÍA**
