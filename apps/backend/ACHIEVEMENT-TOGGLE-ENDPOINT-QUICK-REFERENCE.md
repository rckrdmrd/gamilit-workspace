# Achievement Toggle Endpoint - Referencia Rápida

**Fecha de creación:** 2025-11-25
**Ticket/Issue:** PATCH endpoint para toggle de logros
**Estado:** ✅ Implementado

---

## 📋 Resumen

Se implementó el endpoint PATCH para actualizar el estado activo/inactivo de achievements desde el panel de administración.

---

## 🎯 Endpoint

### **PATCH** `/api/v1/gamification/achievements/:id`

Actualiza el estado activo/inactivo de un achievement.

#### Parámetros de Ruta
- `id` (string, required): UUID del achievement

#### Request Body
```json
{
  "is_active": true | false
}
```

#### Response Success (200)
```json
{
  "success": true,
  "achievement": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Primer Paso",
    "description": "Completa tu primer ejercicio",
    "category": "starter",
    "icon": "trophy",
    "is_secret": false,
    "is_active": false,
    "is_repeatable": false,
    "ml_coins_reward": 50,
    "conditions": { "type": "progress", "exercises_completed": 1 },
    "rewards": { "xp": 100, "badge": null, "ml_coins": 50 },
    "order_index": 1,
    "points_value": 100,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T12:45:00Z"
  }
}
```

#### Response Errors
- **400 Bad Request**: Datos inválidos en la solicitud
- **404 Not Found**: Achievement no encontrado

---

## 📁 Archivos Modificados/Creados

### Archivos Nuevos
1. **`src/modules/gamification/dto/achievements/update-achievement-status.dto.ts`**
   - DTO específico para toggle de estado
   - Validación con `@IsBoolean()`
   - Documentación Swagger

2. **`scripts/test-achievement-toggle.sh`**
   - Script de prueba del endpoint
   - Incluye verificación antes/después
   - Manejo de autenticación

3. **`ACHIEVEMENT-TOGGLE-ENDPOINT-QUICK-REFERENCE.md`**
   - Documentación de referencia rápida

### Archivos Modificados
1. **`src/modules/gamification/dto/index.ts`**
   - Exportación del nuevo DTO `UpdateAchievementStatusDto`

2. **`src/modules/gamification/services/achievements.service.ts`**
   - Nuevo método: `updateAchievementStatus(id: string, isActive: boolean)`

3. **`src/modules/gamification/controllers/achievements.controller.ts`**
   - Nuevo endpoint PATCH con decoradores completos
   - Validación UUID con `ParseUUIDPipe`
   - Documentación Swagger completa

---

## 🔧 Implementación

### 1. DTO (UpdateAchievementStatusDto)
```typescript
export class UpdateAchievementStatusDto {
  @ApiProperty({
    description: 'Estado del logro - true: activo, false: inactivo',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  is_active!: boolean;
}
```

### 2. Service Method
```typescript
async updateAchievementStatus(id: string, isActive: boolean): Promise<Achievement> {
  const achievement = await this.findById(id);
  achievement.is_active = isActive;
  return await this.achievementRepo.save(achievement);
}
```

### 3. Controller Endpoint
```typescript
@Patch('achievements/:id')
@HttpCode(HttpStatus.OK)
@ApiOperation({
  summary: 'Toggle achievement active status',
  description: 'Actualiza el estado activo/inactivo de un achievement.',
})
async updateAchievementStatus(
  @Param('id', ParseUUIDPipe) id: string,
  @Body() dto: UpdateAchievementStatusDto,
): Promise<{ success: boolean; achievement: any }> {
  const achievement = await this.achievementsService.updateAchievementStatus(
    id,
    dto.is_active,
  );
  return { success: true, achievement };
}
```

---

## 🗄️ Base de Datos

### Tabla: `gamification_system.achievements`

Campo relevante:
```sql
is_active boolean DEFAULT true
```

**Índice existente:**
```sql
CREATE INDEX idx_achievements_active
ON gamification_system.achievements
USING btree (is_active)
WHERE (is_active = true);
```

---

## 🧪 Pruebas

### Usando el Script
```bash
# Desactivar un achievement
./scripts/test-achievement-toggle.sh 550e8400-e29b-41d4-a716-446655440000 false

# Activar un achievement
./scripts/test-achievement-toggle.sh 550e8400-e29b-41d4-a716-446655440000 true
```

### Usando cURL
```bash
# Desactivar
curl -X PATCH http://localhost:3000/api/v1/gamification/achievements/{id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"is_active": false}'

# Activar
curl -X PATCH http://localhost:3000/api/v1/gamification/achievements/{id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"is_active": true}'
```

---

## ✅ Validación TypeScript

```bash
cd apps/backend
npx tsc --noEmit
# ✅ Sin errores
```

---

## 🔐 Seguridad

- **Autenticación:** Protegido con `JwtAuthGuard`
- **Validación:**
  - UUID validation con `ParseUUIDPipe`
  - Boolean validation con `@IsBoolean()`
- **Autorización:** Requiere permisos de administrador (configurar según necesidad)

---

## 🎨 Integración Frontend

### Ejemplo de uso en AdminGamificationPage

```typescript
const toggleAchievementStatus = async (achievementId: string, isActive: boolean) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/gamification/achievements/${achievementId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: isActive }),
      }
    );

    const data = await response.json();

    if (data.success) {
      console.log('Achievement status updated:', data.achievement);
      // Actualizar UI
    }
  } catch (error) {
    console.error('Error updating achievement status:', error);
  }
};
```

---

## 📝 Notas

1. **Campo `is_active`:**
   - Ya existía en la entidad `Achievement`
   - Ya existía en la tabla de BD
   - Ya existía en el DTO `UpdateAchievementDto`
   - Se creó DTO específico para toggle (`UpdateAchievementStatusDto`)

2. **Decisión de diseño:**
   - Se creó un DTO específico (`UpdateAchievementStatusDto`) en lugar de usar `UpdateAchievementDto`
   - Razón: Mayor claridad semántica y validación específica para toggle
   - El DTO solo expone `is_active`, evitando cambios accidentales en otros campos

3. **Patrón seguido:**
   - Consistente con otros endpoints del módulo
   - Documentación Swagger completa
   - Validaciones robustas
   - Respuesta estructurada con `success` + `data`

---

## 🚀 Próximos Pasos (Opcional)

- [ ] Agregar tests unitarios para el service method
- [ ] Agregar tests e2e para el endpoint
- [ ] Implementar audit logging para cambios de estado
- [ ] Agregar validación de permisos de administrador
- [ ] Notificar a usuarios afectados cuando se desactiva un achievement

---

## 📚 Referencias

- **Entity:** `apps/backend/src/modules/gamification/entities/achievement.entity.ts`
- **Service:** `apps/backend/src/modules/gamification/services/achievements.service.ts`
- **Controller:** `apps/backend/src/modules/gamification/controllers/achievements.controller.ts`
- **DTO:** `apps/backend/src/modules/gamification/dto/achievements/update-achievement-status.dto.ts`
- **DDL:** `apps/database/ddl/schemas/gamification_system/tables/03-achievements.sql`
