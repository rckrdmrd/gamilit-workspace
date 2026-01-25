---
version: "1.0.0"
fecha: "2026-01-07"
tipo: template
sistema: "SIMCO - NEXUS v4.0"
proposito: "Delegacion estandar para tareas de 1-2 archivos"
tokens: ~600
---

# TEMPLATE: DELEGACION ESTANDAR

**Uso:** Tareas de 1-2 archivos con complejidad moderada

---

## DELEGACION

### Subagente

```yaml
perfil: "PERFIL-{TIPO}-COMPACT.md"
proyecto: "{nombre_proyecto}"
simco: "SIMCO-{OPERACION}.md"
```

### Contexto Heredado

```yaml
variables:
  BACKEND_ROOT: "{valor}"
  DB_NAME: "{valor}"
  # Solo las variables necesarias para la tarea

aliases:
  @BACKEND: "{ruta_completa}"
  @DDL: "{ruta_completa}"
  # Solo los alias que usara el subagente
```

### Estado Actual

```yaml
# Resumen minimo del estado relevante
existentes:
  - "{elemento1}"
  - "{elemento2}"

pendientes:
  - "{lo que debe crear}"
```

---

## TAREA

### Descripcion

```yaml
descripcion: "{1-2 oraciones claras}"
archivo_crear: "{ruta/archivo.ext}"
archivo_referencia: "{ruta/patron.ext}:lineas"
```

### Criterios de Aceptacion

```yaml
criterios:
  - [ ] {Criterio 1}
  - [ ] {Criterio 2}
  - [ ] {Criterio 3}
  - [ ] Build/Carga pasa
```

---

## VALIDACION

```yaml
comando: "{comando de validacion}"
esperado: "{resultado esperado}"
```

---

## RESTRICCIONES

```yaml
no_hacer:
  - NO crear fuera del alcance
  - NO modificar otros archivos
  - NO asumir sin verificar

escalar_si:
  - Dependencias no existen
  - Especificacion ambigua
```

---

## REPORTE ESPERADO

```yaml
formato:
  archivos_creados: ["lista"]
  validaciones: {comando: "PASS"}
  siguiente_paso: "{descripcion breve}"
```

---

**Para tareas complejas (>2 archivos):** Ver `TEMPLATE-DELEGACION-COMPLETA.md`
**Para tareas simples (1 archivo):** Ver `TEMPLATE-DELEGACION-MINIMA.md`
