---
id: "US-LTI-003"
title: "Deep Linking"
type: "User Story"
status: "Backlog"
priority: "Media"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-007"
story_points: 10
budget: "$1,500 USD"
sprint: "Sprint-18"
labels: ["lti", "deep-linking", "content-selection", "canvas", "moodle", "integration"]
created_date: "2025-11-07"
updated_date: "2026-01-04"
---

# US-LTI-003: Deep Linking

**Épica:** EXT-007: LTI Integration
**Prioridad:** P2
**Story Points:** 10
**Esfuerzo:** 10 horas
**Costo:** $1,500 USD
**Sprint:** 18

---

## 📋 User Story

```
Como profesor en Canvas,
Quiero seleccionar ejercicios específicos de GAMILITpara asignar a mis estudiantes
Para que puedan acceder directamente al contenido correcto sin navegar
```

---

## 🎯 Contexto de Negocio

### Problema Actual
- Profesor asigna "GAMILIT Platform" genéricamente
- Estudiante debe navegar para encontrar el ejercicio correcto
- Confusión sobre qué hacer (NPS -10 puntos)

### Solución
- **Deep Linking:** Profesor selecciona ejercicio/módulo desde Canvas
- Canvas muestra preview del contenido
- Estudiante hace clic → abre ejercicio específico

### Valor
- **Clarity:** 100% estudiantes saben qué hacer
- **Engagement:** +25% (menos abandono)
- **NPS profesores:** +10 puntos

---

## ✅ Criterios de Aceptación

### Funcionales

1. **Deep Linking Request:**
   - [ ] LMS envía deep linking request con claim:
     ```json
     {
       "https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings": {
         "deep_link_return_url": "https://canvas.com/return",
         "accept_types": ["ltiResourceLink"],
         "accept_presentation_document_targets": ["iframe", "window"]
       }
     }
     ```
   - [ ] GAMILITdetecta tipo de mensaje = "LtiDeepLinkingRequest"

2. **Content Selection UI:**
   - [ ] GAMILITmuestra página de selección de contenido
   - [ ] Listado de módulos + ejercicios disponibles
   - [ ] Preview de cada ejercicio (título, descripción, dificultad)
   - [ ] Botón "Seleccionar" por cada item

3. **Deep Linking Response:**
   - [ ] Profesor selecciona ejercicio → GAMILITconstruye JWT:
     ```json
     {
       "iss": "https://glit-platform.com",
       "aud": "canvas_client_id",
       "exp": 1699999999,
       "iat": 1699999000,
       "nonce": "random_nonce",
       "https://purl.imsglobal.org/spec/lti/claim/message_type": "LtiDeepLinkingResponse",
       "https://purl.imsglobal.org/spec/lti/claim/deployment_id": "deployment_1",
       "https://purl.imsglobal.org/spec/lti-dl/claim/content_items": [{
         "type": "ltiResourceLink",
         "title": "Crucigrama Científico - Marie Curie",
         "url": "https://glit.com/lti/launch?exercise_id=ex_123",
         "custom": {
           "exercise_id": "ex_123",
           "module_id": "mod_1"
         }
       }]
     }
     ```
   - [ ] JWT firmado con private key de GLIT
   - [ ] POST a `deep_link_return_url` con `JWT=<token>`

4. **Launch con Deep Link:**
   - [ ] Estudiante hace clic en assignment → LTI launch
   - [ ] Launch incluye custom parameters: `exercise_id`, `module_id`
   - [ ] GAMILITredirige directamente al exercise player

### No Funcionales

5. **Performance:**
   - [ ] Content selection UI carga <2 segundos
   - [ ] Listado paginado (20 items por página)

6. **UX:**
   - [ ] Search bar para filtrar ejercicios
   - [ ] Filtros por módulo, dificultad
   - [ ] Thumbnails de ejercicios

---

## 🔧 Tareas Técnicas

### Backend (6h)

1. **Deep Linking Request Handler (2h)**
   - [ ] Endpoint `POST /api/v1/lti/deep-linking/request`
   - [ ] Validar JWT del LMS
   - [ ] Extraer `deep_linking_settings`
   - [ ] Guardar en sesión (Redis)

2. **Content Items API (2h)**
   - [ ] Endpoint `GET /api/v1/lti/content-items`
   - [ ] Retorna ejercicios/módulos disponibles
   - [ ] Formato: `{ id, title, description, difficulty, thumbnail_url }`

3. **Deep Linking Response (2h)**
   - [ ] Endpoint `POST /api/v1/lti/deep-linking/response`
   - [ ] Body: `{ selected_item_id }`
   - [ ] Construir JWT con `content_items`
   - [ ] Firmar con private key
   - [ ] POST a `deep_link_return_url`

### Frontend (4h)

4. **Content Selection Page (3h)**
   - [ ] Página `/lti/content-selection`
   - [ ] Grid de ejercicios con thumbnails
   - [ ] Search + filtros
   - [ ] Botón "Seleccionar" por item
   - [ ] Manejo de loading/errors

5. **Integration Testing (1h)**
   - [ ] Test con Canvas sandbox
   - [ ] Verificar assignment creado correctamente
   - [ ] Verificar launch con custom parameters

---

## 📊 Métricas de Éxito

### Post-Lanzamiento (1 mes)
- **Adoption:** >70% profesores usan deep linking
- **Student clarity:** 95% saben qué ejercicio hacer
- **NPS profesores:** +10 puntos

---

## 🔗 Dependencias

### Bloqueado por
- **US-LTI-001:** OIDC Login

---

## 📚 Referencias

- [LTI Deep Linking Spec](https://www.imsglobal.org/spec/lti-dl/v2p0/)

---

**Creado:** 2025-11-07
**Asignado a:** Full-stack Team
