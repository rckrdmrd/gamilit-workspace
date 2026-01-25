# SIMCO: CONTRIBUIR AL CATÁLOGO

**Versión:** 1.0.0
**Fecha:** 2025-12-08
**Aplica a:** TODO agente que implemente funcionalidad reutilizable
**Prioridad:** RECOMENDADA - Después de completar funcionalidad exitosamente

---

## RESUMEN EJECUTIVO

> **Cuando implementes una funcionalidad común y reutilizable (auth, notificaciones, pagos, etc.) que funcione en producción, EVALÚA si debe agregarse al catálogo para beneficio de futuros proyectos.**

---

## PRINCIPIO FUNDAMENTAL

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║           EL CATÁLOGO CRECE CON CADA PROYECTO EXITOSO                        ║
║                                                                               ║
║  "Documentar mientras desarrollas es más fácil que después."                 ║
║  "Código que no se documenta, no se reutiliza."                              ║
║                                                                               ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## CUÁNDO APLICAR ESTA DIRECTIVA

### Una funcionalidad ES candidata para el catálogo si cumple TODOS:

| Criterio | Pregunta a Responder |
|----------|---------------------|
| **Probada** | ¿Funciona en producción (al menos 1 proyecto)? |
| **Reutilizable** | ¿NO es específica de un dominio de negocio? |
| **Común** | ¿Se necesita en múltiples proyectos típicamente? |
| **Compleja** | ¿Tiene suficiente complejidad que justifica documentar? |
| **Estable** | ¿La API/estructura no cambia frecuentemente? |

### Ejemplos de funcionalidades candidatas:
- Autenticación, sesiones, rate limiting
- Notificaciones (email, push, in-app)
- Pagos, suscripciones
- WebSockets, real-time
- Multi-tenancy, feature flags
- File upload, image processing
- Audit logs, activity tracking
- Caching strategies

### Ejemplos que NO van al catálogo:
- Lógica de negocio específica (cálculo de comisiones de trading)
- UI components específicos de un proyecto
- Configuraciones específicas de un proyecto
- Integraciones one-off con terceros

---

## CHECKLIST RÁPIDO

```
EVALUAR CANDIDATURA
├── [ ] 1. ¿Cumple los 5 criterios de arriba?
├── [ ] 2. ¿El código está limpio y documentado?
└── [ ] 3. ¿Hay tests que validen el funcionamiento?

SI ES CANDIDATO → CONTRIBUIR
├── [ ] 4. Crear estructura en shared/catalog/{nombre}/
├── [ ] 5. Documentar README.md (descripción, trade-offs)
├── [ ] 6. Documentar IMPLEMENTATION.md (pasos)
├── [ ] 7. Actualizar CATALOG-INDEX.yml
├── [ ] 8. Actualizar @CATALOG README.md
├── [ ] 9. Actualizar ALIASES.yml
└── [ ] 10. Verificar que es encontrable por keywords
```

---

## PROCESO DETALLADO

### Paso 1: Preparar Estructura

```bash
# Crear directorio para la funcionalidad
mkdir -p shared/catalog/{nombre-en-kebab-case}/

# Crear archivos base
touch shared/catalog/{nombre}/README.md
touch shared/catalog/{nombre}/IMPLEMENTATION.md
```

**Convención de nombres:**
- Usar kebab-case: `audit-logs`, `file-upload`, `caching-strategy`
- Nombre descriptivo pero conciso

### Paso 2: Documentar README.md

**Estructura obligatoria:**

```markdown
# {Nombre de la Funcionalidad}

**Versión:** 1.0.0
**Origen:** projects/{proyecto-origen}
**Estado:** Production-Ready | Documentando
**Última actualización:** YYYY-MM-DD

---

## Descripción

{Descripción clara de qué hace y para qué sirve}

---

## Características

| Característica | Descripción |
|----------------|-------------|
| ... | ... |

---

## Stack Tecnológico

```yaml
backend:
  framework: NestJS
  # ...
```

---

## Dependencias NPM

```json
{
  "paquete": "^version"
}
```

---

## Tablas Requeridas

| Tabla | Propósito |
|-------|-----------|
| ... | ... |

---

## Endpoints Principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| ... | ... | ... |

---

**Mantenido por:** Sistema NEXUS
**Proyecto origen:** {Proyecto}
```

### Paso 3: Documentar IMPLEMENTATION.md

**Estructura obligatoria:**

```markdown
# Guía de Implementación: {Nombre}

**Versión:** 1.0.0
**Complejidad:** Baja | Media | Alta

---

## Pre-requisitos

- [ ] Requisito 1
- [ ] Requisito 2

---

## Paso 1: {Nombre del Paso}

{Descripción}

```typescript
// Código de ejemplo
```

---

## Variables de Entorno

```env
VARIABLE=valor
```

---

## Checklist de Implementación

- [ ] Paso completado 1
- [ ] Paso completado 2
- [ ] Build pasa sin errores
- [ ] Tests pasan

---

## Troubleshooting

### Error: "{mensaje}"
{Solución}

---

**Versión:** 1.0.0
**Sistema:** SIMCO Catálogo
```

### Paso 4: Actualizar CATALOG-INDEX.yml

```yaml
# Agregar bajo funcionalidades:
  {nombre}:
    nombre: "{Nombre Legible}"
    path: "shared/catalog/{nombre}/"
    alias: "@CATALOG_{ALIAS}"
    estado: "production-ready"
    origen: "projects/{proyecto}"
    version: "1.0.0"
    stack:
      - "NestJS"
      - "{otras tecnologías}"
    keywords:
      - "{keyword1}"
      - "{keyword2}"
      - "{keyword3}"
    caracteristicas:
      - "{característica 1}"
      - "{característica 2}"
    dependencias_npm:
      - "{paquete}"
    tablas_requeridas:
      - "{schema}.{tabla}"
```

**IMPORTANTE:** Las keywords son críticas para que la funcionalidad sea encontrable por grep.

### Paso 5: Actualizar shared/catalog/README.md

Agregar fila en la tabla de "Estado Actual":

```markdown
| {nombre} | 🟢 Production-Ready | {Origen} | {Stack Principal} |
```

### Paso 6: Actualizar ALIASES.yml

```yaml
# Agregar en sección de catálogo
@CATALOG_{ALIAS}: "shared/catalog/{nombre}/"
```

### Paso 7: Validar

```bash
# Verificar que grep encuentra la funcionalidad
grep -i "{keyword}" shared/catalog/CATALOG-INDEX.yml

# Verificar estructura completa
ls -la shared/catalog/{nombre}/
# Debe mostrar: README.md, IMPLEMENTATION.md

# Verificar alias en documentación
grep "@CATALOG_{ALIAS}" shared/catalog/README.md
```

---

## MANTENIMIENTO DEL CATÁLOGO

### Actualizar Funcionalidad Existente

Cuando el código mejore en un proyecto:

```markdown
1. ¿El cambio es generalizable (beneficia a todos)?
   - SÍ → Actualizar catálogo
   - NO → Mantener como adaptación local

2. Si actualizar:
   - Modificar IMPLEMENTATION.md con nuevos pasos
   - Incrementar versión en README.md
   - Actualizar CATALOG-INDEX.yml (version, caracteristicas)
   - Documentar cambio en historial
```

### Deprecar Funcionalidad

Si una funcionalidad ya no es recomendada:

```markdown
1. Marcar estado como "⚠️ Deprecated" en:
   - README.md de la funcionalidad
   - CATALOG-INDEX.yml (estado: "deprecated")
   - shared/catalog/README.md (tabla de estado)

2. Documentar:
   - Razón de deprecación
   - Alternativa recomendada

3. NO eliminar inmediatamente
   - Mantener por al menos 2 versiones mayores del catálogo
```

---

## QUÉ NO HACER

```
❌ NO agregar funcionalidad sin tests
   → El catálogo es para código PROBADO

❌ NO documentar a medias
   → README incompleto = nadie lo usará

❌ NO olvidar actualizar CATALOG-INDEX.yml
   → Sin index, la funcionalidad no es encontrable

❌ NO usar código específico de negocio
   → Solo funcionalidades técnicas genéricas

❌ NO copiar código con secretos/credenciales
   → Usar variables de entorno siempre
```

---

## INTEGRACIÓN CON DIRECTIVAS SIMCO

Esta directiva se integra con:

| Directiva | Relación |
|-----------|----------|
| @REUTILIZAR | Consultar catálogo ANTES de implementar |
| @CREAR | Si no existe en catálogo, crear nuevo |
| @DOCUMENTAR | Documentar también para posible contribución |
| @VALIDAR | Todo código de catálogo debe pasar build/lint |

---

## REFERENCIAS

- **Catálogo completo:** @CATALOG (shared/catalog/)
- **Índice de búsqueda:** @CATALOG_INDEX
- **Para reutilizar:** @REUTILIZAR (SIMCO-REUTILIZAR.md)
- **Alias disponibles:** @ALIASES (core/orchestration/referencias/ALIASES.yml)

---

**Versión:** 1.0.0 | **Sistema:** SIMCO | **Mantenido por:** Tech Lead
