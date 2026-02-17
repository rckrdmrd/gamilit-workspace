---
id: "RF-SOC-001"
title: "Sistema de Amigos y Social"
type: "Requerimiento Funcional"
status: "Especificado"
priority: "P1"
epic: "EAI-003-EXT"
module: "social_features"
labels: ["gamification", "social", "friends", "leaderboard", "multiplier"]
created_date: "2026-01-20"
updated_date: "2026-01-20"
---

# RF-SOC-001: Sistema de Amigos y Social

## Informacion General

| Campo | Valor |
|-------|-------|
| **ID** | RF-SOC-001 |
| **Epic** | EAI-003-EXT - Gamificacion Social |
| **Fase** | 3 - Extensiones |
| **Prioridad** | P1 |
| **Estado** | Especificado |
| **Tipo** | Feature - Sistema de Amigos |

---

## Descripcion

Sistema completo de interaccion social entre estudiantes que incluye:
1. Gestion de amigos (agregar, eliminar, gestionar solicitudes)
2. Leaderboard filtrado entre amigos
3. Multiplicador de ML Coins basado en rango del estudiante

---

## Objetivo

Proporcionar a los estudiantes herramientas para:
- Conectar con otros estudiantes (amigos)
- Competir de forma saludable (leaderboard de amigos)
- Sentir recompensa progresiva (multiplicador por rango)

---

## User Stories Relacionadas

| ID | Titulo | SP | Prioridad |
|----|--------|----|-----------|
| **[US-GAM-010](../user-stories/US-GAM-010/US-GAM-010-sistema-amigos.md)** | Sistema de Amigos | 8 | P1 |
| **[US-GAM-011](../user-stories/US-GAM-011/US-GAM-011-multiplicador-mlcoins.md)** | Multiplicador ML Coins por Rango | 5 | P1 |
| **[US-GAM-012](../user-stories/US-GAM-012/US-GAM-012-leaderboard-amigos.md)** | Leaderboard de Amigos | 5 | P1 |

**Total:** 18 SP

---

## Actores

- **Estudiante**: Busca amigos, gestiona conexiones, compite en leaderboard
- **Sistema**: Calcula multiplicadores, genera leaderboards, envia notificaciones

---

## Requerimientos Funcionales

### RF-SOC-001.1: Busqueda de Usuarios

**Descripcion:** Permitir a estudiantes buscar otros usuarios para agregar como amigos.

**Criterios:**
- Buscar por nombre o email
- Mostrar: avatar, nombre, rango, nivel
- Filtrar usuarios ya amigos
- Filtrar usuarios con solicitud pendiente
- Respetar configuracion de privacidad

---

### RF-SOC-001.2: Solicitudes de Amistad

**Descripcion:** Sistema de solicitudes bidireccionales para establecer conexion.

**Criterios:**
- Enviar solicitud a usuario encontrado
- Ver solicitudes pendientes (enviadas y recibidas)
- Aceptar o rechazar solicitudes recibidas
- Notificar resultado al solicitante
- Rate limiting: maximo 10 solicitudes/hora

---

### RF-SOC-001.3: Gestion de Amigos

**Descripcion:** Administrar lista de amigos existentes.

**Criterios:**
- Ver lista de amigos ordenada por actividad reciente
- Ver perfil publico de cada amigo
- Eliminar amigo (con confirmacion)
- Limite maximo: 100 amigos por usuario

---

### RF-SOC-001.4: Privacidad de Perfiles

**Descripcion:** Control de informacion visible para no-amigos.

**Criterios:**
- No-amigos ven solo: nombre, avatar, rango
- Amigos ven adicionalmente: XP, progreso, actividad
- Configuracion de privacidad personal

---

### RF-SOC-001.5: Leaderboard de Amigos

**Descripcion:** Ranking personalizado mostrando solo amigos del usuario.

**Criterios:**
- Ordenar por XP total (mayor a menor)
- Mostrar posicion propia destacada
- Filtros: semanal, mensual, historico
- Usuario sin amigos ve mensaje con CTA
- Cache de 5 minutos para performance

---

### RF-SOC-001.6: Notificaciones de Posicion

**Descripcion:** Alertas cuando un amigo supera al usuario en el ranking.

**Criterios:**
- Notificacion cuando amigo supera posicion
- Link al leaderboard desde notificacion
- Configurable (habilitar/deshabilitar)

---

### RF-SOC-001.7: Multiplicador de ML Coins

**Descripcion:** Bonus de recompensas basado en rango Maya del estudiante.

**Tabla de Multiplicadores:**

| Rango | Nombre | Multiplicador |
|-------|--------|---------------|
| 1 | Semilla de Cacao | 1.0x |
| 2 | Recolector de Frutos | 1.1x |
| 3 | Artesano de Palabras | 1.2x |
| 4 | Escriba del Pueblo | 1.3x |
| 5 | Guardian de Historias | 1.4x |
| 6 | Sabio del Consejo | 1.5x |
| 7 | Chaman de las Letras | 1.6x |
| 8 | Senor del Conocimiento | 1.7x |
| 9 | Gran Sacerdote | 1.8x |
| 10 | K'uk'ulkan | 2.0x |

**Criterios:**
- Aplicar a recompensas de ejercicios completados
- Aplicar a recompensas de misiones completadas
- NO aplicar a compras/transferencias
- Mostrar bonus en mensaje de recompensa
- Calcular en tiempo real (no cache)
- Registrar multiplicador aplicado en transacciones

---

## Modelo de Datos

### Tabla: `social_features.friendships`

```sql
CREATE TABLE social_features.friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, friend_id)
);
```

**Notas:**
- Relacion bidireccional (se crean 2 registros por amistad)
- Indices en user_id y friend_id para queries rapidas

---

### Tabla: `social_features.friend_requests`

```sql
CREATE TABLE social_features.friend_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(requester_id, recipient_id)
);
```

**Estados:**
- `pending`: Solicitud enviada, esperando respuesta
- `accepted`: Aceptada, amistad creada
- `rejected`: Rechazada

---

### Funcion: `calculate_rank_multiplier`

```sql
CREATE FUNCTION calculate_rank_multiplier(rank_id INTEGER)
RETURNS DECIMAL(3,1) AS $$
BEGIN
    RETURN CASE rank_id
        WHEN 1 THEN 1.0
        WHEN 2 THEN 1.1
        WHEN 3 THEN 1.2
        WHEN 4 THEN 1.3
        WHEN 5 THEN 1.4
        WHEN 6 THEN 1.5
        WHEN 7 THEN 1.6
        WHEN 8 THEN 1.7
        WHEN 9 THEN 1.8
        WHEN 10 THEN 2.0
        ELSE 1.0
    END;
END;
$$ LANGUAGE plpgsql;
```

---

## Flujos de Trabajo

### Flujo 1: Agregar Amigo

```
Estudiante → Buscar usuario por nombre
          → Seleccionar de resultados
          → Enviar solicitud de amistad
          → Sistema notifica al destinatario
          → Destinatario acepta/rechaza
          → Si acepta: crear amistad bidireccional
          → Notificar resultado al solicitante
```

### Flujo 2: Leaderboard de Amigos

```
Estudiante → Acceder a Leaderboard
          → Seleccionar tab "Amigos"
          → Sistema consulta amigos + stats
          → Ordenar por XP (cache 5 min)
          → Mostrar lista con posicion destacada
          → Aplicar filtro de periodo si se selecciona
```

### Flujo 3: Aplicar Multiplicador

```
Estudiante completa ejercicio → Sistema calcula recompensa base
                             → Obtener rango actual del estudiante
                             → Calcular multiplicador
                             → Aplicar: final = base * multiplicador
                             → Registrar en transaccion
                             → Mostrar mensaje: "+140 ML Coins (x1.4 bonus)"
```

---

## Seguridad y RLS

### `friendships`
- Usuario ve solo sus propias amistades
- Solo puede eliminar sus propias relaciones

### `friend_requests`
- Usuario ve solicitudes donde es requester o recipient
- Solo recipient puede aceptar/rechazar

### Validaciones
- No enviar solicitud a uno mismo
- No enviar duplicada si ya existe pendiente
- Rate limiting para prevenir spam

---

## Endpoints Requeridos

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/v1/friends` | Lista de amigos |
| POST | `/api/v1/friends/request` | Enviar solicitud |
| GET | `/api/v1/friends/requests` | Solicitudes pendientes |
| POST | `/api/v1/friends/requests/:id/respond` | Responder solicitud |
| DELETE | `/api/v1/friends/:friendId` | Eliminar amigo |
| GET | `/api/v1/friends/search` | Buscar usuarios |
| GET | `/api/v1/leaderboards/friends` | Leaderboard de amigos |
| GET | `/api/v1/users/me/multiplier` | Multiplicador actual |

---

## Componentes UI Requeridos

| Componente | Descripcion |
|------------|-------------|
| FriendCard | Tarjeta de amigo con avatar y stats |
| FriendsList | Lista de amigos con acciones |
| FriendSearch | Busqueda de usuarios |
| FriendRequests | Lista de solicitudes pendientes |
| AddFriend | Modal para agregar amigo |
| FriendLeaderboard | Leaderboard filtrado |
| MultiplierBadge | Indicador de multiplicador actual |

---

## Especificacion Tecnica Relacionada

- **[ET-SOC-001](../specifications/ET-SOC-001-sistema-amigos.md)** - Diseno tecnico detallado

---

## Referencias

- Documento de Diseno v6.1 (multiplicadores)
- User Stories: US-GAM-010, US-GAM-011, US-GAM-012

---

**Creado:** 2026-01-20
**Sistema:** SIMCO (Sistema Indexado Modular por Contexto)
