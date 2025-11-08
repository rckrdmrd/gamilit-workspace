# _MAP: docs/01-requerimientos/modulos/

**Última actualización:** 2025-11-07
**Propósito:** Documentación detallada de módulos educativos y mecánicas de ejercicios
**Audiencia:** Desarrolladores Frontend/Backend, Diseñadores Instruccionales, QA Engineers
**Estado:** 🟢 Completo (27 mecánicas documentadas)

---

## 📁 Contenido de esta Carpeta

### Documentos Índice

| Documento | Descripción | Estado |
|-----------|-------------|--------|
| [README.md](./README.md) | Índice minimalista | ✅ |
| [README-MECANICAS.md](./README-MECANICAS.md) | Índice de las 27 mecánicas | ✅ |
| [README-MODULOS-EDUCATIVOS.md](./README-MODULOS-EDUCATIVOS.md) | Índice de módulos educativos | ✅ |

### Documento Maestro de Mecánicas

| Documento | Descripción | Mecánicas | Estado |
|-----------|-------------|-----------|--------|
| [MODULOS-EDUCATIVOS.md](./MODULOS-EDUCATIVOS.md) | Especificación completa de 27 mecánicas de ejercicios | 27 | ✅ Completo |
| [MECANICAS-DOCUMENTACION-COMPLETA.md](./MECANICAS-DOCUMENTACION-COMPLETA.md) | Documentación consolidada de mecánicas | 27 | ✅ Completo |
| [RESUMEN-DOCUMENTACION-MECANICAS.md](./RESUMEN-DOCUMENTACION-MECANICAS.md) | Resumen ejecutivo de mecánicas | - | ✅ |

### Documentos por Módulo Educativo

| Documento | Módulo | Mecánicas | Estado |
|-----------|--------|-----------|--------|
| [MODULO-01-COMPRENSION-LITERAL.md](./MODULO-01-COMPRENSION-LITERAL.md) | Comprensión Literal | 6 mecánicas | ✅ |
| [MODULO-02-COMPRENSION-INFERENCIAL.md](./MODULO-02-COMPRENSION-INFERENCIAL.md) | Comprensión Inferencial | 5 mecánicas | ✅ |
| [MODULO-03-COMPRENSION-CRITICA.md](./MODULO-03-COMPRENSION-CRITICA.md) | Comprensión Crítica | 4 mecánicas | ✅ |
| [MODULO-04-LECTURA-DIGITAL.md](./MODULO-04-LECTURA-DIGITAL.md) | Lectura Digital | 6 mecánicas | ✅ |
| [MODULO-05-PRODUCCION-TEXTOS.md](./MODULO-05-PRODUCCION-TEXTOS.md) | Producción de Textos | 6 mecánicas | ✅ |

### Documentos por Mecánica Específica

| Documento | Mecánica | Estado |
|-----------|----------|--------|
| [MECANICA-DEBATE-DIGITAL.md](./MECANICA-DEBATE-DIGITAL.md) | Debate Digital (mecánica compleja) | ✅ Especificación detallada |
| [MECANICAS-MODULO-3-CRITICA.md](./MECANICAS-MODULO-3-CRITICA.md) | 4 mecánicas del Módulo 3 | ✅ |
| [MECANICAS-MODULO-4-LECTURA-DIGITAL.md](./MECANICAS-MODULO-4-LECTURA-DIGITAL.md) | 6 mecánicas del Módulo 4 | ✅ |

**Total documentos:** 14

---

## 🎮 Las 27 Mecánicas de Ejercicios

### Módulo 1: Comprensión Literal (6 mecánicas)
1. `seleccion_unica` - Selección única (opción múltiple)
2. `seleccion_multiple` - Selección múltiple (checkbox)
3. `verdadero_falso` - Verdadero/Falso
4. `completar_espacios` - Completar espacios en blanco
5. `emparejamiento` - Emparejar elementos (drag & drop)
6. `ordenamiento_secuencial` - Ordenar secuencia (drag & drop)

### Módulo 2: Comprensión Inferencial (5 mecánicas)
7. `inferencia_causa_efecto` - Identificar causa y efecto
8. `prediccion_continuacion` - Predecir continuación de texto
9. `identificacion_proposito` - Identificar propósito del autor
10. `relacion_personajes` - Relacionar personajes con acciones
11. `conclusion_partir_pistas` - Conclusión a partir de pistas

### Módulo 3: Comprensión Crítica (4 mecánicas)
12. `opinion_justificada` - Opinión con justificación (texto libre)
13. `evaluacion_argumentos` - Evaluar argumentos (escala)
14. `comparacion_perspectivas` - Comparar perspectivas
15. `debate_digital` - Debate digital asíncrono (compleja)

### Módulo 4: Lectura Digital (6 mecánicas)
16. `navegacion_hipertexto` - Navegación por hipertexto
17. `evaluacion_fuentes` - Evaluar confiabilidad de fuentes
18. `sintesis_multimedia` - Síntesis de info multimedia
19. `lectura_no_lineal` - Lectura no lineal (diagramas, mapas)
20. `busqueda_informacion` - Búsqueda de información específica
21. `analisis_datos_visuales` - Análisis de gráficas/datos visuales

### Módulo 5: Producción de Textos (6 mecánicas)
22. `escritura_creativa_guiada` - Escritura creativa con guías
23. `resumen_texto` - Resumen de texto (input libre)
24. `redaccion_carta_formal` - Redacción de carta formal
25. `creacion_mapa_conceptual` - Creación de mapa conceptual
26. `linea_tiempo` - Línea de tiempo (ordenar eventos)
27. `revision_ortografia_gramatica` - Revisión ortográfica/gramatical

---

## 🔗 Interdependencias

### Relación con Otros Módulos

**Depende de:**
- [03-contenido-educativo](../03-contenido-educativo/) - RF-EDU-001 (requerimiento padre)
- [02-gamificacion](../02-gamificacion/) - XP otorgado por completar ejercicios
- [04-progreso-seguimiento](../04-progreso-seguimiento/) - Tracking de progreso por mecánica

**Usado por:**
- Desarrolladores Frontend - Implementación de componentes React
- Desarrolladores Backend - Implementación de validators y scoring
- QA Engineers - Testing de 27 mecánicas

### Documentación Relacionada

**Especificaciones Técnicas:**
- [ET-EDU-001](../../02-especificaciones-tecnicas/03-contenido-educativo/) - Specs técnicas de mecánicas

**Desarrollo:**
- Frontend: `apps/frontend/src/components/mechanics/`
- Backend: `apps/backend/src/modules/educational/validators/`
- Backend: `apps/backend/src/modules/educational/scoring/`

**Database:**
- Schema: `educational_content.exercises` → `mechanic_type` (ENUM con 27 valores)
- Schema: `educational_content.mechanic_config` (JSONB con estructura por mecánica)

---

## 📊 Métricas

- **Total documentos:** 14
- **Mecánicas documentadas:** 27/27 (100%)
- **Módulos educativos:** 5
- **Mecánicas implementadas:** 27/27 (100%)
- **Mecánicas con tests:** ~15/27 (~55%)

---

## 🎯 Tipos de Mecánicas por Complejidad

### Simples (Validación automática directa)
- seleccion_unica, seleccion_multiple, verdadero_falso
- completar_espacios (respuesta exacta)
- emparejamiento, ordenamiento_secuencial

**Total:** ~10 mecánicas

### Medias (Validación con lógica)
- inferencia_causa_efecto, prediccion_continuacion
- navegacion_hipertexto, evaluacion_fuentes
- linea_tiempo, analisis_datos_visuales

**Total:** ~12 mecánicas

### Complejas (Validación manual/IA)
- opinion_justificada, debate_digital
- escritura_creativa_guiada, resumen_texto
- creacion_mapa_conceptual

**Total:** ~5 mecánicas

---

## 🚀 Estado de Implementación

### Implementadas y Testeadas (15 mecánicas)
✅ seleccion_unica, seleccion_multiple, verdadero_falso, completar_espacios, emparejamiento, ordenamiento_secuencial, linea_tiempo, navegacion_hipertexto, evaluacion_fuentes, analisis_datos_visuales, escritura_creativa_guiada, resumen_texto, redaccion_carta_formal, revision_ortografia_gramatica, busqueda_informacion

### Implementadas pero sin Tests Completos (12 mecánicas)
🟡 inferencia_causa_efecto, prediccion_continuacion, identificacion_proposito, relacion_personajes, conclusion_partir_pistas, opinion_justificada, evaluacion_argumentos, comparacion_perspectivas, debate_digital, sintesis_multimedia, lectura_no_lineal, creacion_mapa_conceptual

### No Implementadas (0 mecánicas)
✅ Todas implementadas

---

## ⚠️ Issues Conocidos

### P0 (Crítico)
- [ ] **Falta testing exhaustivo** - Solo 15/27 mecánicas tienen tests completos
- [ ] **Falta referencias a implementación** - Ningún documento tiene sección "Referencias a Implementación"

### P1 (Alto)
- [ ] **MODULOS-EDUCATIVOS.md** - 200+ líneas sin paths específicos a componentes/validators
- [ ] **MECANICA-DEBATE-DIGITAL.md** - Mecánica compleja sin diagrama de flujo
- [ ] **RESUMEN-DOCUMENTACION-MECANICAS.md** - Tiene path legacy `/home/isem/...` (línea 58)

### P2 (Medio)
- [ ] Falta documentación de esquemas JSON por mecánica
- [ ] Falta documentación de criterios de scoring avanzado

---

## 🚀 Próximos Pasos

### Corto Plazo
1. [ ] Agregar sección "Referencias a Implementación" en MODULOS-EDUCATIVOS.md
2. [ ] Limpiar referencias legacy en RESUMEN-DOCUMENTACION-MECANICAS.md
3. [ ] Crear tests para 12 mecánicas faltantes

### Medio Plazo
4. [ ] Documentar esquemas JSON de `mechanic_config` por mecánica
5. [ ] Crear diagrama de flujo para mecánicas complejas (debate_digital, creacion_mapa_conceptual)
6. [ ] Documentar sistema de scoring adaptativo

### Largo Plazo
7. [ ] Extender a 40+ mecánicas (nuevas categorías)
8. [ ] Sistema de recomendación de mecánicas por nivel
9. [ ] Editor visual de ejercicios para maestros

---

## 📚 Guía de Navegación

**Si buscas...**
- **Lista completa de mecánicas:** Ver [MODULOS-EDUCATIVOS.md](./MODULOS-EDUCATIVOS.md)
- **Documentación consolidada:** Ver [MECANICAS-DOCUMENTACION-COMPLETA.md](./MECANICAS-DOCUMENTACION-COMPLETA.md)
- **Mecánicas de un módulo específico:** Ver MODULO-0X-*.md
- **Implementación de mecánica:** Ver `apps/frontend/src/components/mechanics/` (agregar referencias cuando se actualice)
- **Validators:** Ver `apps/backend/src/modules/educational/validators/` (agregar referencias cuando se actualice)
