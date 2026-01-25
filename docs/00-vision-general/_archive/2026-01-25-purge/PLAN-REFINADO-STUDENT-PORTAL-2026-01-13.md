# PLAN REFINADO DE CORRECCIONES - Student Portal Gamilit

**Fecha:** 2026-01-13
**Version:** 1.1.0 (Refinado)
**Referencia:** VALIDACION-PLAN-STUDENT-PORTAL-2026-01-13.md
**Estado:** Listo para Ejecucion

---

## CORRECCIONES FINALES

### CORR-001: socialAPI.ts - getLeaderboard (PRINCIPAL)

**Archivo:** `/apps/frontend/src/features/gamification/social/api/socialAPI.ts`
**Lineas:** 390-393

**Cambio:**
```typescript
// ANTES (linea 390-392):
if (FEATURE_FLAGS.USE_MOCK_DATA) {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return [];
}

// DESPUES:
if (FEATURE_FLAGS.USE_MOCK_DATA) {
  await new Promise((resolve) => setTimeout(resolve, 600));
  // Usar datos mock reales en lugar de array vacio
  const { getLeaderboardByType } = await import('../mockData/leaderboardsMockData');
  const mockData = getLeaderboardByType(type as 'global' | 'school' | 'grade' | 'friends' | 'classroom');
  return mockData.entries;
}
```

---

### CORR-002: ModuleDetailPage.tsx - Validacion de moduleId

**Archivo:** `/apps/frontend/src/apps/student/pages/ModuleDetailPage.tsx`
**Lineas:** 182-191

**Cambio:** Agregar validacion antes de usar moduleId

```typescript
// AGREGAR despues de linea 183 (const { moduleId } = useParams();):
// Validacion temprana de moduleId
if (!moduleId || moduleId === 'undefined' || moduleId.trim() === '') {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Modulo No Encontrado</h1>
        <p className="text-gray-600 mb-4">El ID del modulo no es valido o no fue proporcionado.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          Volver al Dashboard
        </button>
      </div>
    </div>
  );
}
```

---

### CORR-003: Base de Datos - Seed Achievements (OPCIONAL)

**Ejecutar solo si la BD no tiene achievements:**

```sql
-- Verificar primero:
SELECT COUNT(*) FROM gamification_system.achievements WHERE is_active = true;

-- Si COUNT = 0, ejecutar seed (ver documento de plan original)
```

---

## ORDEN DE EJECUCION

1. **CORR-001** - Corregir socialAPI.ts (Leaderboard)
2. **CORR-002** - Corregir ModuleDetailPage.tsx (Module Detail)
3. Validar con `npm run build` y `npm run lint`
4. **CORR-003** - Si es necesario, seed de BD

---

## ARCHIVOS A MODIFICAR

| Archivo | Correccion | Lineas |
|---------|------------|--------|
| socialAPI.ts | CORR-001 | 390-393 |
| ModuleDetailPage.tsx | CORR-002 | 183-196 (nuevo bloque) |

---

**Estado:** APROBADO PARA EJECUCION
