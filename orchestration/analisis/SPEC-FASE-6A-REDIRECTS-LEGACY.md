# SPEC-FASE-6A: Redirects y Limpieza Rutas Legacy

**Fecha:** 2025-12-15
**Version:** 1.0
**Estado:** LISTO PARA IMPLEMENTAR
**Riesgo:** MUY BAJO

---

## 1. OBJETIVO

Implementar redirect para la ruta `/teacher/resources` que es un placeholder sin funcionalidad real, redirigiendo al dashboard del teacher.

---

## 2. ANALISIS DE IMPACTO

### 2.1 Ruta a Modificar

```yaml
Ruta: /teacher/resources
Componente_Actual: TeacherResourcesPage
Estado_Actual: PLACEHOLDER (UnderConstruction)
Funcionalidad_Implementada: 0%
Usuarios_Potencialmente_Afectados: 0 (no aparece en navegacion)
```

### 2.2 Componente TeacherResourcesPage

```typescript
// Ubicacion: /apps/teacher/pages/TeacherResourcesPage.tsx
// Lineas: 55
// Estado: Solo muestra UnderConstruction
// Features listadas pero NO implementadas:
//   - Biblioteca de recursos educativos
//   - Subir y organizar materiales didacticos
//   - Compartir recursos con estudiantes
//   - Buscar recursos por materia y tema
//   - Favoritos y colecciones personalizadas
//   - Integracion con Google Drive
```

### 2.3 Verificacion de Uso

```yaml
Sidebar_Teacher:
  - NO incluido en teacherItems (removido en FASE 5A)

App.tsx_Rutas:
  - Ruta definida en linea 224-231
  - Import en linea 41

Otros_Referencias: NINGUNA
```

---

## 3. CAMBIOS REQUERIDOS

### 3.1 Archivo: App.tsx

**Ubicacion:** `/apps/frontend/src/App.tsx`

#### CAMBIO 1: Modificar Ruta (Lineas 224-231)

**ANTES:**
```typescript
          <Route
            path="/teacher/resources"
            element={
              <ProtectedRoute>
                <TeacherResourcesPage />
              </ProtectedRoute>
            }
          />
```

**DESPUES:**
```typescript
          {/* FASE 6A: /teacher/resources redirige a dashboard (placeholder sin funcionalidad) */}
          <Route
            path="/teacher/resources"
            element={<Navigate to="/teacher/dashboard" replace />}
          />
```

#### CAMBIO 2: Remover Import (Linea 41)

**ANTES:**
```typescript
import TeacherResourcesPage from '@/apps/teacher/pages/TeacherResourcesPage';
```

**DESPUES:**
```typescript
// FASE 6A: TeacherResourcesPage removido - ruta redirigida a dashboard
// import TeacherResourcesPage from '@/apps/teacher/pages/TeacherResourcesPage';
```

### 3.2 Archivo: TeacherResourcesPage.tsx

**Accion:** MANTENER SIN CAMBIOS

**Razon:**
- El archivo puede ser util como referencia para futuras fases
- No genera codigo muerto en bundle (no es importado)
- Contiene lista de features planeadas

---

## 4. CODIGO EXACTO A IMPLEMENTAR

### 4.1 App.tsx - Seccion Teacher Routes Modificada

```typescript
// ... otras rutas teacher ...

          <Route
            path="/teacher/progress"
            element={
              <ProtectedRoute>
                <TeacherProgressPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/reports"
            element={
              <ProtectedRoute>
                <TeacherReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/responses"
            element={
              <ProtectedRoute>
                <TeacherExerciseResponsesPage />
              </ProtectedRoute>
            }
          />

          {/* FASE 6A: Redirect - /teacher/resources es placeholder sin funcionalidad */}
          <Route
            path="/teacher/resources"
            element={<Navigate to="/teacher/dashboard" replace />}
          />

          <Route
            path="/teacher/classes"
            element={
              <ProtectedRoute>
                <TeacherClassesPage />
              </ProtectedRoute>
            }
          />

// ... resto de rutas ...
```

---

## 5. DEPENDENCIAS

### 5.1 Imports Existentes (No Cambios Requeridos)

```typescript
// Navigate ya esta importado en la linea 1
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
```

### 5.2 Archivos Impactados

| Archivo | Impacto | Accion |
|---------|---------|--------|
| App.tsx | MODIFICAR | Cambiar ruta a redirect |
| TeacherResourcesPage.tsx | NINGUNO | Mantener como referencia |
| GamilitSidebar.tsx | NINGUNO | Ya no incluye este item |

---

## 6. MATRIZ DE DEPENDENCIAS

```yaml
App.tsx:
  importado_por:
    - main.tsx (punto de entrada)

  impacta:
    - Sistema de rutas completo

  dependencias_del_cambio:
    - Navigate (react-router-dom) - YA IMPORTADO

TeacherResourcesPage.tsx:
  importado_por:
    - App.tsx (SERA REMOVIDO)

  impacta:
    - NINGUNO despues del cambio
```

---

## 7. PRUEBAS REQUERIDAS

### 7.1 Prueba de Redirect

```yaml
test_redirect_resources:
  pasos:
    1. Navegar directamente a /teacher/resources
    2. Verificar redireccion a /teacher/dashboard
    3. Verificar URL actualizada (replace: true)
    4. Verificar que dashboard carga correctamente

  resultado_esperado:
    - URL cambia a /teacher/dashboard
    - Dashboard del teacher se muestra
    - Sin errores en consola
```

### 7.2 Prueba de No Regresion

```yaml
test_otras_rutas_teacher:
  rutas_a_verificar:
    - /teacher/dashboard
    - /teacher/monitoring
    - /teacher/progress
    - /teacher/alerts
    - /teacher/classes
    - /teacher/assignments
    - /teacher/responses
    - /teacher/reviews
    - /teacher/reports
    - /teacher/gamification
    - /teacher/students (legacy)
    - /teacher/analytics (legacy)
    - /teacher/settings

  resultado_esperado:
    - Todas las rutas cargan sin errores
    - Navegacion sidebar funciona
```

---

## 8. ROLLBACK

### 8.1 Procedimiento de Reversion

```yaml
pasos:
  1. Restaurar import de TeacherResourcesPage
  2. Cambiar redirect por ProtectedRoute con componente

tiempo_estimado: 5 minutos
impacto: MINIMO
```

### 8.2 Codigo de Rollback

```typescript
// En App.tsx

// 1. Restaurar import
import TeacherResourcesPage from '@/apps/teacher/pages/TeacherResourcesPage';

// 2. Restaurar ruta
<Route
  path="/teacher/resources"
  element={
    <ProtectedRoute>
      <TeacherResourcesPage />
    </ProtectedRoute>
  }
/>
```

---

## 9. CRITERIOS DE ACEPTACION

- [ ] /teacher/resources redirige a /teacher/dashboard
- [ ] Redireccion usa `replace` (no agrega historial)
- [ ] No hay errores en consola
- [ ] Otras rutas teacher funcionan correctamente
- [ ] Import de TeacherResourcesPage comentado/removido
- [ ] Comentario documentando razon del redirect

---

## 10. NOTAS DE IMPLEMENTACION

1. **Navigate con replace:** Usar `replace` evita que el usuario pueda volver a la ruta del placeholder con el boton atras

2. **Mantener archivo:** TeacherResourcesPage.tsx se mantiene como referencia de features futuras

3. **No borrar imports sin verificar:** Aunque removemos el import, el archivo no genera codigo muerto gracias a tree-shaking

4. **Documentacion inline:** El comentario en la ruta documenta la decision para futuros desarrolladores

---

**Documento generado:** 2025-12-15
**Por:** Requirements-Analyst Agent
**Estado:** LISTO PARA IMPLEMENTAR
