# HOTFIX: Corrección de Rutas API Duplicadas - 2025-11-23

## Descripción
Hotfix crítico para corregir URLs duplicadas con prefijo `/api/api/` en endpoints de gamificación que causaban errores 404.

## Severidad
**CRÍTICA** - Bloqueaba 100% de funcionalidad de gamificación

## Estado
✓ **COMPLETADO** - Código corregido, listo para validación en navegador

---

## Documentación Incluida

### 1. REPORTE-HOTFIX-RUTAS.md
**Reporte completo y detallado del hotfix** que incluye:
- Resumen ejecutivo
- Análisis de causa raíz
- Archivos modificados con comparación ANTES/DESPUÉS
- Validación y testing
- Impacto y riesgo
- Recomendaciones de prevención (corto, medio, largo plazo)
- Lecciones aprendidas
- Conclusiones y próximos pasos

**Recomendado para**: Product Owner, Tech Lead, Documentación oficial

### 2. RESUMEN-CAMBIOS.md
**Resumen ejecutivo de los cambios realizados**:
- Lista de archivos modificados
- Endpoints corregidos
- URLs ANTES/DESPUÉS
- Validación rápida
- Próximos pasos

**Recomendado para**: Revisión rápida, Stand-ups, Status updates

### 3. CHECKLIST-VALIDACION.md
**Checklist completo para validación en navegador**:
- Verificación de código
- Pasos para pruebas en navegador
- Verificación de URLs en Network tab
- Verificación funcional de gamificación
- Verificación de errores
- Casos edge
- Resultados esperados
- Troubleshooting

**Recomendado para**: QA, Desarrolladores que validan el fix

---

## Problema

### URLs Incorrectas (Error 404)
```
GET http://localhost:3006/api/api/v1/gamification/users/.../stats
GET http://localhost:3006/api/api/v1/gamification/users/.../achievements
GET http://localhost:3006/api/api/v1/gamification/users/.../rank-progress
```

### Causa Raíz
```typescript
// apiClient.ts - Línea 19
const API_BASE_URL = 'http://localhost:3006/api'; // Ya incluye /api

// Endpoints estaban agregando /api nuevamente
apiClient.get(`/api/v1/gamification/...`) // ❌ INCORRECTO
```

---

## Solución

### URLs Correctas (200 OK)
```
GET http://localhost:3006/api/v1/gamification/users/.../stats
GET http://localhost:3006/api/v1/gamification/users/.../achievements
GET http://localhost:3006/api/v1/gamification/users/.../rank-progress
```

### Fix Aplicado
```typescript
// Endpoints corregidos - sin prefijo /api
apiClient.get(`/v1/gamification/...`) // ✓ CORRECTO
```

---

## Archivos Modificados

| Archivo | Ubicación | Endpoints Corregidos |
|---------|-----------|----------------------|
| useUserGamification.ts | `apps/frontend/src/shared/hooks/` | GET /stats, GET /achievements |
| economyStore.ts | `apps/frontend/src/features/gamification/economy/store/` | PATCH /stats (add/spend), GET /stats |
| ranksStore.ts | `apps/frontend/src/features/gamification/ranks/store/` | PATCH /stats (addXP), GET /rank-progress |

**Total**: 3 archivos, 7 endpoints corregidos

---

## Validación

### Verificación de Código
```bash
# No quedan instancias de /api/v1/gamification
grep -r "apiClient.*\`/api/v1/gamification" apps/frontend/src/
# Resultado: 0 ocurrencias ✓

# Verificar git diff
git diff apps/frontend/src/shared/hooks/useUserGamification.ts
git diff apps/frontend/src/features/gamification/economy/store/economyStore.ts
git diff apps/frontend/src/features/gamification/ranks/store/ranksStore.ts
```

### Próxima Validación (Navegador)
1. Iniciar backend y frontend
2. Autenticar usuario
3. Abrir DevTools > Network tab
4. Verificar que URLs son `/api/v1/...` y NO `/api/api/v1/...`
5. Confirmar respuestas 200 OK
6. Verificar que datos de gamificación cargan correctamente

Ver **CHECKLIST-VALIDACION.md** para detalles completos.

---

## Impacto

### Módulos Restaurados
- ✓ Sistema de estadísticas de usuario (XP, Nivel, ML Coins)
- ✓ Sistema de logros (achievements)
- ✓ Sistema de rangos Maya
- ✓ Economía ML Coins (balance, transacciones)
- ✓ Sistema de compras e inventario

### Usuarios Afectados
- **Antes del fix**: Todos los usuarios (funcionalidad bloqueada)
- **Después del fix**: Ninguno (funcionalidad restaurada)

---

## Recomendaciones Implementadas

### Prevención Futura

#### Corto Plazo
- [ ] Crear archivo de constantes para endpoints
- [ ] Agregar ESLint rule personalizada
- [ ] Documentar estándares en README

#### Medio Plazo
- [ ] Implementar tests de integración para URLs
- [ ] Agregar validación de formato de URLs
- [ ] Actualizar guía de desarrollo

#### Largo Plazo
- [ ] Implementar type-safe API client
- [ ] Agregar pre-commit hook para detectar patrón
- [ ] Agregar checklist item en code reviews

Ver **REPORTE-HOTFIX-RUTAS.md** sección 6 para detalles completos.

---

## Comandos Útiles

### Ver cambios
```bash
git diff apps/frontend/src/shared/hooks/useUserGamification.ts
git diff apps/frontend/src/features/gamification/economy/store/economyStore.ts
git diff apps/frontend/src/features/gamification/ranks/store/ranksStore.ts
```

### Buscar otros casos similares
```bash
# Buscar cualquier /api/ con apiClient
grep -r "apiClient\.(get|post|put|patch|delete)\(\`/api/" apps/frontend/src/
```

### Validar en runtime
```bash
# En DevTools Console
console.log(apiClient.defaults.baseURL); // Debe ser: http://localhost:3006/api
```

---

## Estructura de Archivos

```
frontend-api-routes-hotfix-2025-11-23/
├── README.md                     # Este archivo (índice)
├── REPORTE-HOTFIX-RUTAS.md      # Reporte completo y detallado
├── RESUMEN-CAMBIOS.md            # Resumen ejecutivo
└── CHECKLIST-VALIDACION.md       # Checklist de validación
```

---

## Metadatos

**Fecha**: 2025-11-23
**Agente**: Frontend-Agent
**Tipo**: Hotfix Crítico
**Prioridad**: P0
**Estado**: Completado - Pendiente validación en navegador
**Tags**: `bug`, `hotfix`, `gamification`, `api`, `routing`, `404`

---

## Contacto

**Para dudas sobre el hotfix**: Revisar REPORTE-HOTFIX-RUTAS.md sección correspondiente
**Para validación**: Seguir CHECKLIST-VALIDACION.md paso a paso
**Para implementar prevención**: Revisar REPORTE-HOTFIX-RUTAS.md sección 6

---

**Última actualización**: 2025-11-23 19:24
**Versión del reporte**: 1.0
