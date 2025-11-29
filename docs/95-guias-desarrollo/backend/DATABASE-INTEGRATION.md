# Integración con Base de Datos

**Versión:** 1.0.0
**Última Actualización:** 2025-11-28
**Aplica a:** apps/backend/src/ + apps/database/

---

## Resumen

GAMILIT utiliza PostgreSQL con una arquitectura multi-esquema. El backend se conecta mediante TypeORM y aplica Row-Level Security (RLS) para aislamiento de datos por tenant.

---

## Arquitectura de Esquemas

```
PostgreSQL Database: gamilit_dev
├── auth_management        # Usuarios, roles, sesiones
├── educational_content    # Ejercicios, módulos, contenido
├── gamification_system    # Logros, rangos, ML Coins
├── user_progress          # Progreso, intentos, submissions
├── social_features        # Escuelas, aulas, equipos
├── notification_system    # Notificaciones multicanal
├── audit_logging          # Logs de auditoría
├── admin_dashboard        # Configuración administrativa
└── system_configuration   # Parámetros del sistema
```

---

## Configuración de TypeORM

### Archivo de Configuración

```typescript
// src/config/typeorm.config.ts
import { DataSourceOptions } from 'typeorm';

export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || 'gamilit_dev',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false, // NUNCA true en producción
  logging: process.env.NODE_ENV === 'development',
};
```

### Registro en AppModule

```typescript
@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    // ...
  ],
})
export class AppModule {}
```

---

## Definición de Entidades

### Estructura Básica

```typescript
// modules/gamification/entities/user-stats.entity.ts
import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SCHEMAS } from '@shared/constants/database.constants';

@Entity({ name: 'user_stats', schema: SCHEMAS.GAMIFICATION_SYSTEM })
export class UserStatsEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @Column('uuid', { name: 'tenant_id' })
  tenantId: string;

  @Column('integer', { name: 'total_xp', default: 0 })
  totalXp: number;

  @Column('integer', { name: 'current_level', default: 1 })
  currentLevel: number;

  @Column('integer', { name: 'ml_coins', default: 0 })
  mlCoins: number;

  @Column('integer', { name: 'current_streak', default: 0 })
  currentStreak: number;

  @Column('timestamp with time zone', { name: 'created_at' })
  createdAt: Date;

  @Column('timestamp with time zone', { name: 'updated_at' })
  updatedAt: Date;
}
```

### Con Relaciones

```typescript
@Entity({ name: 'user_achievements', schema: SCHEMAS.GAMIFICATION_SYSTEM })
export class UserAchievementEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @Column('uuid', { name: 'achievement_id' })
  achievementId: string;

  @ManyToOne(() => AchievementEntity)
  @JoinColumn({ name: 'achievement_id' })
  achievement: AchievementEntity;

  @Column('boolean', { name: 'is_completed', default: false })
  isCompleted: boolean;

  @Column('integer', { default: 0 })
  progress: number;
}
```

---

## Row-Level Security (RLS)

### Concepto

RLS aísla datos por tenant automáticamente. Cada query solo accede a datos del tenant del usuario autenticado.

### Implementación en PostgreSQL

```sql
-- Habilitar RLS en tabla
ALTER TABLE gamification_system.user_stats ENABLE ROW LEVEL SECURITY;

-- Política de lectura
CREATE POLICY user_stats_tenant_isolation ON gamification_system.user_stats
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

### Implementación en NestJS

```typescript
// shared/interceptors/rls.interceptor.ts
@Injectable()
export class RlsInterceptor implements NestInterceptor {
  constructor(private readonly dataSource: DataSource) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.user?.tenantId;

    if (tenantId) {
      await this.dataSource.query(
        `SET LOCAL app.current_tenant_id = $1`,
        [tenantId]
      );
    }

    return next.handle();
  }
}
```

---

## Repositorios

### Inyección en Servicios

```typescript
@Injectable()
export class UserStatsService {
  constructor(
    @InjectRepository(UserStatsEntity)
    private readonly userStatsRepository: Repository<UserStatsEntity>,
  ) {}

  async findByUserId(userId: string): Promise<UserStatsEntity | null> {
    return this.userStatsRepository.findOne({
      where: { userId },
    });
  }
}
```

### Registro en Módulo

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserStatsEntity,
      AchievementEntity,
      UserAchievementEntity,
    ]),
  ],
  providers: [UserStatsService],
})
export class GamificationModule {}
```

---

## Queries Comunes

### QueryBuilder

```typescript
async findTopUsers(limit: number): Promise<UserStatsEntity[]> {
  return this.userStatsRepository
    .createQueryBuilder('stats')
    .orderBy('stats.totalXp', 'DESC')
    .limit(limit)
    .getMany();
}
```

### Con Joins

```typescript
async findWithAchievements(userId: string): Promise<UserStatsEntity> {
  return this.userStatsRepository
    .createQueryBuilder('stats')
    .leftJoinAndSelect('stats.achievements', 'ua')
    .leftJoinAndSelect('ua.achievement', 'a')
    .where('stats.userId = :userId', { userId })
    .getOne();
}
```

### Transacciones

```typescript
async transferCoins(fromId: string, toId: string, amount: number): Promise<void> {
  await this.dataSource.transaction(async (manager) => {
    const fromStats = await manager.findOne(UserStatsEntity, {
      where: { userId: fromId },
    });

    if (fromStats.mlCoins < amount) {
      throw new BadRequestException('Insufficient coins');
    }

    await manager.decrement(UserStatsEntity, { userId: fromId }, 'mlCoins', amount);
    await manager.increment(UserStatsEntity, { userId: toId }, 'mlCoins', amount);
  });
}
```

---

## Migraciones

### Ubicación

Los scripts DDL están en `apps/database/ddl/`:

```
apps/database/ddl/
├── 00-prerequisites.sql       # Extensiones y configuración inicial
├── 01-schemas.sql             # Creación de esquemas
└── schemas/
    ├── auth_management/
    │   ├── tables/
    │   ├── functions/
    │   ├── triggers/
    │   └── indexes/
    ├── gamification_system/
    └── ...
```

### Ejecutar Recreación

```bash
cd apps/database
./drop-and-recreate-database.sh
```

---

## Funciones de Base de Datos

### Llamar Funciones PostgreSQL

```typescript
async updateUserRank(userId: string): Promise<void> {
  await this.dataSource.query(
    `SELECT gamification_system.update_user_rank($1)`,
    [userId]
  );
}

async validateAnswer(exerciseId: string, answer: any): Promise<boolean> {
  const [result] = await this.dataSource.query(
    `SELECT educational_content.validate_answer($1, $2) as is_correct`,
    [exerciseId, JSON.stringify(answer)]
  );
  return result.is_correct;
}
```

---

## Constantes de Base de Datos

```typescript
// shared/constants/database.constants.ts
export const SCHEMAS = {
  AUTH_MANAGEMENT: 'auth_management',
  EDUCATIONAL_CONTENT: 'educational_content',
  GAMIFICATION_SYSTEM: 'gamification_system',
  USER_PROGRESS: 'user_progress',
  SOCIAL_FEATURES: 'social_features',
  NOTIFICATION_SYSTEM: 'notification_system',
  AUDIT_LOGGING: 'audit_logging',
  ADMIN_DASHBOARD: 'admin_dashboard',
  SYSTEM_CONFIGURATION: 'system_configuration',
} as const;
```

---

## Buenas Prácticas

1. **Nunca synchronize: true** en producción
2. **Usar esquemas explícitos** en entidades con `schema: SCHEMAS.X`
3. **Nombres snake_case** para columnas de BD
4. **Nombres camelCase** para propiedades TypeScript
5. **Siempre usar transacciones** para operaciones múltiples
6. **RLS habilitado** en todas las tablas con datos de tenant
7. **Indexes en columnas** usadas en WHERE frecuentemente

---

## Troubleshooting

### Error: relation does not exist
- Verificar que el esquema está en el entity decorator
- Verificar que la tabla existe en la BD

### Error: permission denied
- Verificar RLS policies
- Verificar que `app.current_tenant_id` está configurado

### Queries lentos
- Revisar indexes en `apps/database/ddl/schemas/*/indexes/`
- Usar `EXPLAIN ANALYZE` para diagnosticar

---

## Ver También

- [ESTRUCTURA-MODULOS.md](./ESTRUCTURA-MODULOS.md) - Estructura de módulos
- [../../GUIA-CREAR-BASE-DATOS.md](../GUIA-CREAR-BASE-DATOS.md) - Crear BD desde cero
