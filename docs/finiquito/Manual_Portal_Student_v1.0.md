# Manual del Usuario - Portal de Estudiantes GAMILIT
**Versión:** 1.1.0
**Fecha:** 25 de noviembre de 2025
**Audiencia:** Estudiantes
**Estado del Portal:** 100% Funcional (MVP Completo)

---

## Tabla de Contenidos

1. [Bienvenida al Portal de Estudiantes](#capítulo-1-bienvenida-al-portal-de-estudiantes)
2. [Primeros Pasos](#capítulo-2-primeros-pasos)
3. [Ejercicios y Módulos de Aprendizaje](#capítulo-3-ejercicios-y-módulos-de-aprendizaje)
4. [Sistema de Gamificación](#capítulo-4-sistema-de-gamificación)
5. [Perfil y Configuración](#capítulo-5-perfil-y-configuración)
6. [Economía y Tienda](#capítulo-6-economía-y-tienda)
7. [Características Sociales](#capítulo-7-características-sociales)
8. [Preguntas Frecuentes](#capítulo-8-preguntas-frecuentes)

---

# Capítulo 1: Bienvenida al Portal de Estudiantes

## 1.1 ¿Qué es GAMILIT?

GAMILIT es una plataforma educativa gamificada que te ayuda a desarrollar habilidades de **Literacidad Múltiple** a través de ejercicios interactivos basados en la vida de **Marie Curie**, científica pionera ganadora de dos premios Nobel.

### Literacidad Múltiple (Cassany)

Aprenderás 5 dimensiones complementarias:

1. **Literacidad Literal** - Comprensión básica de textos
2. **Literacidad Inferencial** - Leer entre líneas
3. **Literacidad Crítica** - Analizar y cuestionar información
4. **Literacidad Digital** - Navegar medios digitales con criterio
5. **Producción Textual** - Crear contenido efectivo

---

## 1.2 ¿Qué puedes hacer en el Portal?

### ✅ Disponible Ahora (MVP Completo)

**Aprendizaje:**
- ✅ Acceder a **30+ ejercicios interactivos** (5 Módulos completos)
- ✅ Completar ejercicios con **30+ mecánicas diferentes**
- ✅ Recibir **calificaciones automáticas** y retroalimentación
- ✅ Seguir tu progreso en tiempo real
- ✅ Usar power-ups para mejorar tu rendimiento

**Gamificación:**
- ✅ Ganar **ML Coins** por completar ejercicios
- ✅ Desbloquear **50+ logros/insignias**
- ✅ Subir en el **ranking de estudiantes**
- ✅ Completar **misiones diarias y semanales**
- ✅ Avanzar por los **6 rangos del sistema Maya**
- ✅ Ver progreso en tiempo real

**Economía:**
- ✅ Comprar **power-ups** en la tienda
- ✅ Gestionar tu inventario de ítems
- ✅ Usar potenciadores en ejercicios
- ✅ Ver historial de transacciones

**Social:**
- ✅ Ver perfiles de otros estudiantes
- ✅ Competir en **4 tipos de tablas de clasificación** (Global, Escuela, Grado, Amigos)
- ✅ **Sistema de amigos** - Enviar y aceptar solicitudes de amistad
- ✅ **Gremios/Guilds** - Unirse a grupos colaborativos
- ✅ Ver actividad de amigos

### ⏳ Próximamente (Mejoras Post-MVP)

- ⏳ Mensajería directa entre amigos
- ⏳ Ítems cosméticos para personalización
- ⏳ Notificaciones en tiempo real (WebSocket)
- ⏳ Duelos 1v1 entre estudiantes
- ⏳ Torneos mensuales

---

# Capítulo 2: Primeros Pasos

## 2.1 Registro e Inicio de Sesión

### 2.1.1 Crear una Cuenta

**Ruta:** `/auth/register`

**Pasos:**

1. Accede a la página de registro
2. Completa el formulario:
   - **Nombre completo** (mínimo 3 caracteres)
   - **Correo electrónico** (debe ser válido y único)
   - **Contraseña** (mínimo 8 caracteres, incluir mayúsculas, minúsculas y números)
   - **Confirmar contraseña**
3. Acepta los términos y condiciones
4. Haz clic en "Registrarse"
5. **Importante:** Recibirás un correo de verificación
6. Verifica tu email antes de poder iniciar sesión

**Validaciones:**
- ✅ Email único (no puede estar ya registrado)
- ✅ Contraseña segura (requisitos de complejidad)
- ✅ Verificación de email obligatoria

---

### 2.1.2 Iniciar Sesión

**Ruta:** `/auth/login`

**Pasos:**

1. Ingresa tu **email** y **contraseña**
2. Opcionalmente, marca "Recordarme" para mantener la sesión activa
3. Haz clic en "Iniciar Sesión"
4. Si tienes 2FA habilitado, ingresa el código de verificación

**Opciones disponibles:**
- 🔐 **Autenticación de Dos Factores (2FA)** - Mayor seguridad
- 🔑 **Recuperación de contraseña** - Si olvidaste tu contraseña

**Seguridad:**
- ✅ JWT tokens con expiración automática
- ✅ Protección contra ataques de fuerza bruta
- ✅ Sesiones seguras HTTPS

---

### 2.1.3 Recuperar Contraseña

**Ruta:** `/auth/forgot-password`

**Si olvidaste tu contraseña:**

1. Haz clic en "¿Olvidaste tu contraseña?" en el login
2. Ingresa tu **email registrado**
3. Revisa tu correo electrónico
4. Haz clic en el enlace de recuperación (válido por 1 hora)
5. Ingresa tu nueva contraseña
6. Confirma tu nueva contraseña
7. ✅ Ya puedes iniciar sesión con la nueva contraseña

**Nota de Seguridad:** Por razones de seguridad, nunca confirmaremos si un email existe en el sistema.

---

### 2.1.4 Verificación de Email

**Ruta:** `/auth/verify-email`

**Después de registrarte:**

1. Revisa tu bandeja de entrada (y spam)
2. Busca el correo con asunto "Verifica tu email - GAMILIT"
3. Haz clic en el enlace de verificación
4. Serás redirigido al portal con confirmación de éxito
5. ✅ Ya puedes iniciar sesión

**Si no recibiste el correo:**
- Espera 1-2 minutos (puede demorar)
- Revisa la carpeta de spam
- Solicita reenvío del correo de verificación

---

### 2.1.5 Autenticación de Dos Factores (2FA)

**Ruta:** `/auth/two-factor`

**¿Qué es 2FA?**

Capa adicional de seguridad que requiere un código temporal además de tu contraseña.

**Habilitar 2FA:**

1. Ve a **Configuración → Seguridad**
2. Activa "Autenticación de Dos Factores"
3. Escanea el código QR con tu app de autenticación (Google Authenticator, Authy, etc.)
4. Ingresa el código de 6 dígitos para confirmar
5. ✅ 2FA habilitado

**Iniciar sesión con 2FA:**

1. Ingresa email y contraseña normalmente
2. Serás redirigido a `/auth/two-factor`
3. Abre tu app de autenticación
4. Ingresa el código de 6 dígitos
5. ✅ Sesión iniciada

**Códigos de Respaldo:** Guarda los códigos de respaldo en lugar seguro (úsalos si pierdes acceso a tu app).

---

## 2.2 Dashboard Principal

### 2.2.1 Visión General del Dashboard

**Ruta:** `/student/dashboard`

Tu dashboard es tu centro de control. Aquí ves:

**1. Panel Superior (Header Gamificado):**
- 🪙 **ML Coins** - Tu saldo de monedas
- 🏆 **Rango Actual** - Tu nivel en el sistema Maya
- 🎯 **Puntos de Experiencia (XP)** - Progreso hacia el siguiente rango
- 🔔 **Notificaciones** - Alertas y actualizaciones

**2. Stats Grid (4 tarjetas):**
- ✅ **Ejercicios Completados** - Contador de ejercicios terminados
- 📊 **Progreso General** - Porcentaje de completitud
- 🏅 **Logros Desbloqueados** - Insignias obtenidas
- 👥 **Posición en Ranking** - Tu lugar en la tabla de clasificación

**3. Misiones Activas:**
- Vista de misiones diarias y semanales
- Barra de progreso para cada misión
- Recompensas al completar

**4. Módulos Disponibles:**
- Lista de los 5 módulos de Literacidad
- Indicador de progreso por módulo
- Acceso rápido a ejercicios

**5. Actividad Reciente:**
- Historial de tus últimas actividades
- Ejercicios completados
- Logros desbloqueados
- Compras en la tienda

**6. Progreso de Rango:**
- Visualización de tu rango actual
- XP acumulado vs XP requerido para siguiente rango
- Barra de progreso visual

---

### 2.2.2 Navegación Principal

**Menú de Navegación:**

| Sección | Ruta | Descripción |
|---------|------|-------------|
| 🏠 **Dashboard** | `/student/dashboard` | Resumen general |
| 📚 **Módulos** | `/student/modules/:id` | Detalle de módulos y ejercicios |
| 🏆 **Logros** | `/student/achievements` | Insignias y logros |
| 📊 **Clasificación** | `/student/leaderboard` | Tabla de ranking |
| 🎯 **Misiones** | `/student/missions` | Misiones activas y completadas |
| 🎮 **Gamificación** | `/student/gamification` | Dashboard de gamificación completo |
| 🛒 **Tienda** | `/student/shop` | Comprar power-ups |
| 🎒 **Inventario** | `/student/inventory` | Tus ítems |
| 👥 **Amigos** | `/student/friends` | Red social |
| 🛡️ **Gremios** | `/student/guilds` | Grupos colaborativos |
| ⚙️ **Configuración** | `/student/settings` | Ajustes personales |
| 👤 **Perfil** | `/student/profile` | Tu perfil público |

---

# Capítulo 3: Ejercicios y Módulos de Aprendizaje

## 3.1 Catálogo de Ejercicios

### 3.1.1 Vista General de Ejercicios

**Ruta:** `/student/modules/:moduleId`

**¿Qué verás?**

- Lista de todos los ejercicios disponibles por módulo
- Estado de cada ejercicio:
  - ✅ **Completado** - Verde, con calificación obtenida
  - 🔄 **En progreso** - Amarillo, con progreso parcial
  - ⏳ **No iniciado** - Gris, disponible para empezar
  - 🔒 **Bloqueado** - Requiere completar ejercicios previos

**Información de Cada Ejercicio:**
- **Título** del ejercicio
- **Módulo** al que pertenece
- **Puntos totales** (varía de 100 a 200)
- **Dificultad** (Básico, Intermedio, Avanzado)
- **Tiempo estimado** (5-45 minutos)
- **Tu mejor calificación** (si ya lo completaste)

---

### 3.1.2 Módulo 1: Literacidad Literal

**Estado:** ✅ **100% Implementado** (7 mecánicas)

**Descripción:** Comprensión básica de textos - identificar información explícita, comprender cronología, recordar datos específicos.

**Mecánicas Disponibles:**

| Mecánica | Descripción | Tipo de Interacción |
|----------|-------------|---------------------|
| **Verdadero o Falso** | Validar afirmaciones sobre Marie Curie | Botones V/F |
| **Timeline/Cronología** | Ordenar eventos en línea de tiempo | Arrastrar y soltar |
| **Sopa de Letras** | Encontrar términos clave en cuadrícula | Selección de letras |
| **Mapa Conceptual** | Conectar conceptos relacionados | Arrastrar conexiones |
| **Emparejamiento** | Relacionar personajes con descripciones | Drag & Drop |
| **Crucigrama** | Completar palabras cruzadas | Escribir en celdas |
| **Completar Espacios** | Llenar blancos con palabras correctas | Arrastrar palabras |

**Puntos por Ejercicio:** 100 puntos base
**XP por Ejercicio:** 100 XP
**ML Coins:** 80-100 (según calificación)

**Objetivos de Aprendizaje:**
- Identificar información explícita en el texto
- Comprender cronología de eventos
- Recordar datos específicos
- Asociar términos con definiciones

---

### 3.1.3 Módulo 2: Literacidad Inferencial

**Estado:** ✅ **100% Implementado** (6 mecánicas)

**Descripción:** Leer entre líneas - inferir motivaciones, predecir consecuencias, interpretar significados implícitos.

**Mecánicas Disponibles:**

| Mecánica | Descripción | Tipo de Interacción |
|----------|-------------|---------------------|
| **Rueda de Inferencias** | Análisis por niveles (Rueda de Daniels) | Rueda interactiva 4 niveles |
| **Puzzle de Contexto** | Reconstruir significado desde fragmentos | Armar rompecabezas |
| **Predicción Narrativa** | Anticipar consecuencias de eventos | Selección múltiple |
| **Lectura Inferencial** | Identificar significados implícitos | Análisis guiado |
| **Detective Textual** | Encontrar pistas y evidencias | Lupa interactiva |
| **Causa y Efecto** | Relacionar causas con consecuencias | Diagrama interactivo |

**Puntos por Ejercicio:** 150 puntos base
**XP por Ejercicio:** 150 XP
**ML Coins:** 120-150 (según calificación)

**Objetivos de Aprendizaje:**
- Leer entre líneas
- Inferir estados emocionales
- Comprender relaciones causales
- Predecir consecuencias lógicas
- Desarrollar pensamiento metacognitivo

**Ejercicio Destacado - Rueda de Inferencias:**
Usa la Rueda de Inferencias de Daniels con 4 niveles:
1. **Observación Literal** - ¿Qué dice el texto?
2. **Interpretación** - ¿Qué significa?
3. **Evaluación** - ¿Qué opino?
4. **Conexión** - ¿Cómo se relaciona conmigo?

---

### 3.1.4 Módulo 3: Literacidad Crítica

**Estado:** ✅ **100% Implementado** (5 mecánicas)

**Descripción:** Analizar y cuestionar información - evaluar credibilidad, identificar sesgos, argumentar críticamente.

**Mecánicas Disponibles:**

| Mecánica | Descripción | Tipo de Interacción |
|----------|-------------|---------------------|
| **Análisis de Fuentes** | Evaluar credibilidad de diferentes fuentes | Rúbrica de evaluación |
| **Debate Digital** | Argumentar posiciones con evidencia | Foro de debate |
| **Matriz de Perspectivas** | Comparar diferentes puntos de vista | Tabla comparativa |
| **Podcast Argumentativo** | Crear guion de podcast crítico | Editor de texto + audio |
| **Tribunal de Opiniones** | Evaluar argumentos como juez | Sistema de votación |

**Puntos por Ejercicio:** 200 puntos base
**XP por Ejercicio:** 200 XP
**ML Coins:** 160-200 (según calificación)

**Objetivos de Aprendizaje:**
- Evaluar credibilidad de fuentes
- Identificar sesgos y perspectivas
- Construir argumentos sólidos
- Analizar críticamente información
- Desarrollar pensamiento crítico

---

### 3.1.5 Módulo 4: Literacidad Digital

**Estado:** ✅ **100% Implementado** (9 mecánicas)

**Descripción:** Navegar medios digitales con criterio - verificar información, analizar contenido multimedia, navegar hipertextos.

**Mecánicas Disponibles:**

| Mecánica | Descripción | Tipo de Interacción |
|----------|-------------|---------------------|
| **Quiz TikTok** | Responder preguntas estilo video corto | Swipe cards |
| **Análisis de Memes** | Decodificar mensajes en memes | Anotador visual |
| **Chat Literario** | Conversación simulada sobre textos | Interfaz de chat |
| **Navegación Hipertextual** | Explorar documentos enlazados | Hipervínculos |
| **Verificador Fake News** | Identificar noticias falsas | Fact-checking |
| **Reseña Crítica** | Escribir reseña de contenido | Editor de texto |
| **Infografía Interactiva** | Explorar datos visualizados | Visualización interactiva |
| **Ensayo Argumentativo** | Redactar ensayo con estructura | Editor con guías |
| **Email Formal** | Redactar comunicación formal | Plantilla de email |

**Puntos por Ejercicio:** 200 puntos base
**XP por Ejercicio:** 200 XP
**ML Coins:** 160-200 (según calificación)

**Objetivos de Aprendizaje:**
- Validar información en internet
- Identificar fake news y desinformación
- Analizar contenido multimedia
- Navegar eficientemente en hipertextos
- Comunicarse efectivamente en formato digital

---

### 3.1.6 Módulo 5: Producción Textual

**Estado:** ✅ **100% Implementado** (3 mecánicas)

**Descripción:** Crear contenido efectivo - redactar textos, producir contenido multimedia, comunicar ideas claramente.

**Mecánicas Disponibles:**

| Mecánica | Descripción | Tipo de Interacción |
|----------|-------------|---------------------|
| **Cómic Digital** | Crear historieta sobre Marie Curie | Editor de cómic |
| **Diario Multimedia** | Escribir diario con multimedia | Editor enriquecido |
| **Video Carta** | Crear mensaje de video | Grabación + edición |

**Puntos por Ejercicio:** 200 puntos base
**XP por Ejercicio:** 200 XP
**ML Coins:** 160-200 (según calificación)

**Objetivos de Aprendizaje:**
- Producir contenido original
- Combinar texto y multimedia
- Comunicar ideas efectivamente
- Desarrollar creatividad
- Expresarse en diferentes formatos

---

### 3.1.7 Mecánicas Auxiliares

**Estado:** ✅ **Implementadas**

Mecánicas adicionales que complementan los módulos principales:

| Mecánica | Descripción |
|----------|-------------|
| **Collage de Prensa** | Crear collage con recortes de noticias |
| **Comprensión Auditiva** | Escuchar y responder preguntas |
| **Texto en Movimiento** | Leer texto animado |
| **Call to Action** | Crear llamados a la acción |

---

## 3.2 Realizar un Ejercicio

### 3.2.1 Interfaz de Ejercicio

**Ruta:** `/student/exercises/:exerciseId`

**Estructura de la Página:**

**1. Header del Ejercicio:**
- Título del ejercicio
- Módulo y número
- Puntos totales disponibles
- Timer (si aplica)
- Botón "Salir" (guarda progreso automáticamente)

**2. Área de Contenido:**
- Instrucciones claras
- Contenido del ejercicio (texto, imágenes, videos)
- Componentes interactivos según mecánica

**3. Panel de Acciones:**
- Botón "Usar Power-Up" (si tienes en inventario)
- Botón "Pista" (cuesta 10 ML Coins)
- Contador de intentos restantes (si aplica)
- Barra de progreso

**4. Retroalimentación:**
- Mensaje de éxito/error
- Explicación pedagógica
- Puntos ganados
- Nuevo XP y coins

---

### 3.2.2 Usar Power-Ups en Ejercicios

**Power-Ups Disponibles:**

| Power-Up | Efecto | Duración | Precio |
|----------|--------|----------|--------|
| 🧪 **Tiempo Extra** | +10 minutos | 1 ejercicio | 50 coins |
| 💡 **Pista Gratis** | 1 pista sin costo | 1 ejercicio | 30 coins |
| 🎯 **Doble XP** | 2x experiencia | 1 ejercicio | 100 coins |
| 🪙 **Doble Coins** | 2x monedas | 1 ejercicio | 100 coins |
| 🔄 **Segundo Intento** | 1 intento extra | 1 ejercicio | 75 coins |

**Cómo Usar:**
1. Antes de empezar el ejercicio o durante su realización
2. Haz clic en "Usar Power-Up"
3. Selecciona el power-up de tu inventario
4. Confirma el uso
5. ✅ Efecto aplicado

**Nota:** Los power-ups se consumen al usarlos. Compra más en la Tienda.

---

### 3.2.3 Sistema de Calificación

**Calificación Automática:**
- ✅ Respuestas se validan instantáneamente
- ✅ Calificación mostrada al finalizar ejercicio
- ✅ Retroalimentación educativa por pregunta

**Escala de Puntuación:**
- **100%** - Perfecto (todos los puntos)
- **80-99%** - Excelente (80-99% de puntos)
- **60-79%** - Bien (60-79% de puntos)
- **40-59%** - Suficiente (40-59% de puntos)
- **<40%** - Insuficiente (puede reintentar)

**Reintentos:**
- ✅ Puedes reintentar ejercicios para mejorar tu calificación
- ⚠️ Solo la calificación más alta se guarda
- ⚠️ Cada reintento reduce puntos disponibles en 10%

---

### 3.2.4 Retroalimentación y Mejora

**Después de Completar un Ejercicio:**

**1. Modal de Resultados:**
- 🎉 Calificación obtenida
- 🪙 ML Coins ganados
- 🎯 XP ganado
- 🏅 Logros desbloqueados (si aplica)
- 📊 Comparación con promedio de clase

**2. Análisis Detallado:**
- Preguntas correctas vs incorrectas
- Explicación de cada respuesta
- Recursos adicionales para reforzar temas débiles
- Sugerencias de ejercicios relacionados

**Ejemplo de Retroalimentación:**

```
🎉 ¡Excelente trabajo!

Calificación: 85/100
🪙 +85 ML Coins
🎯 +100 XP

Fortalezas:
✅ Comprensión de cronología (100%)
✅ Identificación de personajes (90%)

Áreas de mejora:
⚠️ Conceptos científicos (60%)
   → Recomendado: Revisar glosario de términos
   → Ejercicio sugerido: 1.4 Comprensión de Conceptos

🏅 Logro desbloqueado: "Lector Curioso"
```

---

# Capítulo 4: Sistema de Gamificación

## 4.1 Logros e Insignias

### 4.1.1 Vista de Logros

**Ruta:** `/student/achievements`

**¿Qué son los Logros?**

Insignias que desbloqueas al cumplir objetivos específicos en la plataforma. Hay **50+ logros** disponibles organizados en categorías.

**Categorías de Logros:**

1. **Progreso** (15 logros)
   - Completar ejercicios
   - Obtener calificaciones perfectas
   - Completar módulos

2. **Maestría** (12 logros)
   - Dominar mecánicas específicas
   - Obtener puntuaciones altas
   - Completar sin errores

3. **Social** (10 logros)
   - Agregar amigos
   - Unirse a gremios
   - Competir en ranking

4. **Ocultos** (8 logros)
   - Logros secretos
   - Descubrimientos especiales
   - Logros de temporada

**Información de Cada Logro:**
- 🏅 **Icono** distintivo
- 📝 **Título** del logro
- 📋 **Descripción** de cómo desbloquearlo
- 🎯 **Progreso** (si es incremental)
- 🪙 **Recompensa** en coins
- 🎯 **Recompensa** en XP
- 📅 **Fecha de desbloqueo** (si ya lo tienes)
- 🔒 **Estado** (Desbloqueado / Bloqueado)

**Ejemplos de Logros:**

| Icono | Título | Descripción | Recompensa |
|-------|--------|-------------|------------|
| 📖 | **Primer Paso** | Completa tu primer ejercicio | 50 coins, 25 XP |
| 🎓 | **Erudito** | Completa 10 ejercicios | 200 coins, 100 XP |
| 💯 | **Perfeccionista** | Obtén 100% en 5 ejercicios | 300 coins, 150 XP |
| 🔥 | **Racha de 7 días** | Ingresa 7 días consecutivos | 500 coins, 250 XP |
| 👑 | **Rey del Ranking** | Alcanza el #1 del leaderboard | 1000 coins, 500 XP |
| 🌟 | **Rango Maya Completo** | Alcanza el rango máximo (Ajaw) | 2000 coins, 1000 XP |
| 🏆 | **Coleccionista** | Desbloquea 25 logros | 750 coins, 350 XP |

---

### 4.1.2 Logros Secretos

Hay logros ocultos que no se muestran hasta que los desbloqueas. Estos son más difíciles y tienen mayores recompensas.

**Pistas:**
- 🕵️ Relacionados con descubrimientos inesperados
- 🎁 Recompensas 2-3x mayores que logros normales
- 🔒 No se muestran en la lista hasta desbloquearlos
- ✨ Tienen animación especial al desbloquearse

---

### 4.1.3 Progreso de Logros

**Logros Incrementales:**

Algunos logros tienen múltiples niveles:

**Ejemplo: "Científico Dedicado"**
- 🥉 **Bronce** - Completa 5 ejercicios (100 coins)
- 🥈 **Plata** - Completa 25 ejercicios (300 coins)
- 🥇 **Oro** - Completa 50 ejercicios (600 coins)
- 💎 **Diamante** - Completa 100 ejercicios (1200 coins)

**Barra de Progreso:**
- Cada logro incremental muestra tu progreso actual
- Ejemplo: "Científico Dedicado (Oro): 38/50 ejercicios"

---

## 4.2 Tabla de Clasificación

### 4.2.1 Leaderboard

**Ruta:** `/student/leaderboard`

**¿Qué es el Leaderboard?**

Tabla de clasificación que muestra el ranking de todos los estudiantes basado en puntos de experiencia (XP) totales.

**🌟 Tipos de Leaderboards Disponibles:**

El sistema ofrece **4 tipos de clasificaciones** para que compitas en diferentes contextos:

1. **🌍 Global** - Todos los estudiantes de la plataforma
2. **🏫 School (Escuela)** - Solo estudiantes de tu institución
3. **📚 Grade (Grado)** - Estudiantes de tu mismo grado
4. **👥 Friends (Amigos)** - Compite solo con tus amigos

**Información Mostrada:**

| Columna | Descripción |
|---------|-------------|
| **#** | Posición en el ranking |
| **Avatar** | Foto de perfil del estudiante |
| **Nombre** | Nombre del estudiante |
| **Rango** | Rango Maya actual |
| **XP** | Puntos de experiencia totales |
| **Logros** | Número de logros desbloqueados |
| **Tendencia** | ⬆️ Subió / ⬇️ Bajó / ➡️ Igual |

**Destacados:**
- 🥇 **Top 3** tienen badges especiales (oro, plata, bronce)
- 🌟 **Tu posición** está resaltada
- 📊 **Cambios** desde ayer mostrados con flechas

**Filtros de Tiempo:**
- **Diario** - Ranking del día
- **Semanal** - Ranking de la semana
- **Mensual** - Ranking del mes
- **Todo el Tiempo** - Ranking histórico

---

### 4.2.2 Actualización del Leaderboard

**Estado Actual:** ✅ Actualización por polling cada 30 segundos

**Cómo Funciona:**
- El leaderboard se actualiza automáticamente cada 30 segundos
- Si subes de posición, verás la animación de tu avatar
- Notificación si entras al Top 10

---

## 4.3 Misiones

### 4.3.1 Vista de Misiones

**Ruta:** `/student/missions`

**¿Qué son las Misiones?**

Objetivos temporales que te dan recompensas extra al completarlos. Hay misiones diarias, semanales y especiales.

**Tipos de Misiones:**

**1. Misiones Diarias (se resetean cada 24h):**
- 📚 Completa 2 ejercicios hoy
- 🏆 Gana 200 XP hoy
- 🪙 Gasta 100 coins en la tienda
- 👥 Visita 3 perfiles de amigos

**Recompensas Diarias:** 50-100 coins + 25-50 XP

**2. Misiones Semanales (se resetean cada lunes):**
- 📚 Completa 10 ejercicios esta semana
- 🏆 Gana 1000 XP esta semana
- 💯 Obtén 3 calificaciones perfectas
- 🔥 Mantén racha de 5 días

**Recompensas Semanales:** 200-500 coins + 100-250 XP

**3. Misiones Especiales (eventos únicos):**
- 🎉 Misiones de cumpleaños de Marie Curie
- 🎓 Misiones de fin de curso
- 🏅 Misiones de desafío comunitario
- 🌟 Misiones de temporada

**Recompensas Especiales:** 500-2000 coins + 250-1000 XP + ítems exclusivos

---

### 4.3.2 Progreso de Misiones

**Interfaz de Misión:**

```
┌─────────────────────────────────────────────────┐
│ 📚 Completa 3 ejercicios hoy                    │
│                                                 │
│ Progreso: [████████████░░░░░░░░] 2/3           │
│                                                 │
│ Recompensas:                                   │
│ 🪙 +75 ML Coins                                 │
│ 🎯 +50 XP                                       │
│                                                 │
│ ⏰ Se resetea en: 14h 23m                       │
└─────────────────────────────────────────────────┘
```

**Estados:**
- ✅ **Completada** - Recompensa reclamada
- 🔄 **En Progreso** - Avanzando hacia el objetivo
- ⏳ **No Iniciada** - Aún no empiezas
- 🔒 **Bloqueada** - Requiere nivel mínimo

---

### 4.3.3 Reclamar Recompensas

**Cuando completas una misión:**
1. Verás notificación en el header
2. Ve a `/student/missions`
3. Misión completada tendrá botón "Reclamar Recompensa"
4. Haz clic para recibir tus coins y XP
5. ✅ Recompensa añadida a tu perfil

**Importante:** Las recompensas de misiones diarias deben reclamarse antes de que se reseteen (24h).

---

## 4.4 Sistema de Rangos Maya

### 4.4.1 Vista de Rangos

**Ruta:** `/student/gamification`

**¿Qué es el Sistema de Rangos Maya?**

Sistema de progresión inspirado en la jerarquía de la civilización maya. Subes de rango acumulando **puntos de experiencia (XP)**.

**Los 6 Rangos Maya:**

| Rango | Nombre | XP Mínimo | XP Máximo | Multiplicador | Beneficios |
|-------|--------|-----------|-----------|---------------|------------|
| 1️⃣ | **Alux** | 0 | 499 | 1.0x | Principiante |
| 2️⃣ | **Ajkun** | 500 | 1,499 | 1.05x | +5% XP bonus |
| 3️⃣ | **Balam** | 1,500 | 3,499 | 1.10x | +10% XP, 1 power-up/semana |
| 4️⃣ | **Chaak** | 3,500 | 6,499 | 1.15x | +15% XP, 2 power-ups/semana |
| 5️⃣ | **Kukulkan** | 6,500 | 9,999 | 1.20x | +20% XP, 3 power-ups/semana |
| 6️⃣ | **Ajaw** | 10,000 | ∞ | 1.25x | +25% XP, 5 power-ups/semana, título especial |

---

### 4.4.2 Subir de Rango

**¿Cómo ganar XP?**

| Acción | XP Ganado |
|--------|-----------|
| Completar ejercicio Módulo 1 | 100 XP |
| Completar ejercicio Módulo 2 | 150 XP |
| Completar ejercicio Módulo 3-5 | 200 XP |
| Calificación perfecta (100%) | +50 XP bonus |
| Completar misión diaria | 25-50 XP |
| Completar misión semanal | 100-250 XP |
| Desbloquear logro | 25-500 XP (según rareza) |
| Mantener racha diaria | 10-50 XP/día |

**Progreso de Rango:**

Tu página de gamificación muestra:
- 🎯 **Rango actual** con insignia Maya
- 📊 **XP actual** vs XP requerido para siguiente rango
- 📈 **Barra de progreso** visual
- 🏆 **Beneficios** del rango actual
- 🎁 **Beneficios** del próximo rango
- 📊 **Multiplicador** activo

---

### 4.4.3 Beneficios por Rango

**Beneficios Acumulativos:**

Cada rango mantiene los beneficios de rangos anteriores y añade nuevos:

**Rango 1 - Alux (Principiante):**
- Acceso completo a todos los módulos
- Tienda básica

**Rango 2 - Ajkun:**
- +5% XP bonus en todos los ejercicios
- Acceso a misiones semanales

**Rango 3 - Balam:**
- +10% XP bonus
- 1 power-up gratis cada lunes
- Acceso a leaderboard por institución

**Rango 4 - Chaak:**
- +15% XP bonus
- 2 power-ups gratis cada lunes
- Descuento 10% en tienda
- Avatar con aura especial

**Rango 5 - Kukulkan:**
- +20% XP bonus
- 3 power-ups gratis cada lunes
- Descuento 20% en tienda
- Avatar exclusivo animado
- Acceso a misiones especiales

**Rango 6 - Ajaw (Maestro):**
- +25% XP bonus (máximo)
- 5 power-ups gratis cada lunes
- Descuento 30% en tienda
- Avatar exclusivo dorado animado
- Título "Ajaw" junto a tu nombre
- Acceso a contenido premium

---

## 4.5 Economía (ML Coins)

### 4.5.1 Sistema de Monedas

**¿Qué son los ML Coins? 🪙**

Moneda virtual de GAMILIT (ML = Marie Curie's Legacy). Las usas para comprar power-ups, ítems cosméticos y desbloquear contenido.

**Cómo Ganar ML Coins:**

| Acción | Coins Ganados |
|--------|---------------|
| Completar ejercicio (80%+) | 80-200 coins (según módulo) |
| Calificación perfecta | +50 coins bonus |
| Completar misión diaria | 50-100 coins |
| Completar misión semanal | 200-500 coins |
| Desbloquear logro | 50-2000 coins (según rareza) |
| Subir de rango | 500-2000 coins |
| Racha de 7 días | 300 coins |

**Cómo Gastar ML Coins:**
- 🛒 Comprar power-ups en la tienda
- 💡 Comprar pistas en ejercicios (10 coins c/u)
- 🎨 Comprar ítems cosméticos (próximamente)

---

### 4.5.2 Ver tu Balance

**Ubicación del Balance:**

Tu saldo de ML Coins siempre es visible en:
1. **Header superior derecho** - En todas las páginas
2. **Dashboard** - En stats grid
3. **Perfil** - En sección de estadísticas
4. **Tienda** - Al lado del carrito

**Historial de Transacciones:**

Ve a **Gamificación → Economía** para ver:
- 📊 Ingresos totales de coins
- 💰 Gastos totales
- 📈 Gráfica de balance en el tiempo
- 📋 Lista detallada de transacciones

---

# Capítulo 5: Perfil y Configuración

## 5.1 Tu Perfil

### 5.1.1 Perfil Público

**Ruta:** `/student/profile`

**¿Qué es tu Perfil?**

Tu perfil es tu identidad en GAMILIT. Otros estudiantes pueden ver tu perfil público (pero no información privada).

**Información Pública:**
- 👤 **Nombre de usuario** y avatar
- 🎯 **Rango Maya** actual
- 🏆 **Logros desbloqueados** (los que elijas mostrar)
- 📊 **Estadísticas generales:**
  - Ejercicios completados
  - Promedio de calificaciones
  - Racha actual de días activos
  - Posición en leaderboard
- 🏅 **Logros destacados** (puedes elegir 5 para mostrar)
- 📈 **Gráfica de progreso** (últimos 30 días)

**Información Privada (solo tú la ves):**
- 📧 Email
- 🏫 Institución y aula
- 📅 Fecha de registro
- 🔐 Configuración de seguridad
- 💰 Balance de ML Coins detallado
- 📊 Analytics completos

---

### 5.1.2 Editar Perfil

**Ruta:** `/student/profile/edit`

**Campos Editables:**

**1. Información Básica:**
- **Nombre de usuario** (único, 3-20 caracteres, alfanumérico)
- **Avatar** (subir imagen o elegir de galería)
- **Bio** (opcional, max 200 caracteres)
- **Frase motivacional** (opcional, max 100 caracteres)

**2. Privacidad:**
- **Perfil público** - ON/OFF
- **Mostrar en leaderboard** - ON/OFF
- **Mostrar estadísticas** - ON/OFF

**3. Personalización:**
- **Logros destacados** - Selecciona 5 logros para mostrar prominentemente
- **Color de tema** - Elige entre 8 paletas de colores

**Validaciones:**
- ✅ Nombre de usuario debe ser único
- ✅ Avatar máximo 2MB, formatos: JPG, PNG, GIF
- ✅ Bio sin lenguaje ofensivo (filtro automático)

---

## 5.2 Configuración

### 5.2.1 Configuración General

**Ruta:** `/student/settings`

**Secciones de Configuración:**

1. **Cuenta**
2. **Seguridad**
3. **Notificaciones**
4. **Preferencias**
5. **Privacidad**
6. **Accesibilidad**

---

### 5.2.2 Configuración de Cuenta

**Cambiar Email:**
1. Ve a **Configuración → Cuenta**
2. Ingresa tu **nuevo email**
3. Ingresa tu **contraseña actual** para confirmar
4. Recibirás email de verificación en nuevo correo
5. Confirma desde el email
6. ✅ Email actualizado

**Cambiar Contraseña:**
1. Ve a **Configuración → Cuenta**
2. Ingresa tu **contraseña actual**
3. Ingresa tu **nueva contraseña** (min 8 caracteres)
4. Confirma tu **nueva contraseña**
5. ✅ Contraseña actualizada

---

### 5.2.3 Configuración de Seguridad

**Autenticación de Dos Factores (2FA):**
Ver sección 2.1.5 para instrucciones completas de 2FA.

**Sesiones Activas:**

Ve a **Configuración → Seguridad → Sesiones Activas** para ver:
- Dispositivos con sesión activa
- Ubicación aproximada
- Última actividad
- Navegador y sistema operativo

**Cerrar Sesiones:**
- Cierra sesiones individuales con botón "Cerrar Sesión"
- Cierra todas las sesiones excepto la actual con "Cerrar Todas"

---

### 5.2.4 Configuración de Notificaciones

**Tipos de Notificaciones:**

**1. Notificaciones por Email:**
- ✉️ **Resumen diario** - Resumen de actividad del día
- ✉️ **Misiones completadas** - Cuando completas una misión
- ✉️ **Logros desbloqueados** - Cuando desbloqueas un logro
- ✉️ **Subida de rango** - Cuando subes de rango

**2. Notificaciones en la App:**
- 🔔 **Badge en header** - Contador de notificaciones no leídas
- 🔔 **Panel de notificaciones** - Click en campana para ver todas
- 🔔 **Histórico** - Últimos 30 días

**Configurar Frecuencia:**
- **Inmediato** - Al ocurrir el evento
- **Diario** - Resumen 1 vez al día
- **Semanal** - Resumen 1 vez a la semana
- **Nunca** - Desactivar completamente

---

### 5.2.5 Configuración de Preferencias

**Idioma:**
- 🇲🇽 Español (México) - Por defecto
- 🇪🇸 Español (España)

**Zona Horaria:**
- Selecciona tu zona horaria para que fechas y horarios se muestren correctamente
- Por defecto: America/Mexico_City

**Sonidos:**
- 🔊 **Efectos de sonido** - ON/OFF
- 🔊 **Notificaciones de audio** - ON/OFF
- 🎚️ **Volumen** - 0-100%

**Animaciones:**
- ✨ **Animaciones completas** - Máxima experiencia visual
- ✨ **Animaciones reducidas** - Menos movimiento (accesibilidad)
- ✨ **Sin animaciones** - Solo contenido estático

---

### 5.2.6 Configuración de Accesibilidad

**Tamaño de Texto:**
- **Pequeño** - 14px
- **Medio** - 16px (por defecto)
- **Grande** - 18px
- **Extra Grande** - 20px

**Contraste:**
- **Normal** - Colores estándar
- **Alto Contraste** - Mejor legibilidad
- **Modo Oscuro** - Fondo oscuro (reduce fatiga visual)

**Navegación por Teclado:**
- ✅ Soporte completo para screen readers
- ✅ Atributos ARIA en todos los componentes
- ✅ Navegación por teclado completa

**Reducir Movimiento:**
- Desactiva animaciones automáticas
- Útil para usuarios con sensibilidad al movimiento

---

## 5.3 Notificaciones

### 5.3.1 Centro de Notificaciones

**Ruta:** `/student/notifications` o click en 🔔 en header

**Tipos de Notificaciones:**

**1. Sistema:**
- 🔧 Mantenimiento programado
- 📢 Nuevas funcionalidades
- 🎉 Eventos especiales

**2. Educativas:**
- 📚 Nuevo ejercicio disponible
- 📝 Asignación de maestro
- ✅ Ejercicio calificado

**3. Gamificación:**
- 🏆 Logro desbloqueado
- 📈 Subida de rango
- 🎯 Misión completada
- 🥇 Cambio en leaderboard

**4. Sociales:**
- 👥 Nueva solicitud de amistad
- 🎊 Invitación a gremio

**Estados:**
- 🔵 **No leída** - Resaltada en azul
- ⚪ **Leída** - Gris
- 🗑️ **Eliminada** - Ya no visible

---

# Capítulo 6: Economía y Tienda

## 6.1 La Tienda

### 6.1.1 Navegar la Tienda

**Ruta:** `/student/shop`

**Estado:** ✅ **100% Funcional**

**Categorías Disponibles:**

**1. Power-Ups:**
- 🧪 Potenciadores para ejercicios
- 💡 Ayudas y pistas
- 🎯 Multiplicadores de recompensas

**2. Packs:**
- 🎁 Pack de Inicio - 3 power-ups básicos
- 🌟 Pack Premium - 5 power-ups variados

---

### 6.1.2 Comprar Power-Ups

**Power-Ups Disponibles:**

| Power-Up | Descripción | Precio | Stock |
|----------|-------------|--------|-------|
| 🧪 **Tiempo Extra** | +10 minutos en ejercicio | 50 coins | ∞ |
| 💡 **Pista Gratis** | 1 pista sin costo | 30 coins | ∞ |
| 🎯 **Doble XP** | 2x experiencia | 100 coins | ∞ |
| 🪙 **Doble Coins** | 2x monedas | 100 coins | ∞ |
| 🔄 **Segundo Intento** | 1 intento extra | 75 coins | ∞ |
| 🛡️ **Protección de Racha** | Mantiene racha si faltas 1 día | 150 coins | ∞ |
| 🎁 **Pack de Inicio** | 3 power-ups básicos | 120 coins | ∞ |
| 🌟 **Pack Premium** | 5 power-ups variados | 400 coins | ∞ |

**Proceso de Compra:**

1. Navega a `/student/shop`
2. Selecciona el power-up que deseas
3. Revisa la descripción y precio
4. Haz clic en "Comprar"
5. Confirma la compra
6. ✅ Power-ups añadidos a tu inventario

**Descuentos por Rango:**
- **Balam (Rango 3+):** 10% descuento
- **Chaak (Rango 4+):** 20% descuento
- **Kukulkan (Rango 5+):** 30% descuento
- **Ajaw (Rango 6):** 40% descuento

---

## 6.2 Inventario

### 6.2.1 Ver tu Inventario

**Ruta:** `/student/inventory`

**¿Qué es el Inventario?**

Almacén de todos tus power-ups y ítems. Desde aquí puedes ver qué tienes y usarlos.

**Categorías del Inventario:**

**1. Power-Ups:**
- ✅ Power-ups activos (listos para usar)
- 📦 Power-ups en stock (cantidad)
- ⏰ Power-ups temporales con tiempo restante

**Información por Ítem:**
- 📦 **Cantidad** en stock
- 📅 **Fecha de adquisición**
- 📝 **Descripción** y efectos
- 🎯 **Dónde usar** (si aplica)

---

### 6.2.2 Usar Power-Ups

**Desde el Inventario:**

**Método 1: Durante un Ejercicio**
1. Entra a un ejercicio
2. Haz clic en "Power-Ups" en el panel lateral
3. Selecciona el power-up a usar
4. Confirma el uso
5. ✅ Efecto aplicado inmediatamente

**Método 2: Activar Antes**
1. Ve a `/student/inventory`
2. Selecciona el power-up
3. Haz clic en "Activar"
4. Elige si usar ahora o en próximo ejercicio
5. ✅ Power-up activado

**Notas:**
- ⚠️ Los power-ups se consumen al usarse
- ⚠️ No puedes usar 2 power-ups del mismo tipo simultáneamente

---

# Capítulo 7: Características Sociales

## 7.1 Amigos

### 7.1.1 Sistema de Amigos

**Ruta:** `/student/friends`

**Estado:** ✅ **Implementado**

**Funcionalidades Disponibles:**

**Agregar Amigos:**
- ✅ Buscar por nombre de usuario
- ✅ Enviar solicitud de amistad
- ✅ Aceptar/rechazar solicitudes recibidas
- ✅ Límite de 100 amigos
- ✅ Ver lista de amigos actuales
- ✅ Eliminar amigos

**Tabs Disponibles:**

| Tab | Descripción |
|-----|-------------|
| **Mis Amigos** | Lista de amigos confirmados |
| **Solicitudes Pendientes** | Requests recibidos |
| **Buscar Amigos** | Búsqueda de nuevos estudiantes |
| **Actividades** | Feed de actividad de amigos |

**Acciones Disponibles:**
- 👀 Ver perfil de amigos
- 📊 Comparar estadísticas (XP, rangos, logros)
- 🏆 Ver posición relativa en leaderboard de amigos
- 🌐 Ver estado online/offline

---

### 7.1.2 Perfiles de Otros Estudiantes

**Ruta:** `/student/profile/:userId`

**Información Visible (depende de configuración de privacidad):**

**Siempre Visible:**
- 👤 Nombre de usuario y avatar
- 🎯 Rango Maya
- 📅 Fecha de ingreso

**Visible si Usuario lo Permite:**
- 🏆 Logros desbloqueados (los destacados)
- 📊 Estadísticas generales
- 🥇 Posición en leaderboard
- 🔥 Racha actual
- 📈 Gráfica de progreso

**Nunca Visible:**
- 📧 Email
- 💰 Balance de coins exacto
- 📝 Calificaciones específicas

**Acciones Disponibles:**
- ➕ Agregar como amigo
- 🚫 Reportar perfil (si es inapropiado)

---

## 7.2 Gremios

### 7.2.1 Sistema de Gremios

**Ruta:** `/student/guilds`

**Estado:** ✅ **Implementado**

**¿Qué son los Gremios?**

Grupos de 5-20 estudiantes que colaboran para completar desafíos grupales, ganar recompensas colectivas y competir contra otros gremios.

**Funcionalidades Disponibles:**

**Tabs Disponibles:**

| Tab | Descripción |
|-----|-------------|
| **Descubrir** | Lista de gremios públicos disponibles |
| **Mi Gremio** | Si perteneces a uno, ver detalles |
| **Desafíos** | Retos grupales activos |

**Crear Gremio:**
- ✅ Nombre único (3-20 caracteres)
- ✅ Descripción (200 caracteres)
- ✅ Configuración pública/privada

**Unirse a Gremio:**
- ✅ Buscar gremios públicos
- ✅ Ver información detallada
- ✅ Solicitar unirse
- ✅ Aceptar invitaciones

**Roles en Gremio:**
- 👑 **Líder** (1) - Administra el gremio
- ⚔️ **Oficial** (2-3) - Ayuda a gestionar
- 🛡️ **Miembro** - Participante activo
- 🌱 **Novato** - Recién unido (primeros 7 días)

---

### 7.2.2 Beneficios de Gremios

**Recompensas Grupales:**
- 🪙 **+10% Coins** para todos los miembros
- 🎯 **+10% XP** para todos los miembros
- 🎁 **Power-ups gratis** semanales
- 🏆 **Logros exclusivos** de gremio
- 🌟 **Título de gremio** junto a tu nombre

**Actividades de Gremio:**
- 🏆 **Desafíos Grupales** - 5-10 miembros completan objetivos
- 🥇 **Guerra de Gremios** - Competencia semanal contra otros gremios
- 📊 **Ranking de Gremios** - Tabla de clasificación global
- 🏅 **Logros de Gremio** - Logros exclusivos grupales

---

# Capítulo 8: Preguntas Frecuentes

## 8.1 Cuenta y Acceso

**P: ¿Olvidé mi contraseña, qué hago?**
R: Ve a `/auth/forgot-password`, ingresa tu email, y sigue las instrucciones del correo de recuperación.

**P: ¿Puedo cambiar mi email?**
R: Sí, ve a **Configuración → Cuenta → Cambiar Email**. Necesitarás verificar el nuevo email.

**P: ¿Cómo activo 2FA?**
R: Ve a **Configuración → Seguridad → Autenticación de Dos Factores** y sigue los pasos.

**P: ¿Puedo tener múltiples cuentas?**
R: No, está contra los términos de servicio. Una cuenta por estudiante.

---

## 8.2 Ejercicios y Aprendizaje

**P: ¿Puedo reintentar un ejercicio?**
R: Sí, puedes reintentar ejercicios para mejorar tu calificación. Solo se guarda la calificación más alta.

**P: ¿Cuántos ejercicios hay disponibles?**
R: **30+ ejercicios** distribuidos en 5 módulos completos, con más de 30 mecánicas diferentes.

**P: ¿Los ejercicios tienen límite de tiempo?**
R: Algunos ejercicios tienen timer opcional, pero la mayoría no tiene límite estricto.

**P: ¿Qué pasa si no termino un ejercicio?**
R: Tu progreso se guarda automáticamente. Puedes continuar desde donde lo dejaste.

**P: ¿Cómo funcionan las pistas?**
R: Las pistas cuestan 10 ML Coins cada una. Al usarlas, recibes información adicional.

---

## 8.3 Gamificación

**P: ¿Cómo subo de rango?**
R: Acumula puntos de experiencia (XP) completando ejercicios, misiones y logrando objetivos.

**P: ¿Puedo bajar de rango?**
R: No, los rangos son permanentes. Una vez alcanzado un rango, no puedes bajar.

**P: ¿Cómo desbloqueo logros?**
R: Los logros se desbloquean automáticamente al cumplir sus requisitos.

**P: ¿Cómo funciona el leaderboard?**
R: El leaderboard muestra el ranking de estudiantes por XP total. Se actualiza cada 30 segundos.

**P: ¿Las misiones se resetean?**
R: Misiones diarias cada 24h. Misiones semanales cada lunes. Misiones especiales son eventos únicos.

---

## 8.4 Economía

**P: ¿Puedo comprar ML Coins con dinero real?**
R: No, ML Coins solo se ganan jugando. No hay microtransacciones.

**P: ¿Los coins expiran?**
R: No, tus ML Coins no expiran nunca.

**P: ¿Puedo transferir coins a otro estudiante?**
R: Actualmente no.

---

## 8.5 Tienda e Inventario

**P: ¿Los power-ups expiran?**
R: Los power-ups permanentes no expiran. Los temporales sí expiran después de activarse.

**P: ¿Puedo devolver un power-up?**
R: No, todas las compras son finales.

**P: ¿Cuántos power-ups puedo tener?**
R: No hay límite en tu inventario.

**P: ¿Puedo usar múltiples power-ups a la vez?**
R: Sí, pero no 2 del mismo tipo.

---

## 8.6 Social y Privacidad

**P: ¿Cómo oculto mi perfil?**
R: Ve a **Configuración → Privacidad → Perfil Público** y desactívalo.

**P: ¿Puedo ocultar mi posición en el leaderboard?**
R: Sí, ve a **Configuración → Privacidad → Mostrar en Leaderboard** y desactívalo.

**P: ¿Cómo reporto un perfil inapropiado?**
R: Ve al perfil del usuario, haz clic en "..." (menú), y selecciona "Reportar Perfil".

---

## 8.7 Problemas Técnicos

**P: La página no carga, ¿qué hago?**
R:
1. Refresca la página (Ctrl+R o Cmd+R)
2. Limpia caché del navegador
3. Intenta en navegador diferente
4. Verifica tu conexión a internet

**P: No recibí el email de verificación**
R:
1. Revisa la carpeta de spam
2. Espera 1-2 minutos
3. Solicita reenvío

**P: ¿En qué navegadores funciona GAMILIT?**
R:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ Internet Explorer no soportado

**P: ¿Funciona en móvil/tablet?**
R: Sí, GAMILIT es completamente responsive.

---

## 8.8 Glosario de Términos

**ML Coins (🪙):** Moneda virtual de GAMILIT. ML = Marie Curie's Legacy.

**XP (🎯):** Puntos de experiencia usados para subir de rango.

**Rango Maya:** Sistema de progresión con 6 niveles (Alux → Ajaw).

**Power-Up:** Ítem consumible que otorga ventaja en ejercicios.

**Logro:** Insignia desbloqueada al cumplir objetivo específico.

**Misión:** Objetivo temporal que otorga recompensas al completarse.

**Leaderboard:** Tabla de clasificación de estudiantes por XP.

**Racha:** Días consecutivos ingresando a la plataforma.

**Literacidad Múltiple:** Marco de 5 dimensiones de lectura/escritura (Cassany).

**Módulo:** Conjunto de ejercicios enfocados en una dimensión de literacidad.

**Ejercicio:** Actividad interactiva calificable.

**Mecánica:** Tipo de interacción de un ejercicio (opción múltiple, arrastrar, etc.).

**2FA:** Autenticación de Dos Factores (seguridad adicional).

**Gremio/Guild:** Grupo colaborativo de estudiantes.

---

# 📋 Checklist de Validación Rápida

## Funcionalidades Críticas a Probar

### ✅ Autenticación (6 checks)
- [ ] Registro con email válido funciona
- [ ] Verificación de email recibida y funcional
- [ ] Login con credenciales correctas funciona
- [ ] Recuperación de contraseña funciona
- [ ] 2FA se puede habilitar y funciona
- [ ] Logout cierra sesión correctamente

### ✅ Dashboard (5 checks)
- [ ] Stats grid muestra datos reales
- [ ] Misiones activas se muestran con progreso
- [ ] Módulos disponibles están listados
- [ ] Actividad reciente muestra historial
- [ ] Progreso de rango se calcula correctamente

### ✅ Ejercicios - Todos los Módulos (30+ checks)
- [ ] Módulo 1: 7 mecánicas funcionan
- [ ] Módulo 2: 6 mecánicas funcionan
- [ ] Módulo 3: 5 mecánicas funcionan
- [ ] Módulo 4: 9 mecánicas funcionan
- [ ] Módulo 5: 3 mecánicas funcionan

### ✅ Gamificación (6 checks)
- [ ] Logros se desbloquean automáticamente
- [ ] Leaderboard muestra ranking correcto
- [ ] Misiones se actualizan y resetean correctamente
- [ ] Sistema de rangos calcula XP correctamente
- [ ] ML Coins se ganan y gastan correctamente
- [ ] Power-ups funcionan en ejercicios

### ✅ Tienda e Inventario (3 checks)
- [ ] Compra de power-ups funciona
- [ ] Inventario muestra ítems correctos
- [ ] Usar power-up desde inventario funciona

### ✅ Social (4 checks)
- [ ] Sistema de amigos funciona
- [ ] Gremios se pueden crear/unirse
- [ ] Perfiles de usuarios visibles
- [ ] Leaderboard de amigos funciona

### ✅ Perfil y Configuración (3 checks)
- [ ] Editar perfil guarda cambios
- [ ] Configuración de privacidad funciona
- [ ] Notificaciones se reciben correctamente

---

# 🎉 ¡Bienvenido a GAMILIT!

Esperamos que disfrutes aprendiendo sobre Marie Curie mientras desarrollas tus habilidades de literacidad múltiple. ¡Buena suerte en tu viaje de aprendizaje! 🚀

**Recuerda:**
- 📚 Aprende a tu propio ritmo
- 🎯 Completa misiones para maximizar recompensas
- 🏆 Desbloquea todos los logros
- 👥 Conéctate con otros estudiantes
- 🛡️ Únete a un gremio para beneficios extra
- 🌟 ¡Diviértete mientras aprendes!

---

**FIN DEL MANUAL DEL PORTAL DE ESTUDIANTES** ✅

**Última actualización:** 25 de noviembre de 2025
**Versión del Portal:** 1.1.0 (MVP Completo)
**Versión del Manual:** 1.1.0

**Documentos Relacionados:**
- `docs/finiquito/Manual_Portal_Maestros_ACTUALIZADO.md`
- `docs/finiquito/Manual_Portal_Administrador_ACTUALIZADO.md`
