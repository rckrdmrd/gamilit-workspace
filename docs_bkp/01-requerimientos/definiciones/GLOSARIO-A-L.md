# Glosario de Conceptos A-L - GAMILIT Platform

**Proyecto:** Gamilit Platform
**Archivo original:** GLOSARIO-CONCEPTOS.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## A

### Achievement (Logro)
Reconocimiento virtual otorgado al estudiante por completar objetivos específicos (ej: "Completa 10 ejercicios", "Mantén 7 días de racha"). Categorizados por tipo (progress, streak, completion, mastery, exploration, special) y rareza (common, rare, epic, legendary). Otorgan ML Coins y XP como recompensa.

### AI (Inteligencia Artificial)
Tecnología integrada en mecánicas educativas avanzadas (Módulos 2 y 3) para proporcionar feedback contextual, generar continuaciones de narrativa, validar hipótesis científicas, y analizar argumentos. Actualmente implementado con respuestas mock; preparado para integración con servicios reales (OpenAI, Google AI).

### API (Application Programming Interface)
Interfaz de programación que permite la comunicación entre frontend y backend de la plataforma. GAMILITimplementa una API RESTful con 150+ endpoints organizados por módulos (educación, gamificación, autenticación, progreso).

### Auto-gradable
Característica de un ejercicio que permite validación automática de respuestas sin intervención humana. Ejercicios como crucigrama, línea de tiempo, verdadero/falso son 100% auto-gradables. Ejercicios creativos (podcast, ensayo) requieren revisión manual o semi-automática con AI.

---

## B

### Backend
Capa del servidor de la plataforma que gestiona lógica de negocio, acceso a base de datos, autenticación, y comunicación con frontend. Implementado en Node.js + Express + TypeScript + PostgreSQL.

### Nacom
Segundo rango en la jerarquía Maya (Capitán de Guerra / Explorador). Requisitos: completar 2 módulos con score ≥70%. Otorga multiplicador de ML Coins de 1.25x y bonus de 75 ML Coins al ascender.

### Base Score
Puntuación base de un ejercicio (0-100) calculada por precisión de respuestas antes de aplicar multiplicadores, bonificaciones o penalizaciones.

### Bonus
Incremento adicional en score o rewards por condiciones especiales:
- **Perfect Bonus:** +20% si score = 100
- **First Attempt Bonus:** +15 ML Coins si primer intento correcto
- **Speed Bonus:** +15% si completa en <50% del tiempo límite
- **Streak Bonus:** +2 ML Coins × días consecutivos

---

## C

### Callback
En contexto de ejercicios educativos, se refiere al proceso de validación de respuestas y actualización de progreso después de que el estudiante completa un ejercicio. Requiere corrección en Módulos 2-4 según análisis técnico.

### Caché / Cache
Sistema de almacenamiento temporal de datos frecuentemente accedidos para mejorar performance. GAMILITplanea implementar Redis cache para leaderboards (Sprint 2) y user stats.

### Churn (Tasa de Abandono)
Porcentaje de usuarios que dejan de usar la plataforma en un período dado. Meta de GAMILIT <10% churn mensual post-correcciones.

### Comodín
Ver **Power-up**.

### Comprensión Crítica
Tercera dimensión de comprensión lectora (Módulo 3). Habilidades de evaluar, argumentar, analizar perspectivas, identificar sesgos, y formar juicios fundamentados sobre textos.

### Comprensión Inferencial
Segunda dimensión de comprensión lectora (Módulo 2). Habilidades de deducir información implícita, hacer inferencias, construir hipótesis, y conectar ideas no explícitas en el texto.

### Comprensión Literal
Primera dimensión de comprensión lectora (Módulo 1). Habilidades de identificar información explícita: hechos, datos, fechas, nombres, eventos concretos directamente mencionados en el texto.

### CRUD
Acrónimo de Create, Read, Update, Delete. Operaciones básicas de gestión de datos en base de datos y APIs.

---

## D

### Dashboard
Panel de control visual que muestra métricas, estadísticas y progreso. GAMILITincluye dashboards para estudiantes (progreso personal), profesores (desempeño de clase) y administradores (métricas de plataforma).

### DDL (Data Definition Language)
Lenguaje SQL para definir estructura de base de datos (CREATE TABLE, ALTER TABLE, etc.). GAMILITnecesita crear schema.sql con DDL completo como acción prioritaria (Sprint 0).

### Difficulty Level (Nivel de Dificultad)
Clasificación de ejercicios en tres niveles:
- **Beginner (Fácil):** Multiplier 1.0x
- **Intermediate (Medio):** Multiplier 1.2x
- **Advanced (Difícil):** Multiplier 1.5x

Afecta el scoring de ML Coins y XP ganados.

### Drag & Drop
Interacción de interfaz donde el usuario arrastra elementos con el mouse/touch para reordenarlos o conectarlos. Implementado con Framer Motion en mecánicas como línea de tiempo, mapa conceptual, puzzle de contexto.

---

## E

### Engagement (Compromiso)
Medida del nivel de interacción y actividad del usuario en la plataforma. Métricas clave: sesiones por semana, tiempo de sesión, streak days, ejercicios completados.

### Event-Driven Architecture
Patrón de arquitectura donde componentes se comunican mediante eventos (ej: `ExerciseCompleted`, `RankUp`, `AchievementUnlocked`). Recomendado para GAMILITen Sprint 2 para desacoplar módulos.

### Exercise (Ejercicio)
Unidad mínima de contenido educativo. Cada ejercicio implementa una mecánica específica (ej: crucigrama, debate digital) sobre contenido de Marie Curie. GAMILITincluye 22 ejercicios implementados en 33 componentes frontend.

### XP (Experience Points)
Puntos de experiencia que acumulan estudiantes por actividades en la plataforma. Usados para progresión en leaderboards y como métrica de actividad total. No se usan para ascenso de rangos (decisión de diseño pedagógico).

---

## F

### Frontend
Capa de interfaz de usuario de la plataforma con la que interactúan estudiantes, profesores y administradores. Implementado en React 19 + TypeScript + Tailwind CSS + Framer Motion.

### Framer Motion
Librería de animaciones para React usada en todas las mecánicas de GAMILITpara transiciones fluidas, drag & drop, animaciones de confeti, y feedback visual.

---

## G

### Gamificación
Aplicación de elementos de diseño de juegos en contextos no lúdicos para aumentar engagement y motivación. GAMILITimplementa gamificación mediante rangos Maya, ML Coins, achievements, power-ups, misiones y leaderboards.

### GAMILIT/ GAMILIT
Acrónimo de **Gamified Learning with Intelligent Technology**. Nombre de la plataforma educativa. "GAMILIT" es nombre alternativo usado en documentación interna.

### Grid
Cuadrícula de celdas usada en mecánicas como crucigrama y sopa de letras. Implementado con componentes React + CSS Grid para responsiveness.

### Halach Uinic
Cuarto rango en la jerarquía Maya (Hombre Verdadero / Crítico). Requisitos: completar 4 módulos con score ≥70%. Otorga multiplicador de 1.75x y bonus de 125 ML Coins.

### Guild
Sistema social de equipos/clanes de estudiantes. UI implementada en frontend pero backend NO funcional (0%). Prioridad P2 para implementación futura.

---

## H

### Hint (Pista)
Ayuda textual que revela información para resolver un ejercicio. Sistema de hints disponible en todas las mecánicas:
- Costo: 15 ML Coins por pista
- Penalty: -10% en XP ganado
- Límite: 3 pistas máximo por ejercicio

### Ah K'in
Tercer rango en la jerarquía Maya (Sacerdote del Sol / Analítico). Requisitos: completar 3 módulos con score ≥70%. Otorga multiplicador de 1.5x y bonus de 100 ML Coins.

---

## I

### IDOR (Insecure Direct Object Reference)
Vulnerabilidad de seguridad donde un usuario puede acceder a datos de otro usuario manipulando IDs en URLs. Detectado en 15+ endpoints de GAMILIT requiere corrección urgente (Sprint 0).

### Inferencia
Conclusión lógica derivada de evidencias implícitas en el texto, no explícitamente mencionada. Habilidad central del Módulo 2 (Comprensión Inferencial).

---

## J

### JWT (JSON Web Token)
Estándar de token para autenticación. GAMILITusa JWT para gestionar sesiones de usuarios. **BUG conocido:** Tokens almacenados en texto plano en DB; requiere hashing (Sprint 0).

---

## K

### Keyword
Palabra clave relevante en un texto. Usada en mecánicas como Verificador de Fake News, Análisis de Memes, y Predicción Narrativa para validación de comprensión.

### KPI (Key Performance Indicator)
Indicador clave de rendimiento. GAMILITdefine KPIs técnicos (uptime, load time), de negocio (retention, CAC), y educativos (score promedio, módulos completados).

---

## L

### Leaderboard (Tabla de Clasificación)
Ranking de estudiantes ordenados por métrica específica (total XP, ML Coins, score promedio). Tipos en GAMILIT global, school, classroom, weekly, por módulo. Implementados con vistas materializadas para performance.

### Lectura Digital
Cuarta dimensión de comprensión lectora (Módulo 4). Habilidades de navegar medios digitales, verificar información (fact-checking), interpretar contenido multimodal, y ejercer literacidad mediática.

### Literacidad Mediática
Capacidad de acceder, analizar, evaluar y crear contenido en diversos formatos y plataformas digitales. Objetivo central del Módulo 4.

---

**Documento preparado por:** Equipo de Documentación Técnica
**Fecha:** Octubre 2025
**Total de términos (A-L):** 75+

**Fuentes:**
- Análisis técnicos ciclos 1-3
- Documentación de módulos educativos
- Documentación de sistema de gamificación
- Código fuente backend y frontend
- Estándares de industria (OWASP, WCAG, etc.)
