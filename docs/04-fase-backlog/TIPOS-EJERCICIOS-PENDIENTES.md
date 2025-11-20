# Tipos de Ejercicios Pendientes - Backlog

**Fecha:** 2025-11-19
**Versión:** 1.0
**Estado:** Documentado, no implementado

---

## 📋 Resumen Ejecutivo

**Total de tipos pendientes:** 10

Estos tipos de ejercicios estaban incluidos en versiones anteriores del ENUM `educational_content.exercise_type` pero fueron removidos el **2025-11-17** durante la sincronización con seeds reales.

**Razón de remoción:** Solo se implementaron 23 tipos para el MVP (5 módulos × 4-5 ejercicios promedio). Los tipos adicionales quedaron pendientes para fases futuras.

---

## 🎯 Tipos de Ejercicios por Módulo

### Módulo 1: Comprensión Literal (2 tipos pendientes)

#### 1. `mapa_conceptual`

**Nombre completo:** Mapa Conceptual

**Descripción:**
Ejercicio donde el estudiante crea un mapa conceptual visual conectando conceptos clave del texto con relaciones lógicas (jerarquías, causa-efecto, etc.).

**Mecánica propuesta:**
- Interfaz drag-and-drop con nodos y conectores
- Banco de conceptos predefinidos del texto
- Tipos de relaciones: "es un", "causa", "parte de", "ejemplo de"
- Validación automática de estructura mínima correcta
- Visualización tipo árbol o red

**Ejemplo aplicado a Marie Curie:**
```
Marie Curie (central)
  ├─ es un → Científica
  ├─ descubrió → Radio, Polonio
  ├─ ganó → Premio Nobel (×2)
  └─ trabajó en → Sorbona
```

**XP estimado:** 100 XP
**ML estimado:** 20 ML
**Dificultad técnica:** Alta (requiere librería de grafos interactivos)
**Prioridad:** Media

---

#### 2. `emparejamiento`

**Nombre completo:** Emparejamiento de Conceptos

**Descripción:**
Ejercicio donde el estudiante conecta elementos de dos columnas que están relacionados (fechas con eventos, nombres con logros, etc.).

**Mecánica propuesta:**
- Dos columnas: columna A (términos) y columna B (definiciones/relacionados)
- Conectar mediante líneas o drag-and-drop
- Feedback inmediato al conectar (correcto/incorrecto)
- Límite de 10 pares máximo

**Ejemplo aplicado a Marie Curie:**
```
Columna A             Columna B
---------             ---------
Polonio          →    País natal de Marie
Radio            →    Elemento descubierto en 1898
1903             →    Año del primer Nobel
Pierre Curie     →    Esposo y colaborador
Sorbona          →    Universidad donde enseñó
```

**XP estimado:** 100 XP
**ML estimado:** 20 ML
**Dificultad técnica:** Baja
**Prioridad:** Alta (fácil de implementar)

---

### Módulo 4: Lectura Digital y Multimodal (4 tipos pendientes)

#### 3. `resena_critica`

**Nombre completo:** Reseña Crítica

**Descripción:**
El estudiante escribe una reseña crítica de 300-500 palabras sobre un artículo digital relacionado con el texto base.

**Mecánica propuesta:**
- Editor de texto enriquecido (formato, negritas, listas)
- Plantilla guiada con secciones:
  1. Resumen (¿De qué trata?)
  2. Puntos fuertes
  3. Puntos débiles
  4. Opinión personal fundamentada
  5. Recomendación (sí/no y por qué)
- Contador de palabras
- Análisis automático de estructura
- Revisión por pares opcional

**Ejemplo aplicado a Marie Curie:**
Reseñar artículo: "El legado de Marie Curie en la ciencia moderna"

**XP estimado:** 150 XP (ejercicio más complejo)
**ML estimado:** 30 ML
**Dificultad técnica:** Media
**Prioridad:** Media

---

#### 4. `chat_literario`

**Nombre completo:** Chat Literario Simulado

**Descripción:**
Conversación simulada con un personaje del texto (ej: Marie Curie) usando IA o respuestas predefinidas.

**Mecánica propuesta:**
- Interfaz de chat estilo WhatsApp/Telegram
- 5-10 preguntas predefinidas que el estudiante puede hacer
- Respuestas basadas en el texto (históricamente precisas)
- Opción de pregunta libre (si se integra IA generativa)
- Registro de conversación descargable

**Ejemplo aplicado a Marie Curie:**
```
Estudiante: ¿Cuál fue tu mayor desafío como mujer científica?
Marie: En mi época, las mujeres no éramos tomadas en serio en la ciencia. Me rechazaron de la Academia de Ciencias francesa incluso después de ganar un Nobel. Pero seguí trabajando porque creía en la importancia de la investigación.

Estudiante: ¿Por qué no patentaste el proceso del radio?
Marie: La ciencia debe beneficiar a toda la humanidad, no solo enriquecerme a mí. Si hubiera patentado el proceso, la medicina no habría avanzado tan rápido.
```

**XP estimado:** 100 XP
**ML estimado:** 20 ML
**Dificultad técnica:** Alta (requiere IA o árbol de decisiones complejo)
**Prioridad:** Baja (funcionalidad "nice to have")

---

#### 5. `email_formal`

**Nombre completo:** Redacción de Email Formal

**Descripción:**
El estudiante redacta un email formal basado en una situación relacionada con el texto.

**Mecánica propuesta:**
- Editor de email con campos: Para, Asunto, Cuerpo, Firma
- Plantilla de estructura formal:
  1. Saludo
  2. Introducción (contexto)
  3. Cuerpo (solicitud/información)
  4. Cierre (despedida formal)
- Validación de:
  - Tono formal (sin contracciones, lenguaje apropiado)
  - Estructura completa
  - Ortografía
- Rubrica de evaluación (5 criterios)

**Ejemplo aplicado a Marie Curie:**
```
Situación: Eres periodista y quieres entrevistar a Marie Curie.
Escribe el email solicitando la entrevista.

Para: marie.curie@sorbonne.fr
Asunto: Solicitud de entrevista para Le Figaro

Estimada Profesora Curie,

Mi nombre es [nombre] y soy periodista de Le Figaro...
[cuerpo del email]

Quedo a la espera de su amable respuesta.

Atentamente,
[firma]
```

**XP estimado:** 100 XP
**ML estimado:** 20 ML
**Dificultad técnica:** Media
**Prioridad:** Media

---

#### 6. `ensayo_argumentativo`

**Nombre completo:** Ensayo Argumentativo

**Descripción:**
Redacción de un ensayo argumentativo de 500-800 palabras sobre un tema relacionado con el texto.

**Mecánica propuesta:**
- Editor de texto avanzado
- Plantilla de estructura:
  1. Introducción (tesis)
  2. Argumento 1 (con evidencia)
  3. Argumento 2 (con evidencia)
  4. Contra-argumento y refutación
  5. Conclusión
- Validación de:
  - Longitud (500-800 palabras)
  - Presencia de tesis clara
  - Al menos 2 citas del texto
  - Estructura completa
- Análisis de coherencia y cohesión
- Revisión por pares

**Ejemplo aplicado a Marie Curie:**
```
Tema: "¿La fama afectó negativamente la investigación de Marie Curie?"

Tesis propuesta: Aunque la fama trajo presión mediática, también proporcionó recursos que aceleraron su investigación.

Argumento 1: Mayor financiación
Argumento 2: Colaboraciones internacionales
Contra-argumento: Invasión de privacidad
Conclusión: Balance neto positivo
```

**XP estimado:** 200 XP (ejercicio más complejo)
**ML estimado:** 40 ML
**Dificultad técnica:** Alta (requiere análisis de texto avanzado)
**Prioridad:** Baja (muy complejo para MVP)

---

### Tipos Auxiliares/Transversales (4 tipos pendientes)

#### 7. `comprension_auditiva`

**Nombre completo:** Comprensión Auditiva

**Descripción:**
El estudiante escucha un audio relacionado con el texto y responde preguntas de comprensión.

**Mecánica propuesta:**
- Reproductor de audio integrado
- Transcripción opcional (puede habilitarse como comodín)
- 5-10 preguntas de opción múltiple
- Posibilidad de reproducir fragmentos específicos
- Contador de reproducciones (máximo 3 sin penalización)

**Ejemplo aplicado a Marie Curie:**
```
Audio: Fragmento de conferencia sobre el descubrimiento del radio (2-3 minutos)

Preguntas:
1. ¿Cuántos años tomó aislar el radio puro?
2. ¿Qué método se utilizó para procesar la pechblenda?
3. ¿Por qué era peligroso trabajar con sustancias radiactivas?
```

**XP estimado:** 100 XP
**ML estimado:** 20 ML
**Dificultad técnica:** Media (requiere archivos de audio de calidad)
**Prioridad:** Media

---

#### 8. `collage_prensa`

**Nombre completo:** Collage de Prensa

**Descripción:**
El estudiante crea un collage digital simulando portadas de periódicos sobre eventos del texto.

**Mecánica propuesta:**
- Plantillas de periódicos de época
- Banco de imágenes relacionadas
- Editor de texto para titular, subtítulo, cuerpo
- Elementos arrastrables (fotos, títulos, columnas)
- Exportar como imagen PNG/PDF

**Ejemplo aplicado a Marie Curie:**
```
Titular: "¡MUJER GANA PREMIO NOBEL!"
Subtítulo: Marie Curie, primera científica en recibir el galardón
Foto: Marie en su laboratorio
Cuerpo: [Noticia inventada basada en hechos reales]
```

**XP estimado:** 150 XP
**ML estimado:** 30 ML
**Dificultad técnica:** Alta (requiere editor visual complejo)
**Prioridad:** Baja (muy especializado)

---

#### 9. `texto_movimiento`

**Nombre completo:** Texto en Movimiento

**Descripción:**
Ejercicio donde el estudiante interactúa con texto que se mueve o cambia dinámicamente en la pantalla.

**Mecánica propuesta:**
- Texto que aparece/desaparece gradualmente
- Palabras que se desplazan y deben ordenarse
- Fragmentos ocultos que se revelan al pasar el mouse
- Temporizadores para crear urgencia
- Puntuación según velocidad de respuesta

**Ejemplo aplicado a Marie Curie:**
```
Palabras flotantes: "Marie", "Polonia", "1867", "Varsovia"
Tarea: Arrastrar en orden cronológico para formar:
"Marie nació en Varsovia, Polonia, en 1867"
```

**XP estimado:** 100 XP
**ML estimado:** 20 ML
**Dificultad técnica:** Alta (animaciones y física)
**Prioridad:** Baja (gamificación avanzada)

---

#### 10. `call_to_action`

**Nombre completo:** Llamado a la Acción

**Descripción:**
El estudiante crea un llamado a la acción (CTA) basado en los valores del texto (ej: promover la ciencia).

**Mecánica propuesta:**
- Diseño de póster digital con mensaje motivacional
- Plantillas prediseñadas (estilo redes sociales)
- Editor de texto para eslogan
- Banco de imágenes e iconos
- Compartir en galería de la clase

**Ejemplo aplicado a Marie Curie:**
```
Mensaje: "Sé como Marie: No dejes que nada te detenga"
Imagen: Silueta de mujer con átomo de fondo
Hashtag: #MujeresEnCiencia #InspiraciónCurie
```

**XP estimado:** 100 XP
**ML estimado:** 20 ML
**Dificultad técnica:** Media
**Prioridad:** Baja (marketing/motivacional)

---

## 📊 Resumen de Prioridades

| Tipo | Dificultad | Prioridad | XP | Recomendación |
|------|------------|-----------|-----|---------------|
| emparejamiento | Baja | Alta | 100 | ✅ Implementar primero |
| comprension_auditiva | Media | Media | 100 | ⚠️ Si hay recursos de audio |
| email_formal | Media | Media | 100 | ⚠️ Útil para habilidades de escritura |
| resena_critica | Media | Media | 150 | ⚠️ Buen complemento crítico |
| mapa_conceptual | Alta | Media | 100 | ⏳ Requiere librería compleja |
| chat_literario | Alta | Baja | 100 | ⏸️ Requiere IA o mucho contenido |
| ensayo_argumentativo | Alta | Baja | 200 | ⏸️ Muy complejo para MVP |
| collage_prensa | Alta | Baja | 150 | ⏸️ Muy especializado |
| texto_movimiento | Alta | Baja | 100 | ⏸️ Gamificación avanzada |
| call_to_action | Media | Baja | 100 | ⏸️ Marketing/motivacional |

**Leyenda:**
- ✅ = Implementar pronto
- ⚠️ = Considerar para siguiente fase
- ⏳ = Evaluar esfuerzo vs beneficio
- ⏸️ = Postponer para futuro lejano

---

## 🔧 Requisitos Técnicos para Implementación

### Backend
- Nuevos validadores de contenido (ensayos, emails)
- Storage para audios/videos (comprension_auditiva)
- Análisis de texto avanzado (coherencia, cohesión)

### Frontend
- Librerías de grafos (mapa_conceptual)
- Editor WYSIWYG avanzado (ensayo, email)
- Canvas para diseño (collage_prensa, call_to_action)
- Reproductor multimedia (comprension_auditiva)
- Motor de física/animaciones (texto_movimiento)

### Database
- Extender ENUM `exercise_type` con 10 nuevos valores
- Nuevas tablas para contenido multimedia
- Validadores específicos por tipo

---

## 📝 Próximos Pasos

1. **Product Owner** decide prioridades según roadmap
2. **Tech Lead** estima esfuerzo técnico para cada tipo
3. Crear épicas en backlog por tipo de ejercicio
4. Implementar en sprints futuros según prioridad

---

**Responsable:** Product Owner + Equipo de Contenido
**Próxima revisión:** Sprint Planning (cada 2 semanas)
**Última actualización:** 2025-11-19
