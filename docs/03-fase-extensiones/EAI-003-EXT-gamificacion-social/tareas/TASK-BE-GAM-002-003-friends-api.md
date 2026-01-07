---
id: "TASK-BE-GAM-002"
title: "Crear API de amigos (Service + Controller)"
type: "Task"
status: "To Do"
priority: "Alta"
assignee: "@Backend-Agent"
epic: "EAI-003-EXT"
parent_us: "US-GAM-010"
estimated_hours: 4
labels: ["backend", "api", "social", "friends"]
created_date: "2026-01-04"
updated_date: "2026-01-04"
---

# TASK-BE-GAM-002-003: Crear API de amigos

## Informacion General

| Campo | Valor |
|-------|-------|
| **ID** | TASK-BE-GAM-002 |
| **US Padre** | US-GAM-010 |
| **Epic** | EAI-003-EXT |
| **Tipo** | Backend Development |
| **Estimacion** | 4 horas |
| **Estado** | To Do |

---

## Subtareas

| ID | Descripcion | Estado |
|----|-------------|--------|
| BE-GAM-002 | Crear FriendsService | To Do |
| BE-GAM-003 | Crear FriendsController | To Do |

---

## Especificaciones Tecnicas

### FriendsService

```typescript
// apps/backend/src/modules/social/services/friends.service.ts

@Injectable()
export class FriendsService {
  constructor(private dbClient: DatabaseService) {}

  async searchUsers(query: string, currentUserId: string): Promise<UserSearchResult[]>;
  async sendRequest(requesterId: string, recipientId: string): Promise<FriendRequest>;
  async respondToRequest(requestId: string, userId: string, accept: boolean): Promise<void>;
  async removeFriend(userId: string, friendId: string): Promise<void>;
  async getFriends(userId: string): Promise<Friend[]>;
  async getPendingRequests(userId: string): Promise<FriendRequest[]>;
}
```

### FriendsController

```typescript
// apps/backend/src/modules/social/controllers/friends.controller.ts

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {

  @Get()
  async getFriends(@CurrentUser() user): Promise<Friend[]>;

  @Get('search')
  async searchUsers(@Query('q') query: string, @CurrentUser() user): Promise<UserSearchResult[]>;

  @Get('requests')
  async getPendingRequests(@CurrentUser() user): Promise<FriendRequest[]>;

  @Post('request')
  async sendRequest(@Body() dto: SendFriendRequestDto, @CurrentUser() user): Promise<FriendRequest>;

  @Post('request/:id/respond')
  async respondToRequest(
    @Param('id') requestId: string,
    @Body() dto: RespondRequestDto,
    @CurrentUser() user
  ): Promise<void>;

  @Delete(':friendId')
  async removeFriend(@Param('friendId') friendId: string, @CurrentUser() user): Promise<void>;
}
```

### Endpoints

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | /friends | Obtener lista de amigos |
| GET | /friends/search?q= | Buscar usuarios |
| GET | /friends/requests | Solicitudes pendientes |
| POST | /friends/request | Enviar solicitud |
| POST | /friends/request/:id/respond | Aceptar/rechazar |
| DELETE | /friends/:friendId | Eliminar amigo |

---

## DTOs

```typescript
class SendFriendRequestDto {
  @IsUUID()
  recipientId: string;
}

class RespondRequestDto {
  @IsBoolean()
  accept: boolean;
}
```

---

## Criterios de Aceptacion

- [ ] FriendsService con todos los metodos
- [ ] FriendsController con endpoints documentados
- [ ] Validaciones de seguridad (no auto-solicitudes)
- [ ] Manejo de errores (duplicados, no encontrado)
- [ ] Tests unitarios para service
- [ ] Documentacion Swagger

---

## Dependencias

- [TASK-DB-GAM-003](./TASK-DB-GAM-003-005-tablas-amigos.md) debe completarse primero

---

## Referencias

- **US Padre:** [US-GAM-010](../historias-usuario/US-GAM-010-sistema-amigos.md)

---

**Creado:** 2026-01-04
**Extraido de:** US-GAM-010
