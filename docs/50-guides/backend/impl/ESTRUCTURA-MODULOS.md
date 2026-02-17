# Estructura de Módulos Backend

**Versión:** 1.0.0
**Última Actualización:** 2025-11-28
**Aplica a:** apps/backend/src/modules/

---

## Resumen

El backend de GAMILIT sigue una arquitectura modular basada en NestJS. Cada módulo encapsula una funcionalidad de dominio específica con sus propios controladores, servicios, entidades y DTOs.

---

## Módulos Disponibles (17 total)

### Módulos Core

| Módulo | Ubicación | Descripción |
|--------|-----------|-------------|
| **auth** | `modules/auth/` | Autenticación, usuarios, sesiones, roles |
| **health** | `modules/health/` | Health checks y monitoreo |
| **mail** | `modules/mail/` | Envío de emails |
| **websocket** | `modules/websocket/` | Comunicación en tiempo real |

### Módulos de Dominio Educativo

| Módulo | Ubicación | Descripción |
|--------|-----------|-------------|
| **educational** | `modules/educational/` | Ejercicios, módulos, rúbricas, mecánicas |
| **content** | `modules/content/` | Contenido Marie Curie, templates, media |
| **assignments** | `modules/assignments/` | Tareas asignadas a estudiantes |
| **progress** | `modules/progress/` | Progreso, sesiones, intentos, submissions |

### Módulos de Gamificación

| Módulo | Ubicación | Descripción |
|--------|-----------|-------------|
| **gamification** | `modules/gamification/` | Logros, rangos, ML Coins, misiones, comodines |
| **notifications** | `modules/notifications/` | Notificaciones multicanal |

### Módulos Sociales y Organizacionales

| Módulo | Ubicación | Descripción |
|--------|-----------|-------------|
| **social** | `modules/social/` | Escuelas, aulas, equipos, amistades, retos |
| **teacher** | `modules/teacher/` | Dashboard docente, intervenciones, reportes |

### Módulos Administrativos

| Módulo | Ubicación | Descripción |
|--------|-----------|-------------|
| **admin** | `modules/admin/` | Panel administrativo, configuración sistema |
| **audit** | `modules/audit/` | Logs de auditoría |
| **tasks** | `modules/tasks/` | Tareas programadas (cron jobs) |

---

## Estructura Estándar de un Módulo

```
modules/ejemplo/
├── __tests__/                 # Tests unitarios e integración
│   └── ejemplo.service.spec.ts
├── controllers/               # Controladores REST
│   ├── ejemplo.controller.ts
│   └── index.ts
├── dto/                       # Data Transfer Objects
│   ├── create-ejemplo.dto.ts
│   ├── update-ejemplo.dto.ts
│   ├── ejemplo-response.dto.ts
│   └── index.ts
├── entities/                  # Entidades TypeORM
│   ├── ejemplo.entity.ts
│   └── index.ts
├── services/                  # Lógica de negocio
│   ├── ejemplo.service.ts
│   └── index.ts
├── ejemplo.module.ts          # Definición del módulo NestJS
└── index.ts                   # Barrel exports
```

---

## Patrones Comunes

### 1. Definición del Módulo

```typescript
// ejemplo.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([EjemploEntity]),
    // Otros módulos necesarios
  ],
  controllers: [EjemploController],
  providers: [EjemploService],
  exports: [EjemploService], // Si otros módulos lo necesitan
})
export class EjemploModule {}
```

### 2. Controlador con Decoradores

```typescript
@Controller('api/v1/ejemplos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Ejemplos')
export class EjemploController {
  constructor(private readonly ejemploService: EjemploService) {}

  @Get()
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Listar ejemplos' })
  async findAll(@Query() query: ListEjemploDto): Promise<PaginatedResponse<EjemploDto>> {
    return this.ejemploService.findAll(query);
  }
}
```

### 3. Servicio con Inyección de Dependencias

```typescript
@Injectable()
export class EjemploService {
  constructor(
    @InjectRepository(EjemploEntity)
    private readonly ejemploRepository: Repository<EjemploEntity>,
    private readonly configService: ConfigService,
  ) {}

  async findAll(query: ListEjemploDto): Promise<PaginatedResponse<EjemploDto>> {
    // Implementación
  }
}
```

---

## Módulos con Estructura Compleja

### gamification/
```
gamification/
├── controllers/
│   ├── achievements.controller.ts
│   ├── comodines.controller.ts
│   ├── leaderboard.controller.ts
│   ├── missions.controller.ts
│   ├── ml-coins.controller.ts
│   ├── ranks.controller.ts
│   └── user-stats.controller.ts
├── dto/
│   ├── achievements/
│   ├── comodines/
│   ├── leaderboard/
│   ├── missions/
│   ├── ml-coins/
│   ├── notifications/
│   ├── user-achievements/
│   ├── user-ranks/
│   └── user-stats/
├── entities/
│   ├── achievement.entity.ts
│   ├── achievement-category.entity.ts
│   ├── active-boost.entity.ts
│   ├── comodines-inventory.entity.ts
│   ├── inventory-transaction.entity.ts
│   ├── leaderboard-metadata.entity.ts
│   ├── mission.entity.ts
│   ├── ml-coins-transaction.entity.ts
│   ├── user-achievement.entity.ts
│   ├── user-rank.entity.ts
│   └── user-stats.entity.ts
└── services/
    ├── achievements.service.ts
    ├── comodines.service.ts
    ├── leaderboard.service.ts
    ├── missions.service.ts
    ├── ml-coins.service.ts
    ├── ranks.service.ts
    └── user-stats.service.ts
```

### progress/
```
progress/
├── dto/
│   ├── answers/                    # DTOs específicos por mecánica
│   │   ├── timeline-answers.dto.ts
│   │   ├── fill-in-blank-answers.dto.ts
│   │   ├── true-false-answers.dto.ts
│   │   └── ... (23 tipos de ejercicio)
│   └── exercise-answer.validator.ts  # Validador dinámico
```

---

## Comunicación Entre Módulos

### Importación Directa
```typescript
// En teacher.module.ts
@Module({
  imports: [
    GamificationModule,  // Importar módulo completo
    ProgressModule,
  ],
})
export class TeacherModule {}
```

### Eventos (EventEmitter2)
```typescript
// Emitir evento
this.eventEmitter.emit('achievement.unlocked', { userId, achievementId });

// Escuchar evento
@OnEvent('achievement.unlocked')
handleAchievementUnlocked(payload: AchievementUnlockedEvent) {
  // Notificar al usuario
}
```

---

## Registro en AppModule

Todos los módulos deben registrarse en `app.module.ts`:

```typescript
@Module({
  imports: [
    // Configuración global
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(typeOrmConfig),

    // Módulos de la aplicación
    AuthModule,
    EducationalModule,
    GamificationModule,
    ProgressModule,
    SocialModule,
    TeacherModule,
    AdminModule,
    NotificationsModule,
    // ...
  ],
})
export class AppModule {}
```

---

## Buenas Prácticas

1. **Un módulo = Un dominio**: Mantener cohesión alta
2. **Exportar solo lo necesario**: No exponer servicios internos
3. **Usar barrel exports**: `index.ts` en cada carpeta
4. **Tests colocados**: `__tests__/` dentro del módulo
5. **DTOs separados**: Request DTOs vs Response DTOs
6. **Validación en DTOs**: Usar class-validator decoradores

---

## Ver También

- [ESTRUCTURA-SHARED.md](./ESTRUCTURA-SHARED.md) - Código compartido
- [API-STANDARDS.md](./API-STANDARDS.md) - Convenciones de API
- [DATABASE-INTEGRATION.md](./DATABASE-INTEGRATION.md) - Integración con BD
