# Mapa de Contenidos: Directivas y Políticas

**Propósito:** Define directivas, políticas y procesos compartidos para todos los agentes NEXUS
**Archivos totales:** 11
**Última actualización:** 2025-11-02

---

## 📋 Estructura de Archivos

```
directivas/
├── DIRECTIVAS-PRINCIPALES.md                # ⭐ Todas las directivas consolidadas
├── DIRECTIVA-VALIDACION-DOCUMENTACION.md    # 🚨 CRÍTICA: Validación contra /docs/
├── GUIA-ORQUESTACION.md                     # Cuándo usar subagentes
├── DIRECTIVAS-FLUJOS.md                     # Análisis → Planeación → Ejecución
├── DIRECTIVAS-MICROCICLOS-ANIDADOS.md       # Microciclos hasta 5 niveles
├── DIRECTIVAS-PARALELIZACION.md             # 15 subagentes max compartidos
├── POLITICAS-MODULARIZACION.md              # Archivos <400L
├── PRINCIPIOS-SOLID-DOCS.md                 # Normalización documentación
├── DELIMITACION-PERFILES.md                 # Responsabilidades por perfil
├── POLITICA-TESTING.md                      # Coverage y testing
├── GIT-HOOKS.md                             # Git hooks manuales
├── PRIORIDADES-SUBAGENTES.md                # Sistema de prioridades
└── _MAP.md                                  # Este archivo
```

---

## 🗂️ Archivos por Categoría

### 📌 Archivo Principal (LEER PRIMERO)

**DIRECTIVAS-PRINCIPALES.md** - Consolidado de todas las directivas
- DE-001 a DE-009: Directivas de Ejecución
- DC-001 a DC-004: Directivas de Calidad
- DS-001 a DS-003: Directivas de Seguridad
- DM-001 a DM-004: Directivas de Comunicación
- DT-001 a DT-004: Directivas de Testing
- DR-001 a DR-003: Directivas de Review
- DG-001 a DG-005: Directivas de Git
- DV-001 a DV-004: Directivas de Validación
- DF-001 a DF-005: Directivas de Flujos

---

### 🔧 Guías de Procesos

**🚨 DIRECTIVA-VALIDACION-DOCUMENTACION.md** (LEER PRIMERO)
- Validación obligatoria contra `/docs/` para evitar alucinaciones
- Navegación modularizada con `_MAP.md`
- Validación en 3 momentos (ANTES, DURANTE, DESPUÉS)
- Actualización de `/docs/03-desarrollo/` y `/docs/04-planificacion/`
- Protocolo de actualización total cuando algo cambia
- Checklist de validación por fase
- Casos de bloqueo y qué hacer

**GUIA-ORQUESTACION.md**
- Criterios de cuándo delegar a subagentes
- Checklist pre-ejecución
- Protocolo de verificación de slots

**DIRECTIVAS-FLUJOS.md**
- DF-001: Fase de Análisis
- DF-002: Fase de Planeación
- DF-003: Fase de Ejecución
- DF-004: Validación
- DF-005: Orden de ejecución

---

### 📏 Políticas y Estándares

**POLITICAS-MODULARIZACION.md**
- Regla de archivos <400 líneas
- Proceso de modularización
- Excepciones permitidas

**PRINCIPIOS-SOLID-DOCS.md**
- Aplicación de SOLID a documentación
- Normalización (1FN, 2FN, 3FN, BCNF)
- Principio DRY
- Relaciones entre archivos

**DIRECTIVAS-MICROCICLOS-ANIDADOS.md**
- Criterios de anidación (hasta 5 niveles)
- Nomenclatura de microciclos
- Decisión de cuándo anidar más

---

### 🤖 Orquestación y Coordinación

**DIRECTIVAS-PARALELIZACION.md**
- Límite de 15 subagentes compartidos
- Protocolo de uso del registro
- Sistema de prioridades

**DELIMITACION-PERFILES.md**
- Responsabilidades por perfil (BACKEND, FRONTEND, DATABASE, DEVOPS, INTEGRATION)
- Flujos de coordinación
- Resolución de conflictos

---

## 🔄 Orden de Lectura Recomendado

### Para inicializar un agente:
1. **DIRECTIVA-VALIDACION-DOCUMENTACION.md** - 🚨 Evitar alucinaciones
2. **DIRECTIVAS-PRINCIPALES.md** - Entender todas las directivas
3. **GUIA-ORQUESTACION.md** - Entender cuándo usar subagentes
4. **DIRECTIVAS-FLUJOS.md** - Entender las 3 fases de trabajo
5. **DELIMITACION-PERFILES.md** - Entender responsabilidades del perfil

### Para planear una tarea:
1. **DIRECTIVA-VALIDACION-DOCUMENTACION.md** - ¿Está documentado en `/docs/`?
2. **GUIA-ORQUESTACION.md** - ¿Usar subagentes?
3. **DIRECTIVAS-MICROCICLOS-ANIDADOS.md** - ¿Cómo descomponer?
4. **DIRECTIVAS-PARALELIZACION.md** - ¿Cuántos slots disponibles?

### Para validar:
1. **DIRECTIVA-VALIDACION-DOCUMENTACION.md** - Proceso de validación completo
2. **DIRECTIVAS-FLUJOS.md** (DF-004) - Validación transversal

### Para modularizar:
1. **POLITICAS-MODULARIZACION.md** - Reglas de modularización
2. **PRINCIPIOS-SOLID-DOCS.md** - Principios de documentación

---

## 🔗 Referencias Cruzadas

- **Perfiles de agentes:** `.claude/agents/INIT-NEXUS-*.md`
- **Templates:** `.claude/templates/TEMPLATES-SUBAGENTES.md`
- **Referencias del proyecto:** `.claude/referencias/CONTEXTO-REFERENCIAS.md`
- **Constantes:** `.claude/constants/CONSTANTS-ARCHITECTURE.md`

---

## ⚠️ Directivas Críticas (Prioridad Alta)

Estas directivas son **OBLIGATORIAS** y su violación puede causar problemas graves:

1. **🚨 DV-MASTER:** [DIRECTIVA-VALIDACION-DOCUMENTACION.md](./DIRECTIVA-VALIDACION-DOCUMENTACION.md) - Validación obligatoria contra `/docs/` para evitar alucinaciones
2. **DE-002:** Orquestación de subagentes (no exceder 15 slots)
3. **DE-003:** Modularización (archivos <400L)
4. **DE-008:** Actualización post-tarea (mantener documentación actualizada)
5. **DG-003:** No commitear secrets

### Detalle DV-MASTER (Más Crítica)

**Ver documento completo:** [DIRECTIVA-VALIDACION-DOCUMENTACION.md](./DIRECTIVA-VALIDACION-DOCUMENTACION.md)

**Regla de Oro:**
> "Nada se implementa sin estar documentado. Nada se documenta sin estar actualizado."

**Obligaciones:**
- ✅ Validar ANTES contra `/docs/01-requerimientos/` y `/docs/02-especificaciones-tecnicas/`
- ✅ Validar DURANTE contra specs técnicas
- ✅ Validar DESPUÉS y actualizar `/docs/03-desarrollo/` y `/docs/04-planificacion/`
- ✅ Usar `_MAP.md` para navegación modularizada, NO leer todos los archivos
- ✅ Actualizar TODO lo que referencie algo que cambió

---

**Creado:** 2025-11-02
**Autor:** Sistema NEXUS
**Versión:** 1.0
