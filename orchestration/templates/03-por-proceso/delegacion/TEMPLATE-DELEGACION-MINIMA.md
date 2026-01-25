---
version: "1.0.0"
fecha: "2026-01-07"
tipo: template
sistema: "SIMCO - NEXUS v4.0"
proposito: "Delegacion minima para tareas simples de 1 archivo"
tokens: ~250
---

# TEMPLATE: DELEGACION MINIMA

**Uso:** Tareas simples de 1 archivo con tarea clara

---

## DELEGACION COMPACTA

```yaml
subagente: "PERFIL-{TIPO}-COMPACT.md"
proyecto: "{nombre}"
tarea: "{descripcion en 1 oracion}"
crear: "{ruta/archivo.ext}"
referencia: "{ruta/patron.ext}:lineas"
criterio: "{criterio principal}"
validar: "{comando}"
```

---

## EJEMPLO

```yaml
subagente: "PERFIL-DATABASE-COMPACT.md"
proyecto: "trading-platform"
tarea: "Crear tabla notifications en schema notification_system"
crear: "apps/database/ddl/schemas/notification_system/05-notifications.sql"
referencia: "apps/database/ddl/schemas/notification_system/02-notification_templates.sql:1-30"
criterio: "Carga limpia pasa sin errores"
validar: "./drop-and-recreate-database.sh"
```

---

## RESTRICCIONES IMPLICITAS

- NO crear fuera del alcance
- NO asumir sin verificar
- ESCALAR si hay dudas

---

## REPORTE MINIMO

```yaml
estado: "COMPLETADO | FALLIDO"
archivo: "{ruta}"
validacion: "PASS | FAIL"
```

---

**Para tareas mas complejas:** Ver `TEMPLATE-DELEGACION-ESTANDAR.md`
