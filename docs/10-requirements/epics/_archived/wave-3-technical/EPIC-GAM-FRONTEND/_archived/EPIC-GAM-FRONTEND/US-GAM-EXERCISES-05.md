---
titulo: "US-GAM-EXERCISES-05: Completar Ejercicio de Produccion y Expresion"
tipo: user-story
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: archivado
---

# US-GAM-EXERCISES-05: Completar Ejercicio de Produccion y Expresion

**Prefijo:** GAM | **Modulo:** exercises | **Prioridad:** P2 | **SP:** 8
**Epic:** EPIC-GAM-FRONTEND

---

## Historia de Usuario

**Como** estudiante con acceso al Modulo 5,
**Quiero** elegir y completar un ejercicio de produccion (diario multimedia, comic digital, o video carta),
**Para** expresar mi comprension del texto de forma creativa y productiva.

---

## Criterios de Aceptacion

### Escenario 1: Elegir tipo de produccion
**Given** un estudiante que ingresa al Modulo 5 con una lectura asignada
**When** ve las 3 opciones de produccion disponibles
**Then** puede elegir UNA de las 3 opciones (diario, comic, video carta)
**And** ve instrucciones claras y rubrica de evaluacion
**And** una vez elegida, trabaja en su produccion

### Escenario 2: Crear comic digital
**Given** un estudiante que elige "Comic Digital"
**When** usa el editor de comic (paneles, texto, imagenes)
**Then** puede crear al menos 4 paneles que representen la lectura
**And** puede guardar borradores y continuar despues
**And** al finalizar, envia para evaluacion del maestro

### Escenario 3: Evaluacion manual por maestro
**Given** un estudiante que envio su produccion
**When** el maestro recibe la notificacion de revision pendiente
**Then** el maestro evalua con rubrica predefinida (creatividad, contenido, estructura)
**And** asigna score de 0 a 100
**And** XP y ML Coins se calculan y otorgan al estudiante
**And** estudiante recibe notificacion con retroalimentacion

---

## Definition of Done

- [ ] Los 3 tipos de produccion funcionan (diario, comic, video carta)
- [ ] Editor de comic con paneles, texto, imagenes
- [ ] Guardado de borradores (autosave)
- [ ] Flujo de envio -> revision maestro -> notificacion
- [ ] Rubrica de evaluacion para maestro
- [ ] Upload de multimedia (imagen, video, audio)
- [ ] Tests de integracion para flujo completo

---

## Notas Tecnicas
- Evaluacion: 100% manual por maestro
- Multimedia: storage service para archivos
- Endpoint: POST /exercises/:id/submit (con multipart upload)
- Notification: Socket.IO + push al maestro
