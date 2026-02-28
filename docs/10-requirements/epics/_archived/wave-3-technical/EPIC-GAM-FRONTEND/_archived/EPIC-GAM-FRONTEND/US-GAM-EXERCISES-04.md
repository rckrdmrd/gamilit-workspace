---
titulo: "US-GAM-EXERCISES-04: Completar Ejercicio de Lectura Digital"
tipo: user-story
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: archivado
---

# US-GAM-EXERCISES-04: Completar Ejercicio de Lectura Digital

**Prefijo:** GAM | **Modulo:** exercises | **Prioridad:** P2 | **SP:** 5
**Epic:** EPIC-GAM-FRONTEND

---

## Historia de Usuario

**Como** estudiante con acceso al Modulo 4,
**Quiero** completar ejercicios de lectura digital (verificador de fake news, infografia, quiz TikTok, navegacion hipertextual, analisis de memes),
**Para** desarrollar competencias de comprension en entornos digitales y multimodales.

---

## Criterios de Aceptacion

### Escenario 1: Verificador de fake news
**Given** un estudiante que inicia un ejercicio de "Verificador de Fake News"
**When** recibe una noticia y debe determinar si es verdadera o falsa
**Then** debe identificar al menos 3 criterios de verificacion (fuente, fecha, lenguaje)
**And** el sistema evalua automaticamente los criterios seleccionados
**And** muestra la explicacion de por que la noticia es verdadera/falsa

### Escenario 2: Analisis de memes
**Given** un estudiante con ejercicio de "Analisis de Memes" asignado
**When** analiza un meme y responde preguntas sobre mensaje implicito, audiencia y contexto
**Then** el sistema evalua mediante rubrica semi-automatica
**And** otorga score basado en profundidad de analisis

### Escenario 3: Quiz TikTok
**Given** un estudiante que inicia un "Quiz TikTok" (formato video corto)
**When** ve el video educativo y responde preguntas rapidas
**Then** las preguntas aparecen en formato stories (una a la vez)
**And** evaluacion automatica con feedback inmediato
**And** bonus de tiempo si responde rapido (time_bonus)

---

## Definition of Done

- [ ] Los 5 tipos de ejercicio digital funcionan
- [ ] Multimedia integrado (video, imagenes, hipertexto)
- [ ] Evaluacion automatica para la mayoria
- [ ] Time bonus implementado para quiz rapidos
- [ ] Responsive design (mobile-first para estos ejercicios)
- [ ] Tests unitarios para evaluadores digitales
