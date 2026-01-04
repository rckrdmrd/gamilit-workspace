# 📚 ÍNDICE MAESTRO - Scripts de Base de Datos GAMILIT

**Actualizado:** 2025-12-28
**Versión:** 3.8
**Estado:** ✅ Consolidado y Funcional

---

## 🎯 INICIO RÁPIDO

¿Nuevo en el proyecto? Empieza aquí:

```bash
# 1. Lee la guía rápida
cat QUICK-START.md

# 2. Inicializa la BD
./init-database.sh --env dev --force

# 3. ¡Listo!
```

---

## 📖 DOCUMENTACIÓN DISPONIBLE

### Documentos Principales

| Archivo | Propósito | ¿Cuándo leer? |
|---------|-----------|---------------|
| **QUICK-START.md** | Guía rápida de uso | ⭐ Primero - Setup inicial |
| **README.md** | Documentación completa | Segunda lectura - Detalles |
| **ANALISIS-SCRIPTS-2025-11-08.md** | Análisis técnico | Referencia técnica |
| **INDEX.md** | Este índice | Navegación general |
| **README-SETUP.md** | Guía de setup detallada | Setup avanzado |

### Orden Recomendado de Lectura

```
1. INDEX.md (este archivo) ← Estás aquí
2. QUICK-START.md          ← Guía rápida para empezar
3. README.md               ← Documentación completa
4. ANALISIS-SCRIPTS-2025-11-08.md  ← Detalles técnicos (opcional)
```

---

## 🛠️ SCRIPTS DISPONIBLES

### Scripts Principales (3) ⭐

| Script | Tamaño | Estado | Propósito |
|--------|--------|--------|-----------|
| `init-database.sh` | 55K | ✅ Activo | Inicialización completa (v3.8) |
| `reset-database.sh` | 26K | ✅ Activo | Reset rápido v2.0 (sincronizado con init) |
| `recreate-database.sh` | 8.9K | ✅ Activo | Recreación completa (elimina todo) |

### Scripts de Gestión (3)

| Script | Tamaño | Estado | Propósito |
|--------|--------|--------|-----------|
| `manage-secrets.sh` | 18K | ✅ Activo | Gestión de secrets con dotenv-vault |
| `update-env-files.sh` | 16K | ✅ Activo | Sincronización de .env |
| `cleanup-duplicados.sh` | 12K | ✅ Activo | Limpieza de duplicados |

### Scripts de Inventario (8)

Ubicación: `inventory/`

| Script | Propósito |
|--------|-----------|
| `list-tables.sh` | Listar todas las tablas |
| `list-functions.sh` | Listar todas las funciones |
| `list-enums.sh` | Listar todos los ENUMs |
| `list-rls.sh` | Listar RLS policies |
| `list-indexes.sh` | Listar índices |
| `list-views.sh` | Listar vistas |
| `list-triggers.sh` | Listar triggers |
| `list-seeds.sh` | Listar seeds disponibles |
| `generate-all-inventories.sh` | Generar todos los inventarios |

### Scripts Obsoletos (deprecated/)

| Script | Estado | Notas |
|--------|--------|-------|
| `init-database-v1.sh` | 📦 Deprecated | Versión original (21K) |
| `init-database-v2.sh` | 📦 Deprecated | Versión intermedia (32K) |
| `init-database.sh.backup-*` | 📦 Deprecated | Backup de v1.0 |

⚠️ **NO eliminar archivos en deprecated/** - Son históricos y de referencia

---

## 📊 COMPARACIÓN RÁPIDA DE SCRIPTS PRINCIPALES

| Característica | init-database.sh | reset-database.sh | recreate-database.sh |
|----------------|------------------|-------------------|----------------------|
| **Elimina usuario** | ❌ | ❌ | ✅ |
| **Elimina BD** | ⚠️ Si existe | ✅ | ✅ |
| **Crea usuario** | ✅ Si no existe | ❌ | ✅ |
| **Genera password** | ✅ | ❌ | ✅ |
| **Requiere password** | ❌ | ✅ | ❌ |
| **Actualiza .env** | ✅ | ❌ | ✅ |
| **Soporta dotenv-vault** | ✅ | ❌ | ✅ (vía init) |
| **Tiempo ejecución** | 30-60s | 20-30s | 40-70s |
| **Riesgo de pérdida datos** | Bajo | Medio | Alto |

---

## 🎯 GUÍA DE DECISIÓN RÁPIDA

### ¿Qué script debo usar?

```
┌─────────────────────────────────────┐
│ ¿Es la primera vez en el proyecto? │
└──────────┬──────────────────────────┘
           │
           ├─ SÍ ──> init-database.sh --env dev --force
           │
           └─ NO ──┐
                   │
        ┌──────────┴────────────────────────┐
        │ ¿Conoces el password del usuario? │
        └──────────┬────────────────────────┘
                   │
                   ├─ SÍ ──> reset-database.sh --env dev --password "pass"
                   │
                   └─ NO ──> recreate-database.sh --env dev
```

### Casos de Uso Específicos

| Situación | Script Recomendado | Comando |
|-----------|-------------------|---------|
| **Primera vez** | init-database.sh | `./init-database.sh --env dev --force` |
| **Aplicar cambios DDL** | reset-database.sh | `./reset-database.sh --env dev --password "pass"` |
| **Olvidé password** | recreate-database.sh | `./recreate-database.sh --env dev` |
| **Deployment producción** | init-database.sh + vault | `./manage-secrets.sh generate --env prod && ./init-database.sh --env prod` |
| **Desarrollo diario** | reset-database.sh | `./reset-database.sh --env dev --password "$(grep Password ../database-credentials-dev.txt | cut -d: -f2 | xargs)"` |

---

## 📁 ESTRUCTURA DEL DIRECTORIO

```
/apps/database/scripts/
│
├── 📖 Documentación
│   ├── INDEX.md                         ← Estás aquí
│   ├── QUICK-START.md                   ⭐ Guía rápida
│   ├── README.md                        📚 Documentación completa
│   ├── README-SETUP.md                  🔧 Setup avanzado
│   └── ANALISIS-SCRIPTS-2025-11-08.md   📊 Análisis técnico
│
├── 🛠️ Scripts Principales
│   ├── init-database.sh                 ⭐ Inicialización (v3.8)
│   ├── reset-database.sh                🔄 Reset rápido
│   └── recreate-database.sh             ⚠️  Recreación completa
│
├── 🔐 Scripts de Gestión
│   ├── manage-secrets.sh                🔑 Gestión de secrets
│   ├── update-env-files.sh              🔧 Sincronización .env
│   └── cleanup-duplicados.sh            🧹 Limpieza
│
├── ⚙️ Configuración
│   └── config/
│       ├── dev.conf                     🛠️ Config desarrollo
│       └── prod.conf                    🚀 Config producción
│
├── 📊 Inventario
│   └── inventory/
│       ├── list-tables.sh               📋 Listar tablas
│       ├── list-functions.sh            ⚙️ Listar funciones
│       ├── list-enums.sh                🏷️ Listar ENUMs
│       ├── list-rls.sh                  🔒 Listar RLS
│       ├── list-indexes.sh              📈 Listar índices
│       ├── list-views.sh                👁️ Listar vistas
│       ├── list-triggers.sh             ⚡ Listar triggers
│       ├── list-seeds.sh                🌱 Listar seeds
│       └── generate-all-inventories.sh  📊 Generar todos
│
├── 🔄 Migraciones
│   └── migrations/
│       └── *.sql                        📝 Migraciones SQL
│
├── 💾 Backup y Restore
│   ├── backup/                          💾 Scripts de backup
│   └── restore/                         ♻️ Scripts de restore
│
├── 🛠️ Utilidades
│   └── utilities/                       🔧 Herramientas varias
│
└── 📦 Obsoletos
    └── deprecated/
        ├── init-database-v1.sh          📦 Versión 1.0
        ├── init-database-v2.sh          📦 Versión 2.0
        └── init-database.sh.backup-*    📦 Backups
```

---

## 🔍 BÚSQUEDA RÁPIDA

### ¿Cómo hacer...?

**Inicializar BD por primera vez:**
```bash
./init-database.sh --env dev --force
```

**Resetear datos rápidamente:**
```bash
PASSWORD=$(grep 'Database Password' ../database-credentials-dev.txt | cut -d: -f2 | xargs)
./reset-database.sh --env dev --password "$PASSWORD"
```

**Ver credenciales actuales:**
```bash
cat ../database-credentials-dev.txt
```

**Listar todos los objetos de BD:**
```bash
cd inventory/
./generate-all-inventories.sh
```

**Aplicar migración SQL:**
```bash
# Agregar migración a migrations/
# Luego resetear BD
./reset-database.sh --env dev --password "pass"
```

**Verificar estado de BD:**
```bash
# Verificar conexión
psql -U gamilit_user -d gamilit_platform -c "SELECT version();"

# Contar objetos
psql -U gamilit_user -d gamilit_platform -c "\dt *.*" | wc -l    # Tablas
psql -U gamilit_user -d gamilit_platform -c "\df *.*" | wc -l    # Funciones
psql -U gamilit_user -d gamilit_platform -c "\dn" | wc -l        # Schemas
```

---

## 📊 ESTADO DE LA BASE DE DATOS

### Objetos Implementados (según análisis 2025-12-28)

| Tipo de Objeto | Cantidad | Estado |
|----------------|----------|--------|
| **Schemas** | 16 | ✅ Completo |
| **Tablas** | 156+ | ✅ Completo |
| **Funciones** | 120+ | ✅ Completo |
| **Vistas** | 11 | ✅ Completo |
| **Vistas Materializadas** | 4 | ✅ Completo |
| **Triggers** | 61+ | ✅ Completo |
| **Índices** | 95+ archivos | ✅ Completo |
| **RLS Policies** | 24 archivos | ✅ Completo |
| **ENUMs** | 36 | ✅ Completo |

**Total:** 402+ objetos DDL

**Calidad:** A+ (salud BD: 8.6/10)

---

## ⚠️ ADVERTENCIAS IMPORTANTES

### Desarrollo (dev)

✅ **Puedes:**
- Usar `--force` libremente
- Recrear BD frecuentemente
- Experimentar con scripts

❌ **Evita:**
- Usar secrets de producción
- Omitir logs de errores

### Producción (prod)

✅ **Debes:**
- SIEMPRE hacer backup primero
- Usar dotenv-vault
- Validar dos veces
- Notificar al equipo

❌ **NUNCA:**
- Usar `--force` sin validación
- Recrear sin backup
- Ejecutar sin pruebas previas

---

## 🐛 TROUBLESHOOTING RÁPIDO

| Error | Solución Rápida |
|-------|----------------|
| "psql no encontrado" | `sudo apt install postgresql-client` |
| "No se puede conectar" | `sudo systemctl start postgresql` |
| "Usuario ya existe" | `./recreate-database.sh --env dev` |
| "Permisos denegados" | `chmod +x *.sh` |
| "BD en uso" | `sudo -u postgres psql -c "SELECT pg_terminate_backend..."` |

Para más detalles: `cat QUICK-START.md | grep -A 10 "Troubleshooting"`

---

## 📞 OBTENER AYUDA

### Orden de consulta

1. **QUICK-START.md** - Casos de uso comunes
2. **README.md** - Documentación detallada
3. **ANALISIS-SCRIPTS-2025-11-08.md** - Detalles técnicos
4. **Logs del script** - Revisa el output del comando
5. **Equipo de BD** - Si todo falla

### Comandos de ayuda

```bash
# Ver ayuda de cualquier script
./init-database.sh --help
./reset-database.sh --help
./recreate-database.sh --help
```

---

## ✅ CHECKLIST RÁPIDO

### Primera Vez en el Proyecto

- [ ] Leí QUICK-START.md
- [ ] PostgreSQL está instalado y corriendo
- [ ] Ejecuté `./init-database.sh --env dev --force`
- [ ] Verifiqué credenciales en `../database-credentials-dev.txt`
- [ ] Backend puede conectarse a la BD

### Antes de Deployment Producción

- [ ] Leí README.md completo
- [ ] Tengo backup completo de BD actual
- [ ] Generé secrets con `manage-secrets.sh`
- [ ] Probé en staging
- [ ] Tengo plan de rollback
- [ ] Notifiqué al equipo

---

## 📈 HISTORIAL DE CAMBIOS

### 2025-12-28 - Sincronización v3.8

- ✅ reset-database.sh actualizado a v2.0 (sincronizado con init-database.sh v3.8)
- ✅ 16 schemas, 56 seeds en 10 fases
- ✅ Agregada función fix_profiles_and_gamification() a reset-database.sh
- ✅ Seeds redundantes movidos a _deprecated
- ✅ Actualizado INDEX.md con conteos reales (402+ objetos DDL)

### 2025-11-08 - Consolidación v3.0

- ✅ Unificadas versiones múltiples de init-database.sh
- ✅ Movidos scripts obsoletos a deprecated/
- ✅ Creado QUICK-START.md
- ✅ Creado ANALISIS-SCRIPTS-2025-11-08.md
- ✅ Creado INDEX.md (este archivo)
- ✅ Actualizada documentación completa

### Versiones Anteriores

- v2.0 (2025-11-02) - Integración con update-env-files
- v1.0 (Original) - Scripts base

---

## 🎓 RECURSOS ADICIONALES

### Documentación de BD

- `INVENTARIO-COMPLETO-BD-2025-11-07.md` - Inventario exhaustivo
- `REPORTE-VALIDACION-BD-COMPLETO-2025-11-08.md` - Validación completa
- `MATRIZ-COBERTURA-MODULOS-PLATAFORMA-2025-11-07.md` - Cobertura

### Validaciones Cruzadas

- `VALIDACION-CRUZADA-INFORME-MIGRACION-2025-11-08.md` - Validación de migración

---

**Última actualización:** 2025-12-28
**Mantenido por:** Equipo de Base de Datos GAMILIT
**Versión:** 3.8
**Estado:** ✅ Consolidado y Funcional

---

🎉 **¡Bienvenido a los Scripts de Base de Datos GAMILIT!** 🎉

**Próximo paso:** Lee `QUICK-START.md` para empezar
