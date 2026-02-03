# ERR-DB-002: Uso de NOW() en lugar de gamilit.now_mexico()

**Categoria:** Database
**Severidad:** Media
**Ocurrencias:** 11+
**Fecha documentacion:** 2025-12-28

---

## Descripcion

En GAMILIT, todas las marcas de tiempo deben usar la zona horaria de Mexico.
El uso de `NOW()` genera timestamps en UTC, causando inconsistencias.

---

## Sintoma

- Fechas de creacion/actualizacion aparecen con horas incorrectas
- Reportes muestran actividad en horarios inesperados
- Comparaciones de fechas fallan por diferencia de 6 horas

---

## Causa Raiz

PostgreSQL `NOW()` retorna timestamp en UTC.
El proyecto requiere `America/Mexico_City` para consistencia.

---

## Solucion

### 1. Identificar usos incorrectos

```bash
grep -r "NOW()" apps/database/ddl/ --include="*.sql"
```

### 2. Reemplazar con funcion correcta

```sql
-- INCORRECTO
created_at TIMESTAMP DEFAULT NOW()

-- CORRECTO
created_at TIMESTAMP DEFAULT gamilit.now_mexico()
```

### 3. En triggers de updated_at

```sql
-- INCORRECTO
NEW.updated_at := NOW();

-- CORRECTO
NEW.updated_at := gamilit.now_mexico();
```

---

## Prevencion

- Buscar `NOW()` antes de commit en archivos DDL
- Usar snippet/template con `gamilit.now_mexico()`
- Revisar en code review

---

## Referencias

- `ddl/schemas/gamilit/functions/01-now_mexico.sql`
- AUDIT-DB-001: 12 usos identificados y corregidos (2025-12-14)
