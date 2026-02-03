# Mapa de Documentacion - Mecanicas de Ejercicios

**Ubicacion:** `docs/90-transversal/mecanicas/`
**Proyecto:** GAMILIT - Student Portal
**Actualizado:** 2026-01-20

---

## Proposito

Esta carpeta contiene las especificaciones tecnicas de todas las mecanicas de ejercicios implementadas en GAMILIT. Es la **fuente unica de verdad (SSOT)** para desarrolladores que necesitan crear, modificar o entender ejercicios.

---

## Contenido

| Archivo | Descripcion | Mecanicas |
|---------|-------------|-----------|
| `SPEC-MECANICAS-M1-M3.md` | Mecanicas de comprension literal, inferencial y critica | 18 + 4 aux |
| `SPEC-MECANICAS-M4.md` | Mecanicas de lectura digital y pensamiento critico | 5 |
| `SPEC-MECANICAS-M5.md` | Mecanicas de produccion creativa multimedia | 3 |
| `SPEC-MECANICAS-EJERCICIOS.md` | Documento consolidado de todas las mecanicas | 33 total |

---

## Inventario de Mecanicas

### Por Modulo

| Modulo | Descripcion | Cantidad | Documento |
|--------|-------------|----------|-----------|
| M1 | Comprension Literal | 7 | SPEC-MECANICAS-M1-M3.md |
| M2 | Comprension Inferencial | 6 | SPEC-MECANICAS-M1-M3.md |
| M3 | Comprension Critica | 5 | SPEC-MECANICAS-M1-M3.md |
| M4 | Lectura Digital | 5 | SPEC-MECANICAS-M4.md |
| M5 | Produccion Creativa | 3 | SPEC-MECANICAS-M5.md |
| Aux | Auxiliares | 4 | SPEC-MECANICAS-M1-M3.md |

**Total:** 30 mecanicas implementadas

### Por Tipo de Evaluacion

| Tipo | Cantidad | Descripcion |
|------|----------|-------------|
| Automatica | 14 | Validacion inmediata sin intervencion |
| Parcial | 7 | Parte automatica, parte manual |
| Manual | 9 | Requiere revision docente |

---

## Guia de Uso

### Para Desarrolladores Frontend

1. **Crear nuevo componente:**
   - Consultar la especificacion de la mecanica
   - Usar la estructura de tipos definida
   - Implementar el formato de respuesta exacto

2. **Modificar mecanica existente:**
   - Verificar compatibilidad hacia atras
   - Actualizar tipos si es necesario
   - Documentar cambios en este directorio

### Para Desarrolladores Backend

1. **Crear validador:**
   - Usar el formato de respuesta como schema
   - Implementar criterios de evaluacion documentados
   - Manejar campos sanitizados (FE-059)

2. **Crear ejercicios:**
   - Seguir la estructura de contenido JSONB
   - Incluir todos los campos requeridos
   - Probar con mock data de referencia

### Para Creadores de Contenido

1. **Diseno de ejercicios:**
   - Consultar estructura de contenido
   - Ver ejemplos completos
   - Respetar limites de configuracion

---

## Documentos Relacionados

- `docs/03-fase-extensiones/EXT-004-ejercicios/` - Roadmap de nuevos ejercicios
- `apps/frontend/src/features/mechanics/` - Implementacion frontend
- `apps/backend/src/modules/educational/` - Implementacion backend

---

## Historial de Cambios

| Fecha | Version | Cambio |
|-------|---------|--------|
| 2026-01-20 | 1.0.0 | Documentacion inicial de 30 mecanicas |

---

*Documento de navegacion - GAMILIT Student Portal*
