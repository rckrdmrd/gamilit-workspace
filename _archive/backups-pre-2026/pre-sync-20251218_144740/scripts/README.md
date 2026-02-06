# Scripts de Produccion - GAMILIT

**Ultima actualizacion:** 2025-12-18

---

## PARA EL AGENTE EN PRODUCCION

Si acabas de hacer `git pull` desde remoto, sigue estas instrucciones:

### 1. Leer Documentacion Primero

```bash
# Guia principal de actualizacion
cat docs/95-guias-desarrollo/GUIA-ACTUALIZACION-PRODUCCION.md

# Guia de validacion y troubleshooting
cat docs/95-guias-desarrollo/GUIA-VALIDACION-PRODUCCION.md

# Guia de despliegue completo (si es primera vez)
cat docs/95-guias-desarrollo/GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md
```

### 2. Ejecutar Actualizacion

```bash
# Hacer scripts ejecutables
chmod +x scripts/*.sh

# Configurar password de BD
export DB_PASSWORD="tu_password_aqui"

# Ejecutar actualizacion completa
./scripts/update-production.sh
```

### 3. Si Solo Necesitas Diagnostico

```bash
./scripts/diagnose-production.sh
```

### 4. Si Hay Datos Faltantes

```bash
./scripts/repair-missing-data.sh
```

---

## Scripts Disponibles

| Script | Proposito | Cuando usar |
|--------|-----------|-------------|
| `update-production.sh` | Actualizacion completa | Despues de pull |
| `diagnose-production.sh` | Diagnostico del sistema | Para verificar estado |
| `repair-missing-data.sh` | Reparar datos faltantes | Si faltan seeds |

---

## Flujo de Actualizacion

```
1. Respaldar configuraciones (.env) fuera del repo
2. Respaldar base de datos (pg_dump)
3. git fetch && git reset --hard origin/main
4. Restaurar configuraciones
5. Recrear base de datos limpia (create-database.sh)
6. npm install + npm run build
7. pm2 start
8. Validar con diagnose-production.sh
```

---

## Documentacion Relacionada

- `docs/95-guias-desarrollo/GUIA-ACTUALIZACION-PRODUCCION.md` - Guia detallada paso a paso
- `docs/95-guias-desarrollo/GUIA-VALIDACION-PRODUCCION.md` - Validaciones y errores comunes
- `docs/95-guias-desarrollo/GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md` - Configuracion inicial completa
- `docs/95-guias-desarrollo/GUIA-CREAR-BASE-DATOS.md` - Proceso de creacion de BD
