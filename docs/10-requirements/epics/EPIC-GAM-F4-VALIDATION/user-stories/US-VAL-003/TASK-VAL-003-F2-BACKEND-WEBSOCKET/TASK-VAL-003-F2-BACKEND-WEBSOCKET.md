# TASK-VAL-003-F2-BACKEND-WEBSOCKET: WebSocket handshake

**US:** US-VAL-003 | **Tipo:** Backend | **Estado:** Pendiente | **SP:** 2

## Descripcion
Verificar WebSocket Socket.IO handshake con autenticacion JWT.

## Acciones
1. Obtener JWT via /auth/login
2. Conectar Socket.IO client con auth token
3. Verificar evento 'authenticated' recibido
4. Verificar reconexion automatica

## Criterio Pass
- Conexion WebSocket exitosa
- Evento 'authenticated' recibido
