---
id: "ET-SOC-002"
title: "Diseno Tecnico Sistema de Gremios"
type: "Especificacion Tecnica"
status: "Especificado"
priority: "P2"
epic: "EAI-003-EXT"
module: "social_features"
labels: ["gamification", "social", "guilds", "missions", "collaborative", "technical"]
created_date: "2026-01-20"
updated_date: "2026-01-20"
related_rf: "RF-SOC-002"
---

# ET-SOC-002: Diseno Tecnico Sistema de Gremios

## Informacion General

| Campo | Valor |
|-------|-------|
| **ID** | ET-SOC-002 |
| **Epic** | EAI-003-EXT - Gamificacion Social |
| **RF Relacionado** | RF-SOC-002 |
| **Prioridad** | P2 |
| **Estado** | Especificado |

---

## Alcance

Esta especificacion cubre el diseno tecnico de:
1. Sistema de gremios (creacion, gestion, roles)
2. Misiones colaborativas de gremio
3. Sistema de recompensas proporcionales
4. Log de auditoria

---

## Arquitectura de Backend

### Estructura de Modulo

```
apps/backend/src/modules/
└── social/
    └── guilds/
        ├── guilds.module.ts
        ├── guilds.controller.ts
        ├── guilds.service.ts
        ├── guilds.repository.ts
        ├── dto/
        │   ├── create-guild.dto.ts
        │   ├── update-guild.dto.ts
        │   ├── guild.dto.ts
        │   ├── guild-member.dto.ts
        │   └── join-request.dto.ts
        ├── entities/
        │   ├── guild.entity.ts
        │   ├── guild-member.entity.ts
        │   ├── guild-join-request.entity.ts
        │   ├── guild-audit-log.entity.ts
        │   └── guild-emblem.entity.ts
        ├── missions/
        │   ├── guild-missions.controller.ts
        │   ├── guild-missions.service.ts
        │   ├── mission-generator.service.ts
        │   ├── dto/
        │   │   ├── guild-mission.dto.ts
        │   │   └── contribution.dto.ts
        │   └── entities/
        │       ├── guild-mission.entity.ts
        │       ├── guild-mission-contribution.entity.ts
        │       └── mission-template.entity.ts
        └── enums/
            ├── guild-role.enum.ts
            ├── mission-type.enum.ts
            └── mission-status.enum.ts
```

---

### Entidades TypeORM

#### Guild Entity

```typescript
// apps/backend/src/modules/social/guilds/entities/guild.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../../users/entities/user.entity';
import { GuildMember } from './guild-member.entity';
import { GuildEmblem } from './guild-emblem.entity';

@Entity({ schema: 'social_features', name: 'guilds' })
export class Guild {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('uuid', { name: 'emblem_id', nullable: true })
  emblemId: string;

  @Column('uuid', { name: 'leader_id' })
  leaderId: string;

  @Column({ name: 'member_count', type: 'integer', default: 1 })
  memberCount: number;

  @Column({ name: 'is_public', type: 'boolean', default: true })
  isPublic: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'last_activity_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  lastActivityAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'leader_id' })
  leader: User;

  @ManyToOne(() => GuildEmblem)
  @JoinColumn({ name: 'emblem_id' })
  emblem: GuildEmblem;

  @OneToMany(() => GuildMember, member => member.guild)
  members: GuildMember[];
}
```

#### GuildMember Entity

```typescript
// apps/backend/src/modules/social/guilds/entities/guild-member.entity.ts

import { Entity, Column, ManyToOne, JoinColumn, CreateDateColumn, PrimaryColumn } from 'typeorm';
import { User } from '../../../users/entities/user.entity';
import { Guild } from './guild.entity';
import { GuildRole } from '../enums/guild-role.enum';

@Entity({ schema: 'social_features', name: 'guild_members' })
export class GuildMember {
  @PrimaryColumn('uuid', { name: 'guild_id' })
  guildId: string;

  @PrimaryColumn('uuid', { name: 'user_id' })
  userId: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: GuildRole.MEMBER,
  })
  role: GuildRole;

  @CreateDateColumn({ name: 'joined_at', type: 'timestamptz' })
  joinedAt: Date;

  @ManyToOne(() => Guild, guild => guild.members)
  @JoinColumn({ name: 'guild_id' })
  guild: Guild;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
```

#### GuildJoinRequest Entity

```typescript
// apps/backend/src/modules/social/guilds/entities/guild-join-request.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { User } from '../../../users/entities/user.entity';
import { Guild } from './guild.entity';

export enum JoinRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity({ schema: 'social_features', name: 'guild_join_requests' })
@Unique(['guildId', 'userId'])
export class GuildJoinRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'guild_id' })
  guildId: string;

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: JoinRequestStatus.PENDING,
  })
  status: JoinRequestStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Column({ name: 'responded_at', type: 'timestamptz', nullable: true })
  respondedAt: Date;

  @Column('uuid', { name: 'responded_by', nullable: true })
  respondedBy: string;

  @ManyToOne(() => Guild)
  @JoinColumn({ name: 'guild_id' })
  guild: Guild;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'responded_by' })
  responder: User;
}
```

#### GuildMission Entity

```typescript
// apps/backend/src/modules/social/guilds/missions/entities/guild-mission.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { Guild } from '../../entities/guild.entity';
import { MissionTemplate } from './mission-template.entity';
import { GuildMissionContribution } from './guild-mission-contribution.entity';
import { MissionStatus } from '../../enums/mission-status.enum';

@Entity({ schema: 'social_features', name: 'guild_missions' })
export class GuildMission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'guild_id' })
  guildId: string;

  @Column('uuid', { name: 'mission_template_id' })
  missionTemplateId: string;

  @Column({ name: 'objective_target', type: 'integer' })
  objectiveTarget: number;

  @Column({ name: 'current_progress', type: 'integer', default: 0 })
  currentProgress: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: MissionStatus.ACTIVE,
  })
  status: MissionStatus;

  @Column({ name: 'reward_ml_coins', type: 'integer' })
  rewardMlCoins: number;

  @Column({ name: 'reward_xp', type: 'integer' })
  rewardXp: number;

  @CreateDateColumn({ name: 'started_at', type: 'timestamptz' })
  startedAt: Date;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date;

  @ManyToOne(() => Guild)
  @JoinColumn({ name: 'guild_id' })
  guild: Guild;

  @ManyToOne(() => MissionTemplate)
  @JoinColumn({ name: 'mission_template_id' })
  template: MissionTemplate;

  @OneToMany(() => GuildMissionContribution, contribution => contribution.mission)
  contributions: GuildMissionContribution[];
}
```

#### GuildMissionContribution Entity

```typescript
// apps/backend/src/modules/social/guilds/missions/entities/guild-mission-contribution.entity.ts

import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { User } from '../../../../users/entities/user.entity';
import { GuildMission } from './guild-mission.entity';

@Entity({ schema: 'social_features', name: 'guild_mission_contributions' })
export class GuildMissionContribution {
  @PrimaryColumn('uuid', { name: 'guild_mission_id' })
  guildMissionId: string;

  @PrimaryColumn('uuid', { name: 'user_id' })
  userId: string;

  @Column({ name: 'contribution_count', type: 'integer', default: 0 })
  contributionCount: number;

  @Column({ name: 'last_contribution_at', type: 'timestamptz', nullable: true })
  lastContributionAt: Date;

  @ManyToOne(() => GuildMission, mission => mission.contributions)
  @JoinColumn({ name: 'guild_mission_id' })
  mission: GuildMission;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
```

#### GuildAuditLog Entity

```typescript
// apps/backend/src/modules/social/guilds/entities/guild-audit-log.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../../users/entities/user.entity';
import { Guild } from './guild.entity';

@Entity({ schema: 'social_features', name: 'guild_audit_log' })
export class GuildAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'guild_id' })
  guildId: string;

  @Column({ type: 'varchar', length: 50 })
  action: string;

  @Column('uuid', { name: 'actor_id' })
  actorId: string;

  @Column('uuid', { name: 'target_id', nullable: true })
  targetId: string;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, any>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => Guild)
  @JoinColumn({ name: 'guild_id' })
  guild: Guild;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'actor_id' })
  actor: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'target_id' })
  target: User;
}
```

---

### Enums

```typescript
// apps/backend/src/modules/social/guilds/enums/guild-role.enum.ts

export enum GuildRole {
  LEADER = 'leader',
  OFFICER = 'officer',
  MEMBER = 'member',
}

// apps/backend/src/modules/social/guilds/enums/mission-type.enum.ts

export enum MissionType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  EVENT = 'event',
}

// apps/backend/src/modules/social/guilds/enums/mission-status.enum.ts

export enum MissionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
}
```

---

### Servicios

#### GuildsService

```typescript
// apps/backend/src/modules/social/guilds/guilds.service.ts

@Injectable()
export class GuildsService {
  constructor(
    @InjectRepository(Guild)
    private guildRepo: Repository<Guild>,
    @InjectRepository(GuildMember)
    private memberRepo: Repository<GuildMember>,
    @InjectRepository(GuildJoinRequest)
    private requestRepo: Repository<GuildJoinRequest>,
    @InjectRepository(GuildAuditLog)
    private auditRepo: Repository<GuildAuditLog>,
    private notificationsService: NotificationsService,
  ) {}

  // Crear nuevo gremio
  async createGuild(userId: string, dto: CreateGuildDto): Promise<Guild> {
    // Verificar usuario no pertenece a gremio
    const existingMembership = await this.memberRepo.findOne({
      where: { userId },
    });
    if (existingMembership) {
      throw new BadRequestException('Ya perteneces a un gremio');
    }

    // Validar nombre unico y filtro de palabras
    await this.validateGuildName(dto.name);

    // Crear gremio
    const guild = this.guildRepo.create({
      name: dto.name,
      description: dto.description,
      emblemId: dto.emblemId,
      leaderId: userId,
    });
    await this.guildRepo.save(guild);

    // Agregar creador como lider
    await this.memberRepo.save({
      guildId: guild.id,
      userId,
      role: GuildRole.LEADER,
    });

    return guild;
  }

  // Buscar gremios
  async searchGuilds(query: string, userId: string): Promise<GuildSearchDto[]> {
    // Buscar por nombre, excluir gremios llenos
    // Ordenar por actividad reciente
  }

  // Solicitar union
  async requestJoin(userId: string, guildId: string): Promise<GuildJoinRequest> {
    // Validar no pertenece a gremio
    // Validar gremio no lleno
    // Validar no solicitud pendiente
    // Crear solicitud
    // Notificar lider/oficiales
  }

  // Aprobar solicitud
  async approveRequest(
    responderId: string,
    guildId: string,
    requestId: string,
  ): Promise<void> {
    // Validar responder es lider/oficial
    // Validar solicitud existe y pendiente
    // Crear membership
    // Actualizar request status
    // Incrementar member_count
    // Notificar solicitante
  }

  // Expulsar miembro
  async kickMember(
    actorId: string,
    guildId: string,
    targetId: string,
  ): Promise<void> {
    // Validar actor es lider/oficial
    // Validar target no es lider
    // Si actor es oficial, validar target no es oficial
    // Eliminar membership
    // Decrementar member_count
    // Registrar en audit log
    // Notificar expulsado
  }

  // Transferir liderazgo
  async transferLeadership(
    leaderId: string,
    guildId: string,
    newLeaderId: string,
  ): Promise<void> {
    // Validar es lider actual
    // Validar nuevo lider es miembro
    // Actualizar guild.leaderId
    // Actualizar roles
    // Registrar en audit log
  }

  // Log de auditoria
  private async logAction(
    guildId: string,
    action: string,
    actorId: string,
    targetId?: string,
    details?: Record<string, any>,
  ): Promise<void> {
    await this.auditRepo.save({
      guildId,
      action,
      actorId,
      targetId,
      details,
    });
  }
}
```

#### GuildMissionsService

```typescript
// apps/backend/src/modules/social/guilds/missions/guild-missions.service.ts

@Injectable()
export class GuildMissionsService {
  constructor(
    @InjectRepository(GuildMission)
    private missionRepo: Repository<GuildMission>,
    @InjectRepository(GuildMissionContribution)
    private contributionRepo: Repository<GuildMissionContribution>,
    private notificationsService: NotificationsService,
    private mlCoinsService: MlCoinsService,
    private xpService: XpService,
  ) {}

  // Obtener misiones activas
  async getActiveMissions(guildId: string): Promise<GuildMissionDto[]> {
    return this.missionRepo.find({
      where: { guildId, status: MissionStatus.ACTIVE },
      relations: ['template', 'contributions', 'contributions.user'],
      order: { expiresAt: 'ASC' },
    });
  }

  // Registrar contribucion
  async registerContribution(
    userId: string,
    guildId: string,
    amount: number,
  ): Promise<void> {
    // Obtener misiones activas del gremio
    const missions = await this.getActiveMissions(guildId);

    for (const mission of missions) {
      // Actualizar contribucion individual
      await this.contributionRepo.upsert(
        {
          guildMissionId: mission.id,
          userId,
          contributionCount: () => `contribution_count + ${amount}`,
          lastContributionAt: new Date(),
        },
        ['guildMissionId', 'userId'],
      );

      // Actualizar progreso total
      const newProgress = mission.currentProgress + amount;
      await this.missionRepo.update(mission.id, {
        currentProgress: newProgress,
      });

      // Verificar si mision completada
      if (newProgress >= mission.objectiveTarget) {
        await this.completeMission(mission);
      }
    }
  }

  // Completar mision y distribuir recompensas
  private async completeMission(mission: GuildMission): Promise<void> {
    // Marcar como completada
    await this.missionRepo.update(mission.id, {
      status: MissionStatus.COMPLETED,
      completedAt: new Date(),
    });

    // Obtener contribuciones
    const contributions = await this.contributionRepo.find({
      where: { guildMissionId: mission.id },
    });

    // Calcular total contribuciones
    const totalContributions = contributions.reduce(
      (sum, c) => sum + c.contributionCount,
      0,
    );

    // Distribuir recompensas
    const allContributed = contributions.length === mission.guild.memberCount;
    const bonusMultiplier = allContributed ? 1.1 : 1.0;

    for (const contribution of contributions) {
      const percentage = contribution.contributionCount / totalContributions;
      const rewardMultiplier = percentage >= 0.2 ? 1.0 : 0.5;
      const finalMultiplier = rewardMultiplier * bonusMultiplier;

      const mlCoins = Math.floor(mission.rewardMlCoins * finalMultiplier);
      const xp = Math.floor(mission.rewardXp * finalMultiplier);

      await this.mlCoinsService.addCoins(contribution.userId, {
        amount: mlCoins,
        reason: 'guild_mission_reward',
        metadata: { missionId: mission.id },
      });

      await this.xpService.addXp(contribution.userId, {
        amount: xp,
        reason: 'guild_mission_reward',
      });

      // Notificar
      await this.notificationsService.send(contribution.userId, {
        type: 'guild_mission_completed',
        data: { missionId: mission.id, mlCoins, xp },
      });
    }
  }
}
```

#### MissionGeneratorService (CRON)

```typescript
// apps/backend/src/modules/social/guilds/missions/mission-generator.service.ts

@Injectable()
export class MissionGeneratorService {
  constructor(
    @InjectRepository(Guild)
    private guildRepo: Repository<Guild>,
    @InjectRepository(GuildMission)
    private missionRepo: Repository<GuildMission>,
    @InjectRepository(MissionTemplate)
    private templateRepo: Repository<MissionTemplate>,
  ) {}

  // Generar misiones diarias (ejecutar 00:00 UTC)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateDailyMissions(): Promise<void> {
    const guilds = await this.guildRepo.find();
    const dailyTemplates = await this.templateRepo.find({
      where: { type: MissionType.DAILY },
    });

    for (const guild of guilds) {
      // Seleccionar template aleatorio
      const template = dailyTemplates[Math.floor(Math.random() * dailyTemplates.length)];

      // Escalar objetivo segun tamano del gremio
      const scaledTarget = Math.ceil(template.baseTarget * (guild.memberCount / 10));

      await this.missionRepo.save({
        guildId: guild.id,
        missionTemplateId: template.id,
        objectiveTarget: scaledTarget,
        rewardMlCoins: template.baseMlCoins,
        rewardXp: template.baseXp,
        expiresAt: addHours(new Date(), 24),
      });
    }
  }

  // Generar misiones semanales (ejecutar lunes 00:00 UTC)
  @Cron('0 0 * * 1') // Every Monday at midnight
  async generateWeeklyMissions(): Promise<void> {
    // Similar a daily pero con templates semanales
    // Expira en 7 dias
  }

  // Limpiar misiones expiradas
  @Cron(CronExpression.EVERY_HOUR)
  async expireMissions(): Promise<void> {
    await this.missionRepo.update(
      {
        status: MissionStatus.ACTIVE,
        expiresAt: LessThan(new Date()),
      },
      { status: MissionStatus.FAILED },
    );
  }
}
```

---

### Controllers

#### GuildsController

```typescript
// apps/backend/src/modules/social/guilds/guilds.controller.ts

@Controller('guilds')
@UseGuards(JwtAuthGuard)
@ApiTags('Guilds')
export class GuildsController {
  constructor(
    private readonly guildsService: GuildsService,
    private readonly missionsService: GuildMissionsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create guild' })
  async createGuild(
    @CurrentUser() user: User,
    @Body() dto: CreateGuildDto,
  ): Promise<Guild> {
    return this.guildsService.createGuild(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Search guilds' })
  async searchGuilds(
    @CurrentUser() user: User,
    @Query('q') query: string,
  ): Promise<GuildSearchDto[]> {
    return this.guildsService.searchGuilds(query, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get guild details' })
  async getGuild(@Param('id') guildId: string): Promise<GuildDetailDto> {
    return this.guildsService.getGuildDetail(guildId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update guild settings' })
  async updateGuild(
    @CurrentUser() user: User,
    @Param('id') guildId: string,
    @Body() dto: UpdateGuildDto,
  ): Promise<Guild> {
    return this.guildsService.updateGuild(user.id, guildId, dto);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Request to join guild' })
  async requestJoin(
    @CurrentUser() user: User,
    @Param('id') guildId: string,
  ): Promise<GuildJoinRequest> {
    return this.guildsService.requestJoin(user.id, guildId);
  }

  @Delete(':id/leave')
  @ApiOperation({ summary: 'Leave guild' })
  async leaveGuild(
    @CurrentUser() user: User,
    @Param('id') guildId: string,
  ): Promise<void> {
    return this.guildsService.leaveGuild(user.id, guildId);
  }

  @Get(':id/requests')
  @ApiOperation({ summary: 'Get pending join requests' })
  async getRequests(@Param('id') guildId: string): Promise<GuildJoinRequest[]> {
    return this.guildsService.getPendingRequests(guildId);
  }

  @Post(':id/requests/:requestId/approve')
  @ApiOperation({ summary: 'Approve join request' })
  async approveRequest(
    @CurrentUser() user: User,
    @Param('id') guildId: string,
    @Param('requestId') requestId: string,
  ): Promise<void> {
    return this.guildsService.approveRequest(user.id, guildId, requestId);
  }

  @Post(':id/requests/:requestId/reject')
  @ApiOperation({ summary: 'Reject join request' })
  async rejectRequest(
    @CurrentUser() user: User,
    @Param('id') guildId: string,
    @Param('requestId') requestId: string,
  ): Promise<void> {
    return this.guildsService.rejectRequest(user.id, guildId, requestId);
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Kick member from guild' })
  async kickMember(
    @CurrentUser() user: User,
    @Param('id') guildId: string,
    @Param('userId') targetId: string,
  ): Promise<void> {
    return this.guildsService.kickMember(user.id, guildId, targetId);
  }

  @Patch(':id/members/:userId/role')
  @ApiOperation({ summary: 'Change member role' })
  async changeRole(
    @CurrentUser() user: User,
    @Param('id') guildId: string,
    @Param('userId') targetId: string,
    @Body() dto: ChangeRoleDto,
  ): Promise<void> {
    return this.guildsService.changeRole(user.id, guildId, targetId, dto.role);
  }

  @Post(':id/transfer-leadership')
  @ApiOperation({ summary: 'Transfer guild leadership' })
  async transferLeadership(
    @CurrentUser() user: User,
    @Param('id') guildId: string,
    @Body() dto: TransferLeadershipDto,
  ): Promise<void> {
    return this.guildsService.transferLeadership(user.id, guildId, dto.newLeaderId);
  }

  @Get(':id/missions')
  @ApiOperation({ summary: 'Get active guild missions' })
  async getMissions(@Param('id') guildId: string): Promise<GuildMissionDto[]> {
    return this.missionsService.getActiveMissions(guildId);
  }

  @Get(':id/missions/:missionId')
  @ApiOperation({ summary: 'Get mission details' })
  async getMissionDetail(
    @Param('id') guildId: string,
    @Param('missionId') missionId: string,
  ): Promise<GuildMissionDetailDto> {
    return this.missionsService.getMissionDetail(guildId, missionId);
  }

  @Get(':id/audit-log')
  @ApiOperation({ summary: 'Get guild audit log (leader only)' })
  async getAuditLog(
    @CurrentUser() user: User,
    @Param('id') guildId: string,
  ): Promise<GuildAuditLog[]> {
    return this.guildsService.getAuditLog(user.id, guildId);
  }
}
```

---

## Arquitectura de Frontend

### Estructura de Componentes

```
apps/frontend/src/features/gamification/social/
├── pages/
│   ├── GuildsPage.tsx
│   └── GuildDetailPage.tsx
├── components/
│   ├── GuildCard.tsx
│   ├── GuildSearchList.tsx
│   ├── CreateGuildModal.tsx
│   ├── GuildMissionCard.tsx
│   ├── GuildMissionProgress.tsx
│   ├── ContributorsList.tsx
│   ├── PendingRequestsList.tsx
│   ├── MemberManagementList.tsx
│   ├── TransferLeadershipModal.tsx
│   ├── GuildSettingsForm.tsx
│   └── GuildAuditLog.tsx
├── hooks/
│   ├── useGuild.ts
│   ├── useGuildMembers.ts
│   ├── useGuildMissions.ts
│   └── useGuildRequests.ts
├── stores/
│   └── guildsStore.ts
└── api/
    └── guildsApi.ts
```

---

### Componentes Principales

#### GuildCard

```tsx
// apps/frontend/src/features/gamification/social/components/GuildCard.tsx

interface GuildCardProps {
  guild: GuildSummary;
  onJoin?: (guildId: string) => void;
  showJoinButton?: boolean;
}

export const GuildCard: React.FC<GuildCardProps> = ({
  guild,
  onJoin,
  showJoinButton = false,
}) => {
  const isFull = guild.memberCount >= 20;

  return (
    <div className="guild-card">
      <img src={guild.emblemUrl} alt={guild.name} className="guild-emblem" />
      <div className="guild-info">
        <h3 className="guild-name">{guild.name}</h3>
        <p className="guild-description">{guild.description}</p>
        <span className="member-count">
          {guild.memberCount}/20 miembros
        </span>
      </div>
      {showJoinButton && (
        <Button
          onClick={() => onJoin?.(guild.id)}
          disabled={isFull}
        >
          {isFull ? 'Lleno' : 'Solicitar'}
        </Button>
      )}
    </div>
  );
};
```

#### GuildMissionCard

```tsx
// apps/frontend/src/features/gamification/social/components/GuildMissionCard.tsx

interface GuildMissionCardProps {
  mission: GuildMission;
  onViewDetails?: (missionId: string) => void;
}

export const GuildMissionCard: React.FC<GuildMissionCardProps> = ({
  mission,
  onViewDetails,
}) => {
  const progress = (mission.currentProgress / mission.objectiveTarget) * 100;
  const timeLeft = formatDistanceToNow(mission.expiresAt);

  return (
    <div className="guild-mission-card">
      <div className="mission-header">
        <MissionTypeIcon type={mission.type} />
        <span className="mission-title">{mission.template.name}</span>
        <span className="time-left">{timeLeft}</span>
      </div>

      <p className="mission-description">{mission.template.description}</p>

      <ProgressBar value={progress} max={100} />
      <span className="progress-text">
        {mission.currentProgress} / {mission.objectiveTarget}
      </span>

      <div className="mission-rewards">
        <span className="reward">
          <CoinIcon /> {mission.rewardMlCoins} ML Coins
        </span>
        <span className="reward">
          <XpIcon /> {mission.rewardXp} XP
        </span>
      </div>

      <Button variant="secondary" onClick={() => onViewDetails?.(mission.id)}>
        Ver contribuidores
      </Button>
    </div>
  );
};
```

#### ContributorsList

```tsx
// apps/frontend/src/features/gamification/social/components/ContributorsList.tsx

interface ContributorsListProps {
  contributions: MissionContribution[];
  totalProgress: number;
}

export const ContributorsList: React.FC<ContributorsListProps> = ({
  contributions,
  totalProgress,
}) => {
  const sortedContributions = [...contributions].sort(
    (a, b) => b.contributionCount - a.contributionCount,
  );

  return (
    <div className="contributors-list">
      <h4>Contribuidores</h4>
      {sortedContributions.map((contribution, index) => {
        const percentage = (contribution.contributionCount / totalProgress) * 100;
        const isQualified = percentage >= 20;

        return (
          <div key={contribution.userId} className="contributor-row">
            <span className="position">#{index + 1}</span>
            <Avatar src={contribution.user.avatarUrl} />
            <span className="name">{contribution.user.displayName}</span>
            <span className="contribution">
              {contribution.contributionCount}
              <span className="percentage">({percentage.toFixed(1)}%)</span>
            </span>
            <span className={`status ${isQualified ? 'qualified' : 'partial'}`}>
              {isQualified ? 'Recompensa completa' : 'Recompensa parcial'}
            </span>
          </div>
        );
      })}
    </div>
  );
};
```

#### MemberManagementList

```tsx
// apps/frontend/src/features/gamification/social/components/MemberManagementList.tsx

interface MemberManagementListProps {
  members: GuildMember[];
  currentUserId: string;
  currentUserRole: GuildRole;
  onKick: (userId: string) => void;
  onPromote: (userId: string) => void;
  onDemote: (userId: string) => void;
}

export const MemberManagementList: React.FC<MemberManagementListProps> = ({
  members,
  currentUserId,
  currentUserRole,
  onKick,
  onPromote,
  onDemote,
}) => {
  const isLeader = currentUserRole === GuildRole.LEADER;
  const isOfficer = currentUserRole === GuildRole.OFFICER;

  const canKick = (member: GuildMember) => {
    if (member.userId === currentUserId) return false;
    if (member.role === GuildRole.LEADER) return false;
    if (isOfficer && member.role === GuildRole.OFFICER) return false;
    return isLeader || isOfficer;
  };

  const canPromote = (member: GuildMember) => {
    if (!isLeader) return false;
    if (member.role !== GuildRole.MEMBER) return false;
    const officerCount = members.filter(m => m.role === GuildRole.OFFICER).length;
    return officerCount < 3;
  };

  return (
    <div className="member-management-list">
      {members.map((member) => (
        <div key={member.userId} className="member-row">
          <Avatar src={member.user.avatarUrl} />
          <div className="member-info">
            <span className="name">{member.user.displayName}</span>
            <RoleBadge role={member.role} />
          </div>
          <div className="actions">
            {canPromote(member) && (
              <Button size="sm" onClick={() => onPromote(member.userId)}>
                Promover
              </Button>
            )}
            {isLeader && member.role === GuildRole.OFFICER && (
              <Button size="sm" variant="secondary" onClick={() => onDemote(member.userId)}>
                Degradar
              </Button>
            )}
            {canKick(member) && (
              <Button size="sm" variant="danger" onClick={() => onKick(member.userId)}>
                Expulsar
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
```

---

### Hooks

#### useGuildMissions

```typescript
// apps/frontend/src/features/gamification/social/hooks/useGuildMissions.ts

export const useGuildMissions = (guildId: string) => {
  return useQuery({
    queryKey: ['guild-missions', guildId],
    queryFn: () => guildsApi.getMissions(guildId),
    staleTime: 1 * 60 * 1000, // 1 min cache (misiones cambian frecuentemente)
    refetchInterval: 30 * 1000, // Refetch cada 30s para progreso real-time
  });
};

export const useMissionContributors = (guildId: string, missionId: string) => {
  return useQuery({
    queryKey: ['mission-contributors', guildId, missionId],
    queryFn: () => guildsApi.getMissionDetail(guildId, missionId),
    staleTime: 30 * 1000,
  });
};
```

---

## WebSocket Integration

### Eventos en Tiempo Real

```typescript
// apps/backend/src/modules/social/guilds/guild.gateway.ts

@WebSocketGateway({ namespace: '/guild' })
export class GuildGateway {
  @WebSocketServer()
  server: Server;

  // Emitir actualizacion de progreso de mision
  emitMissionProgress(guildId: string, missionId: string, progress: number) {
    this.server.to(`guild:${guildId}`).emit('mission:progress', {
      missionId,
      progress,
      timestamp: new Date(),
    });
  }

  // Emitir mision completada
  emitMissionCompleted(guildId: string, mission: GuildMission) {
    this.server.to(`guild:${guildId}`).emit('mission:completed', {
      missionId: mission.id,
      rewards: {
        mlCoins: mission.rewardMlCoins,
        xp: mission.rewardXp,
      },
    });
  }

  // Emitir nuevo miembro
  emitMemberJoined(guildId: string, member: GuildMember) {
    this.server.to(`guild:${guildId}`).emit('member:joined', {
      userId: member.userId,
      displayName: member.user.displayName,
    });
  }

  @SubscribeMessage('join:guild')
  handleJoinGuild(client: Socket, guildId: string) {
    client.join(`guild:${guildId}`);
  }

  @SubscribeMessage('leave:guild')
  handleLeaveGuild(client: Socket, guildId: string) {
    client.leave(`guild:${guildId}`);
  }
}
```

### Frontend WebSocket Hook

```typescript
// apps/frontend/src/features/gamification/social/hooks/useGuildSocket.ts

export const useGuildSocket = (guildId: string) => {
  const queryClient = useQueryClient();
  const socket = useSocket('/guild');

  useEffect(() => {
    if (!guildId) return;

    socket.emit('join:guild', guildId);

    socket.on('mission:progress', (data) => {
      queryClient.setQueryData(['guild-missions', guildId], (old: GuildMission[]) =>
        old?.map((m) =>
          m.id === data.missionId
            ? { ...m, currentProgress: data.progress }
            : m,
        ),
      );
    });

    socket.on('mission:completed', (data) => {
      queryClient.invalidateQueries(['guild-missions', guildId]);
      // Mostrar toast de celebracion
      toast.success(`Mision completada! +${data.rewards.mlCoins} ML Coins`);
    });

    socket.on('member:joined', (data) => {
      queryClient.invalidateQueries(['guild-members', guildId]);
      toast.info(`${data.displayName} se unio al gremio`);
    });

    return () => {
      socket.emit('leave:guild', guildId);
      socket.off('mission:progress');
      socket.off('mission:completed');
      socket.off('member:joined');
    };
  }, [guildId, socket, queryClient]);
};
```

---

## Tests Requeridos

### Unit Tests

```typescript
// guilds.service.spec.ts
describe('GuildsService', () => {
  it('should create guild and set creator as leader', async () => {});
  it('should not allow creating guild if already in one', async () => {});
  it('should not allow duplicate guild names', async () => {});
  it('should approve join request and add member', async () => {});
  it('should reject join request', async () => {});
  it('should kick member (leader)', async () => {});
  it('should kick member (officer, not officer)', async () => {});
  it('should not allow officer to kick officer', async () => {});
  it('should transfer leadership', async () => {});
  it('should log actions in audit log', async () => {});
});

// guild-missions.service.spec.ts
describe('GuildMissionsService', () => {
  it('should register contribution and update progress', async () => {});
  it('should complete mission when target reached', async () => {});
  it('should distribute full reward to contributors >= 20%', async () => {});
  it('should distribute partial reward to contributors < 20%', async () => {});
  it('should apply bonus if all members contributed', async () => {});
});
```

### Integration Tests

```typescript
// guilds.e2e-spec.ts
describe('Guilds API', () => {
  it('POST /guilds should create guild', async () => {});
  it('POST /guilds/:id/join should create join request', async () => {});
  it('POST /guilds/:id/requests/:id/approve should add member', async () => {});
  it('GET /guilds/:id/missions should return active missions', async () => {});
  it('GET /guilds/:id/audit-log should return log (leader only)', async () => {});
});
```

---

## RLS Policies

```sql
-- guilds: lectura publica, escritura lider
CREATE POLICY guilds_select ON social_features.guilds
    FOR SELECT USING (is_public = true OR leader_id = auth.uid());

CREATE POLICY guilds_update ON social_features.guilds
    FOR UPDATE USING (leader_id = auth.uid());

-- guild_members: miembros ven su gremio
CREATE POLICY guild_members_select ON social_features.guild_members
    FOR SELECT USING (
        guild_id IN (SELECT guild_id FROM guild_members WHERE user_id = auth.uid())
    );

-- guild_missions: miembros del gremio
CREATE POLICY guild_missions_select ON social_features.guild_missions
    FOR SELECT USING (
        guild_id IN (SELECT guild_id FROM guild_members WHERE user_id = auth.uid())
    );

-- guild_audit_log: solo lider
CREATE POLICY guild_audit_log_select ON social_features.guild_audit_log
    FOR SELECT USING (
        guild_id IN (SELECT id FROM guilds WHERE leader_id = auth.uid())
    );
```

---

## Referencias

- RF-SOC-002: Requerimiento funcional relacionado
- US-GAM-013, US-GAM-014, US-GAM-015: User stories
- Documento de Diseno v6.1: Sistema de gremios

---

**Creado:** 2026-01-20
**Sistema:** SIMCO (Sistema Indexado Modular por Contexto)
