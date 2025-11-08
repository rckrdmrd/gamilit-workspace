# Quick Reference - Backend Types Inventory

**Actualizado:** 2025-11-03 | **Total de Tipos:** 223

---

## Resumen Rápido

```
ENUMs .......................... 46
Constantes ENUM ................ 1
Interfaces ..................... 26
Types .......................... 11
DTOs ........................... 139
─────────────────────────────────
TOTAL .......................... 223
```

---

## ENUMs Más Importantes

### Top 5 por Valores

| ENUM | Valores | Ubicación |
|------|---------|-----------|
| ExerciseTypeEnum | 31 | shared/constants/enums.constants.ts |
| TransactionTypeEnum | 10 | shared/constants/enums.constants.ts |
| DifficultyLevelEnum | 8 | shared/constants/enums.constants.ts |
| NotificationTypeEnum | 8 | shared/constants/enums.constants.ts |
| AchievementCategoryEnum | 7 | shared/constants/enums.constants.ts |

### ENUMs Críticos (Mapeo a BD)

```typescript
// Autenticación
AuthProviderEnum        → LOCAL, GOOGLE, FACEBOOK, APPLE, MICROSOFT, GITHUB
UserStatusEnum          → ACTIVE, INACTIVE, SUSPENDED, PENDING

// Gamificación
MayaRank                → AJAW, NACOM, AH_KIN, HALACH_UINIC, KUKUKULKAN
DifficultyLevelEnum     → BEGINNER, INTERMEDIATE, ADVANCED, EASY, HARD...
ComodinTypeEnum         → PISTAS, VISION_LECTORA, SEGUNDA_OPORTUNIDAD

// Progreso
ProgressStatusEnum      → NOT_STARTED, IN_PROGRESS, COMPLETED, REVIEWED, MASTERED
AttemptResultEnum       → CORRECT, INCORRECT, PARTIAL, SKIPPED

// Social
FriendshipStatusEnum    → PENDING, ACCEPTED, REJECTED, BLOCKED
ClassroomMemberStatusEnum → ACTIVE, INACTIVE, WITHDRAWN, COMPLETED

// Notificaciones
NotificationTypeEnum    → INFO, SUCCESS, WARNING, ERROR, ACHIEVEMENT...
NotificationChannelEnum → IN_APP, EMAIL, PUSH, SMS
```

---

## Tipos Core (Shared)

```typescript
// auth/types
User                    // Modelo base usuario
UserProfile             // Perfil detallado
AuthUser                // Usuario en request
AuthRequest extends Request  // Express + user

// api/types
APIResponse<T>          // Respuesta genérica
PaginatedResponse<T>    // Respuesta paginada
PaginationParams        // Query params paginación

// gamification/types
UserStats               // XP, ML Coins, ranking
Achievement             // Logros desbloqueados
MLCoinsTransaction      // Transacciones monedas
```

---

## DTOs por Módulo

| Módulo | Cantidad | Ejemplos |
|--------|----------|----------|
| **Admin** | 26 | CreateOrganizationDto, AuditLogDto |
| **Auth** | 31 | CreateUserDto, LoginDto, RegisterUserDto |
| **Gamification** | 26 | CreateAchievementDto, CreateMissionDto |
| **Social** | 16 | CreateFriendshipDto, CreateClassroomDto |
| **Progress** | 10 | CreateExerciseAttemptDto, CreateLearningSessionDto |
| **Educational** | 8 | CreateExerciseDto, CreateModuleDto |
| **Powerups** | 8 | PurchasePowerupDto, UsePowerupDto |
| **Content** | 6 | CreateContentTemplateDto |
| **Missions** | 4 | ClaimMissionRewardsDto |
| **Notifications** | 4 | CreateNotificationDto |

---

## Patrones Comunes

### DTO de Creación
```typescript
// Pattern: Create{Entity}Dto
CreateUserDto
CreateExerciseDto
CreateAchievementDto
CreateMissionDto
CreateFriendshipDto
CreateClassroomDto
```

### DTO de Respuesta
```typescript
// Pattern: {Entity}ResponseDto
UserResponseDto
ExerciseResponseDto
AchievementResponseDto
MissionResponseDto
NotificationResponseDto
FriendshipResponseDto
ClassroomResponseDto
```

### DTO de Query/Paginación
```typescript
// Patterns: Query / Paginated / List
AuditLogQueryDto
PaginatedNotificationsDto
PaginatedOrganizationsDto
GetNotificationsQueryDto
ListUsersDto
```

---

## Archivos Estratégicos

| Archivo | Propósito | Tipos |
|---------|-----------|-------|
| `shared/constants/enums.constants.ts` | ENUMs compartidos | 37 ENUMs |
| `shared/types/index.ts` | Tipos core API | 10 Types |
| `shared/constants/database.constants.ts` | Mapeo BD | 7 schemas, 31 tables |
| `shared/decorators/permissions.decorator.ts` | Seguridad | 1 ENUM |

---

## Validación Rápida

**¿Necesito verificar qué DTO existe?**
```bash
grep '"name": "CreateXxxDto"' orchestration/inventarios/backend-types.json
```

**¿Qué tipos hay en un módulo?**
```bash
jq '.module_analysis.gamification' orchestration/inventarios/backend-types.json
```

**¿Listar todos los DTOs de Admin?**
```bash
jq '.dtos[] | select(.file | contains("admin")) | .name' orchestration/inventarios/backend-types.json
```

---

## Mapeo Modules → BD

| Módulo | Schemas | Tablas |
|--------|---------|--------|
| **Auth** | auth_management | users, profiles, user_roles, memberships... |
| **Gamification** | gamification_system | user_stats, achievements, ml_coins_transactions... |
| **Educational** | educational_content | modules, exercises, assessment_rubrics... |
| **Progress** | progress_tracking | module_progress, exercise_attempts, learning_sessions... |
| **Social** | social_features | friendships, classrooms, teams, schools... |
| **Content** | content_management | content_templates, media_files... |

---

## Estadísticas

- **Archivos TS analizados:** 351
- **Archivos con tipos:** 213 (60.7%)
- **Módulos:** 11
- **Archivos problemáticos:** 0
- **Cobertura:** 100%

---

## Referencias

- Documentación: `/orchestration/inventarios/INVENTORY-REPORT.md`
- JSON completo: `/orchestration/inventarios/backend-types.json`
- Scripts:
  - `/orchestration/extract-types.py`
  - `/orchestration/enhance-inventory.py`

---

**Generado por SA-VAL-002** | *Última actualización: 2025-11-03 05:56 UTC*
