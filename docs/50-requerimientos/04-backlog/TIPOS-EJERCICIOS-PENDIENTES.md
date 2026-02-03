# Tipos de Ejercicios Pendientes - Backlog

**Fecha:** 2025-12-18 (actualizado)
**Versión:** 2.0
**Estado:** Documentado, no implementado

---

## ⚠️ NOTA IMPORTANTE (2025-12-18)

Los ejercicios `resena_critica`, `chat_literario`, `email_formal` y `ensayo_argumentativo` fueron **ELIMINADOS** de este backlog por no estar definidos en el **DocumentoDeDiseño_Mecanicas_GAMILIT_v6.4**.

El Módulo 4 solo tiene **5 ejercicios oficiales**:
1. Verificador de Fake News (4.1)
2. Infografía Interactiva (4.2)
3. Quiz TikTok (4.3)
4. Navegación Hipertextual (4.4)
5. Análisis de Memes (4.5)

**Referencia:** `docs/00-vision-general/DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md` líneas 782-965

---

## 📋 Resumen Ejecutivo

**Total de tipos pendientes:** 6

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

### Tipos Auxiliares/Transversales (4 tipos pendientes)

#### 3. `comprension_auditiva`

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

#### 4. `collage_prensa`

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

#### 5. `texto_movimiento`

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

#### 6. `call_to_action`

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
| mapa_conceptual | Alta | Media | 100 | ⏳ Requiere librería compleja |
| comprension_auditiva | Media | Media | 100 | ⚠️ Si hay recursos de audio |
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
**Última actualización:** 2025-12-18 (limpieza de ejercicios no oficiales del M4)
