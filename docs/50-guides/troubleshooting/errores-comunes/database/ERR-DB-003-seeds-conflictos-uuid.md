---
titulo: Error DB-003 Conflictos de UUID en Seeds
tipo: guia
dominio: troubleshooting
ultima_actualizacion: 2026-02-27
---

# ERR-DB-003: Conflictos de UUID en Seeds

**Categoria:** Database
**Severidad:** Critica
**Ocurrencias:** 4+
**Fecha documentacion:** 2025-12-28

---

## Descripcion

UUIDs duplicados o en conflicto entre seeds de diferentes ambientes (dev/prod)
o entre archivos del mismo ambiente.

---

## Sintoma

- Error "duplicate key value violates unique constraint" al ejecutar seeds
- Seeds que fallan silenciosamente por ON CONFLICT DO NOTHING
- Datos inconsistentes entre ambientes

---

## Causa Raiz

1. Copy-paste de seeds sin cambiar UUIDs
2. UUIDs generados manualmente sin convencion
3. Falta de prefijos por ambiente

---

## Solucion

### 1. Usar convencion de UUIDs por ambiente

```sql
-- CONVENCION GAMILIT:
-- Dev:  aaaaaaaa-0000-4000-a000-...
-- Prod: bbbbbbbb-0000-4000-a000-...
-- Test: cccccccc-0000-4000-a000-...

-- Ejemplo DEV
INSERT INTO users (id, email) VALUES
('aaaaaaaa-0001-4000-a000-000000000001', 'admin@dev.test'),
('aaaaaaaa-0002-4000-a000-000000000002', 'teacher@dev.test');

-- Ejemplo PROD
INSERT INTO users (id, email) VALUES
('bbbbbbbb-0001-4000-a000-000000000001', 'admin@gamilit.com'),
('bbbbbbbb-0002-4000-a000-000000000002', 'soporte@gamilit.com');
```

### 2. Validar antes de commit

```bash
# Buscar UUIDs duplicados
grep -rohE '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}' \
  apps/database/seeds/ | sort | uniq -d
```

### 3. Usar secuencias para IDs numericos

```sql
-- Para tablas con ID numerico, usar secuencias separadas por ambiente
-- dev: 1-999, prod: 1000+
```

---

## Prevencion

- Documentar convencion de UUIDs en README de seeds
- Script de validacion pre-commit
- Code review verificando prefijos

---

## Referencias

- `apps/database/seeds/README.md`
- Convencion: aaaa (dev), bbbb (prod), cccc (test)
