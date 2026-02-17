---
id: "TASK-FE-GAM-002"
title: "Implementar UI de amigos"
type: "Task"
status: "To Do"
priority: "Media"
assignee: "@Frontend-Agent"
epic: "EAI-003-EXT"
parent_us: "US-GAM-010"
estimated_hours: 5
labels: ["frontend", "ui", "social", "friends", "react"]
created_date: "2026-01-04"
updated_date: "2026-01-04"
---

# TASK-FE-GAM-002-003: Implementar UI de amigos

## Informacion General

| Campo | Valor |
|-------|-------|
| **ID** | TASK-FE-GAM-002 |
| **US Padre** | US-GAM-010 |
| **Epic** | EAI-003-EXT |
| **Tipo** | Frontend Development |
| **Estimacion** | 5 horas |
| **Estado** | To Do |

---

## Subtareas

| ID | Descripcion | Estado |
|----|-------------|--------|
| FE-GAM-002 | Implementar componentes UI | To Do |
| FE-GAM-003 | Conectar friendsStore con API real | To Do |

---

## Componentes a Implementar

### 1. FriendCard.tsx
Card con avatar, nombre, rango y boton de accion.

### 2. FriendsList.tsx
Lista de amigos con scroll infinito.

### 3. FriendSearch.tsx
Input de busqueda con debounce y resultados.

### 4. FriendRequests.tsx
Panel de solicitudes pendientes con accept/reject.

### 5. AddFriend.tsx
Modal/panel para buscar y agregar amigos.

### 6. ActivityFeed.tsx
Feed de actividad reciente de amigos.

### 7. FriendRecommendations.tsx
Sugerencias de amigos basadas en classrooms.

---

## Estructura de Archivos

```
apps/frontend/src/features/social/
├── components/
│   ├── FriendCard.tsx
│   ├── FriendsList.tsx
│   ├── FriendSearch.tsx
│   ├── FriendRequests.tsx
│   ├── AddFriend.tsx
│   ├── ActivityFeed.tsx
│   └── FriendRecommendations.tsx
├── hooks/
│   └── useFriends.ts
├── services/
│   └── friendsApi.ts
└── stores/
    └── friendsStore.ts
```

---

## Criterios de Aceptacion

- [ ] 7 componentes implementados
- [ ] Responsive design (mobile-first)
- [ ] Estados de loading y error
- [ ] Conectado a API real (no mock)
- [ ] Integrado con tema detectivesco
- [ ] Tests de componentes

---

## Dependencias

- [TASK-BE-GAM-002](./TASK-BE-GAM-002-003-friends-api.md) debe completarse primero

---

## Referencias

- **US Padre:** [US-GAM-010](../../user-stories/US-GAM-010/US-GAM-010-sistema-amigos.md)
- **Design System:** Detective Theme

---

**Creado:** 2026-01-04
**Extraido de:** US-GAM-010
