# _MAP: docs/02-especificaciones-tecnicas/trazabilidad/

**Última actualización:** 2025-11-07
**Propósito:** Documentación de trazabilidad entre requerimientos e implementación
**Audiencia:** Product Owners, QA Engineers, Desarrolladores
**Estado:** ⚪ Pendiente (Sin contenido)

---

## 📁 Contenido de esta Carpeta

**Estado:** Carpeta vacía - Documentación de trazabilidad pendiente

**Documentos planeados:** 0

---

## 🎯 Documentos Planeados

### Alta Prioridad

1. [ ] **TRAZABILIDAD-FRONTEND-BACKEND.md**
   - Mapeo de endpoints Backend → Componentes Frontend
   - Types sincronizados (DTOs ↔ Frontend Types)
   - Estado: Ver recomendación en reporte SIMCO

2. [ ] **TRAZABILIDAD-REQUERIMIENTOS-IMPLEMENTACION.md**
   - RF → DDL → Backend → Frontend
   - Matriz de cobertura
   - Estado de implementación por RF

3. [ ] **TRAZABILIDAD-TESTS.md**
   - Tests → Código testeado
   - Coverage map
   - Gaps de testing

### Media Prioridad

4. [ ] **TRAZABILIDAD-ENUMS.md**
   - DDL ENUMs → Backend → Frontend
   - Estado de sincronización
   - Script de validación

5. [ ] **TRAZABILIDAD-DATABASE-BACKEND.md**
   - Tablas → Entities
   - Functions → Services
   - Triggers → Event Listeners

---

## 📊 Estado Actual de Trazabilidad

**Según reporte SIMCO:**

### Referencias Docs → Apps
- ⭐⭐⭐⭐⭐ Excelente: 11% (6 documentos)
- ⭐⭐⭐ Básico: 18% (10 documentos)
- ❌ Sin referencias: 71% (39 documentos)

### Referencias Apps → Docs
- SQL: ~5% tienen comentarios de trazabilidad
- Backend: <1% tienen JSDoc con @see
- Frontend: ~2% tienen JSDoc con @see

---

## 🔗 Relación con Otros Documentos

**Ver también:**
- [Tipos Compartidos](../tipos-compartidos/) - ENUMs sincronizados
- [APIs](../apis/) - Contratos de API
- [Testing Strategy](../testing-strategy/) - Tests coverage

---

## 🚀 Próximos Pasos

Ver plan completo en:
`artifacts/reports/validation/REPORTE-SIMCO-CORREGIDO-2025-11-07.md`

**Fase 2 del plan SIMCO:** Agregar referencias en 39 documentos
**Fase 3 del plan SIMCO:** Agregar referencias en código

---

## 📚 Recursos

**Herramientas de trazabilidad:**
- OpenAPI/Swagger - API contracts
- TypeScript - Type checking
- Jest coverage - Test coverage
- Custom scripts - ENUMs validation
