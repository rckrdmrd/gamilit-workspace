# Manual del Usuario - Portal de Estudiantes GAMILIT
**Versión:** 1.0.0
**Fecha:** 24 de noviembre de 2025
**Audiencia:** Estudiantes
**Estado del Portal:** 95% Funcional (MVP)

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

### ✅ Disponible Ahora (MVP)

**Aprendizaje:**
- ✅ Acceder a **12 ejercicios interactivos** (Módulos 1 y 2)
- ✅ Completar ejercicios con **23 mecánicas diferentes**
- ✅ Recibir **calificaciones automáticas** y retroalimentación
- ✅ Seguir tu progreso en tiempo real

**Gamificación:**
- ✅ Ganar **ML Coins** por completar ejercicios
- ✅ Desbloquear **50+ logros/insignias**
- ✅ Subir en el **ranking de estudiantes**
- ✅ Completar **misiones diarias y semanales**
- ✅ Avanzar por los **6 rangos del sistema Maya**

**Economía:**
- ✅ Comprar **power-ups** en la tienda
- ✅ Gestionar tu inventario de ítems
- ✅ Usar potenciadores en ejercicios

**Social:**
- ✅ Ver perfiles de otros estudiantes
- ✅ Competir en tablas de clasificación

### ⏳ Próximamente (Fase 3 - Post-MVP)

- ⏳ Módulos 3, 4 y 5 con 11 ejercicios adicionales
- ⏳ Sistema de amigos y mensajería
- ⏳ Gremios/guilds colaborativos
- ⏳ Ítems cosméticos para personalización
- ⏳ Notificaciones en tiempo real (WebSocket)

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

**Screenshots:** (Futuro)

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
- ⚠️ **Nota:** El rango siguiente está hardcoded (GAP-005 - se corregirá en Fase 3)

---

### 2.2.2 Navegación Principal

**Menú de Navegación:**

| Sección | Ruta | Descripción |
|---------|------|-------------|
| 🏠 **Dashboard** | `/student/dashboard` | Resumen general |
| 📚 **Ejercicios** | `/student/exercises` | Catálogo de ejercicios |
| 🏆 **Logros** | `/student/achievements` | Insignias y logros |
| 📊 **Clasificación** | `/student/leaderboard` | Tabla de ranking |
| 🎯 **Misiones** | `/student/missions` | Misiones activas y completadas |
| 🪙 **Rango** | `/student/rank` | Sistema de rangos Maya |
| 🛒 **Tienda** | `/student/shop` | Comprar power-ups |
| 🎒 **Inventario** | `/student/inventory` | Tus ítems |
| 👥 **Amigos** | `/student/friends` | Red social (construcción) |
| 🛡️ **Gremios** | `/student/guilds` | Grupos colaborativos (construcción) |
| ⚙️ **Configuración** | `/student/settings` | Ajustes personales |
| 👤 **Perfil** | `/student/profile` | Tu perfil público |

---

# Capítulo 3: Ejercicios y Módulos de Aprendizaje

## 3.1 Catálogo de Ejercicios

### 3.1.1 Vista General de Ejercicios

**Ruta:** `/student/exercises`

**¿Qué verás?**

- Lista de todos los ejercicios disponibles
- Filtros por módulo (1, 2, 3, 4, 5)
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

**Estado:** ✅ **100% Implementado** (7 ejercicios)

#### Ejercicio 1.1: Biografía de Marie Curie

**Ruta:** `/student/exercises/1-1`
**Tipo:** Lectura con comprensión
**Puntos:** 100
**Tiempo estimado:** 15 minutos

**Descripción:**
Lee la biografía completa de Marie Curie y responde preguntas de comprensión literal sobre fechas, lugares y eventos clave de su vida.

**Mecánica:**
- Lectura de texto largo (biografía)
- 5-7 preguntas de opción múltiple
- Calificación automática
- Retroalimentación inmediata

**Objetivos de Aprendizaje:**
- Identificar información explícita en el texto
- Comprender cronología de eventos
- Recordar datos específicos

**Recompensas:**
- 🪙 **100 ML Coins** (si obtienes 80% o más)
- 🎯 **100 XP** para tu rango
- 🏅 Progreso hacia logro "Lector Curioso"

---

#### Ejercicio 1.2: Cronología de Eventos

**Ruta:** `/student/exercises/1-2`
**Tipo:** Ordenar línea de tiempo
**Puntos:** 100
**Tiempo estimado:** 10 minutos

**Descripción:**
Ordena 8-10 eventos importantes de la vida de Marie Curie en orden cronológico correcto.

**Mecánica:**
- Arrastrar y soltar eventos en línea de tiempo
- Validación automática de secuencia
- Pistas disponibles (cuestan 10 coins)

**Objetivos de Aprendizaje:**
- Comprender secuencia temporal
- Relacionar causa y efecto
- Ubicar eventos en contexto histórico

**Recompensas:**
- 🪙 **100 ML Coins**
- 🎯 **100 XP**
- 🏅 Logro "Maestro del Tiempo" (si completas sin errores)

---

#### Ejercicio 1.3: Verdadero o Falso

**Ruta:** `/student/exercises/1-3`
**Tipo:** Validación de afirmaciones
**Puntos:** 100
**Tiempo estimado:** 8 minutos

**Descripción:**
Determina si 10 afirmaciones sobre Marie Curie son verdaderas o falsas basándote en la biografía leída.

**Mecánica:**
- 10 afirmaciones
- Botones "Verdadero" / "Falso"
- Timer opcional para desafío adicional
- Explicación de cada respuesta

**Objetivos de Aprendizaje:**
- Verificar información contra fuente original
- Identificar detalles precisos
- Detectar información errónea

**Recompensas:**
- 🪙 **100 ML Coins**
- 🎯 **100 XP**
- 🏅 Logro "Detective de Hechos"

---

#### Ejercicio 1.4: Comprensión de Conceptos

**Ruta:** `/student/exercises/1-4`
**Tipo:** Preguntas de opción múltiple
**Puntos:** 100
**Tiempo estimado:** 12 minutos

**Descripción:**
Responde preguntas sobre conceptos científicos mencionados en la biografía de Marie Curie (radiactividad, elementos químicos, etc.).

**Mecánica:**
- 8 preguntas de opción múltiple
- 4 opciones por pregunta
- Retroalimentación educativa
- Glosario de términos disponible

**Objetivos de Aprendizaje:**
- Comprender vocabulario técnico
- Asociar términos con definiciones
- Contextualizar conceptos científicos

**Recompensas:**
- 🪙 **100 ML Coins**
- 🎯 **100 XP**
- 🏅 Progreso hacia "Científico Junior"

---

#### Ejercicio 1.5: Identificar Personajes

**Ruta:** `/student/exercises/1-5`
**Tipo:** Emparejamiento
**Puntos:** 100
**Tiempo estimado:** 10 minutos

**Descripción:**
Empareja personajes importantes en la vida de Marie Curie con sus roles o relaciones (Pierre Curie, Irène Curie, etc.).

**Mecánica:**
- 6-8 pares de personajes y descripciones
- Arrastrar y soltar para emparejar
- Validación al completar todos los pares
- Opción de reintentar con penalización leve

**Objetivos de Aprendizaje:**
- Identificar relaciones entre personajes
- Comprender roles sociales y familiares
- Contextualizar biografía en red social

**Recompensas:**
- 🪙 **100 ML Coins**
- 🎯 **100 XP**
- 🏅 Logro "Sociólogo Experto"

---

#### Ejercicio 1.6: Completar Oraciones

**Ruta:** `/student/exercises/1-6`
**Tipo:** Llenar espacios en blanco
**Puntos:** 100
**Tiempo estimado:** 12 minutos

**Descripción:**
Completa 10 oraciones sobre Marie Curie llenando los espacios en blanco con palabras clave de un banco de palabras.

**Mecánica:**
- 10 oraciones incompletas
- Banco de 15 palabras (5 distractores)
- Arrastrar palabras a los espacios
- Validación de sintaxis y semántica

**Objetivos de Aprendizaje:**
- Recordar información específica
- Aplicar vocabulario en contexto
- Comprender estructura de oraciones

**Recompensas:**
- 🪙 **100 ML Coins**
- 🎯 **100 XP**
- 🏅 Progreso hacia "Maestro Gramático"

---

#### Ejercicio 1.7: Resumen Visual

**Ruta:** `/student/exercises/1-7`
**Tipo:** Selección de imágenes
**Puntos:** 100
**Tiempo estimado:** 15 minutos

**Descripción:**
Selecciona imágenes que representen correctamente los logros y momentos clave de la vida de Marie Curie.

**Mecánica:**
- 12 imágenes mostradas
- 8 son correctas, 4 son distractores
- Click para seleccionar/deseleccionar
- Validación al enviar

**Objetivos de Aprendizaje:**
- Asociar información textual con representaciones visuales
- Identificar símbolos y metáforas visuales
- Desarrollar literacidad visual

**Recompensas:**
- 🪙 **100 ML Coins**
- 🎯 **100 XP**
- 🏅 Logro "Ojo de Águila"

---

### 3.1.3 Módulo 2: Literacidad Inferencial

**Estado:** ✅ **100% Implementado** (5 ejercicios)

#### Ejercicio 2.1: Inferir Motivaciones

**Ruta:** `/student/exercises/2-1`
**Tipo:** Análisis de motivaciones
**Puntos:** 150
**Tiempo estimado:** 20 minutos

**Descripción:**
Lee pasajes de la vida de Marie Curie e infiere sus motivaciones, emociones y razones detrás de decisiones importantes.

**Mecánica:**
- 5 escenarios narrativos
- 3-4 opciones de inferencia por escenario
- Justificación opcional para puntos extra
- Sistema de "confianza" (qué tan seguro estás)

**Objetivos de Aprendizaje:**
- Leer entre líneas
- Inferir estados emocionales
- Comprender motivaciones humanas

**Recompensas:**
- 🪙 **150 ML Coins**
- 🎯 **150 XP**
- 🏅 Logro "Psicólogo Empático"

---

#### Ejercicio 2.2: Predecir Consecuencias

**Ruta:** `/student/exercises/2-2`
**Tipo:** Predicción causal
**Puntos:** 150
**Tiempo estimado:** 18 minutos

**Descripción:**
Dado un evento en la vida de Marie Curie, predice las consecuencias que este evento tuvo en su vida o en la ciencia.

**Mecánica:**
- 6 eventos históricos presentados
- Selección múltiple de consecuencias
- Diagrama de causa-efecto interactivo
- Explicación de cadenas causales

**Objetivos de Aprendizaje:**
- Comprender relaciones causales
- Predecir consecuencias lógicas
- Pensar en sistemas complejos

**Recompensas:**
- 🪙 **150 ML Coins**
- 🎯 **150 XP**
- 🏅 Logro "Visionario del Futuro"

---

#### Ejercicio 2.3: Interpretar Metáforas

**Ruta:** `/student/exercises/2-3`
**Tipo:** Análisis figurativo
**Puntos:** 150
**Tiempo estimado:** 15 minutos

**Descripción:**
Interpreta metáforas y lenguaje figurativo usado en textos sobre Marie Curie y la ciencia.

**Mecánica:**
- 8 metáforas presentadas en contexto
- Selección de interpretación correcta
- Explicación del simbolismo
- Glosario de figuras retóricas

**Objetivos de Aprendizaje:**
- Comprender lenguaje figurativo
- Identificar metáforas y símiles
- Interpretar significados no literales

**Recompensas:**
- 🪙 **150 ML Coins**
- 🎯 **150 XP**
- 🏅 Logro "Poeta Analítico"

---

#### Ejercicio 2.4: Rueda de Inferencias

**Ruta:** `/student/exercises/2-4`
**Tipo:** Inferencia por niveles (Rueda de Daniels)
**Puntos:** 150
**Tiempo estimado:** 25 minutos

**Descripción:**
⭐ **Ejercicio Especial** - Usa la Rueda de Inferencias de Daniels para analizar un texto sobre Marie Curie, progresando desde observaciones literales hasta conclusiones inferenciales.

**Mecánica:**
- Rueda interactiva con 4 niveles:
  1. **Observación Literal** - ¿Qué dice el texto?
  2. **Interpretación** - ¿Qué significa?
  3. **Evaluación** - ¿Qué opino?
  4. **Conexión** - ¿Cómo se relaciona conmigo?
- Rueda gira al avanzar niveles
- Validación por nivel
- Retroalimentación pedagógica

**Objetivos de Aprendizaje:**
- Aplicar estrategia de lectura profunda
- Progresión desde literal a crítico
- Desarrollar pensamiento metacognitivo

**Recompensas:**
- 🪙 **200 ML Coins** (bonificado)
- 🎯 **200 XP**
- 🏅 Logro "Maestro de Inferencias" (exclusivo)

**Nota Técnica:** Este ejercicio ha tenido bugs recientes corregidos en:
- `apps/frontend/src/features/mechanics/module2/RuedaInferencias/`
- Ver: orchestration/agentes/architecture-analyst/rueda-inferencias-bugs-2025-11-23/

---

#### Ejercicio 2.5: Comparar Perspectivas

**Ruta:** `/student/exercises/2-5`
**Tipo:** Análisis multiperspectiva
**Puntos:** 150
**Tiempo estimado:** 22 minutos

**Descripción:**
Compara cómo diferentes personas (familia, colegas, sociedad) podrían haber percibido las acciones de Marie Curie.

**Mecánica:**
- 4 perspectivas diferentes por escenario
- Matriz de comparación interactiva
- Identificar puntos de vista contrastantes
- Justificar diferencias de percepción

**Objetivos de Aprendizaje:**
- Comprender multiperspectividad
- Desarrollar empatía cognitiva
- Reconocer sesgos y contextos

**Recompensas:**
- 🪙 **150 ML Coins**
- 🎯 **150 XP**
- 🏅 Logro "Diplomático Cultural"

---

### 3.1.4 Módulos 3, 4 y 5

**Estado:** ⏳ **En Construcción** (GAP-008 - Fase 3 - Post-MVP)

#### Módulo 3: Literacidad Crítica

**Fecha Estimada:** 1-2 meses post-MVP
**Ejercicios Planeados:** 4 ejercicios (200 pts c/u)

**Temas:**
- Evaluar credibilidad de fuentes
- Identificar sesgos en textos históricos
- Cuestionar narrativas dominantes
- Analizar contextos socio-políticos

**Ejercicios:**
1. 🔍 **Evaluar Fuentes** - Credibilidad de documentos históricos
2. 🎭 **Identificar Sesgos** - Sesgos de género en ciencia
3. 🗣️ **Analizar Discursos** - Retórica en textos científicos
4. 🎙️ **Podcast Crítico** - Crear análisis crítico de biografía

---

#### Módulo 4: Literacidad Digital

**Fecha Estimada:** 2-3 meses post-MVP
**Ejercicios Planeados:** 4 ejercicios (200 pts c/u)

**Temas:**
- Validar información en internet
- Identificar fake news sobre ciencia
- Uso ético de recursos digitales
- Ciudadanía digital responsable

**Ejercicios:**
1. 🌐 **Fact-Check Digital** - Verificar claims científicos online
2. 🎯 **Detectar Desinformación** - Identificar fake news
3. 📱 **Navegación Segura** - Privacidad y seguridad digital
4. 💻 **Ciudadanía Digital** - Participación ética en línea

---

#### Módulo 5: Producción Textual

**Fecha Estimada:** 3-4 meses post-MVP
**Ejercicios Planeados:** 3 ejercicios (200 pts c/u)

**Temas:**
- Redacción de textos argumentativos
- Creación de contenido multimedia
- Escritura académica
- Comunicación científica efectiva

**Ejercicios:**
1. ✍️ **Ensayo Argumentativo** - Sobre legado de Marie Curie
2. 🎨 **Infografía Científica** - Visualización de descubrimientos
3. 📹 **Video Explicativo** - Comunicar conceptos científicos

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

**Calificación Manual (Futuro):**
- ⏳ Ejercicios de texto abierto (Módulo 5) serán calificados por maestros
- ⏳ Recibirás notificación cuando tu maestro califique

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

**3. Feedback del Sistema:**
- Identificación de patrones de error
- Recomendaciones personalizadas
- Ejercicios sugeridos para practicar

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

1. **Aprendizaje** (15 logros)
   - Completar ejercicios
   - Obtener calificaciones perfectas
   - Completar módulos

2. **Gamificación** (12 logros)
   - Subir de rango
   - Acumular coins
   - Ganar XP

3. **Social** (10 logros)
   - Agregar amigos
   - Unirse a gremios
   - Competir en torneos

4. **Especiales** (8 logros)
   - Logros únicos por eventos
   - Logros secretos
   - Logros de temporada

5. **Racha** (5 logros)
   - Días consecutivos activo
   - Ejercicios consecutivos
   - Misiones completadas en racha

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

### 4.2.1 Leaderboard Global

**Ruta:** `/student/leaderboard`

**¿Qué es el Leaderboard?**

Tabla de clasificación que muestra el ranking de todos los estudiantes basado en puntos de experiencia (XP) totales.

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

**Filtros Disponibles:**
- **Por Classroom** - Solo tu clase
- **Por Institution** - Solo tu escuela
- **Global** - Todos los estudiantes
- **Por Semana** - Ranking semanal
- **Por Mes** - Ranking mensual
- **Todo el Tiempo** - Ranking histórico

---

### 4.2.2 Actualización en Tiempo Real

**Estado Actual (MVP):** ✅ Actualización por polling cada 30 segundos

**Futuro (GAP-004 - Fase 3):** ⏳ WebSocket para actualizaciones instantáneas

**Cómo Funciona Ahora:**
- El leaderboard se actualiza automáticamente cada 30 segundos
- Si subes de posición, verás la animación de tu avatar
- Notificación si entras al Top 10

**Cómo Funcionará (WebSocket):**
- Actualizaciones en tiempo real sin delay
- Notificaciones push cuando alguien te supera
- Celebraciones en vivo cuando llegas al Top 3

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
│ 📚 Completa 2 ejercicios hoy                    │
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

**Ruta:** `/student/rank`

**¿Qué es el Sistema de Rangos Maya?**

Sistema de progresión inspirado en la jerarquía de la civilización maya. Subes de rango acumulando **puntos de experiencia (XP)**.

**Los 6 Rangos Maya:**

| Rango | Nombre | XP Mínimo | XP Máximo | Beneficios |
|-------|--------|-----------|-----------|------------|
| 1️⃣ | **Alux** | 0 | 499 | Principiante |
| 2️⃣ | **Ajkun** | 500 | 1,499 | +5% XP bonus |
| 3️⃣ | **Balam** | 1,500 | 3,499 | +10% XP bonus, 1 power-up gratis/semana |
| 4️⃣ | **Chaak** | 3,500 | 6,999 | +15% XP bonus, 2 power-ups gratis/semana |
| 5️⃣ | **Kukulkan** | 7,000 | 11,999 | +20% XP bonus, 3 power-ups gratis/semana, avatar exclusivo |
| 6️⃣ | **Ajaw** | 12,000 | ∞ | +25% XP bonus, 5 power-ups gratis/semana, título especial |

---

### 4.4.2 Subir de Rango

**¿Cómo ganar XP?**

| Acción | XP Ganado |
|--------|-----------|
| Completar ejercicio | 100-200 XP (según módulo) |
| Calificación perfecta (100%) | +50 XP bonus |
| Completar misión diaria | 25-50 XP |
| Completar misión semanal | 100-250 XP |
| Desbloquear logro | 25-500 XP (según rareza) |
| Mantener racha diaria | 10-50 XP/día |
| Ayudar a un compañero | 20 XP |

**Progreso de Rango:**

Tu página de rango (`/student/rank`) muestra:
- 🎯 **Rango actual** con insignia
- 📊 **XP actual** vs XP requerido para siguiente rango
- 📈 **Barra de progreso** visual
- 🏆 **Beneficios** del rango actual
- 🎁 **Beneficios** del próximo rango
- 📅 **Fecha estimada** para alcanzar siguiente rango (basado en actividad)
- 📊 **Comparación** con promedio de clase

**Nota Técnica:** ⚠️ Actualmente el "próximo rango" está hardcoded en el dashboard (GAP-005). Se corregirá en Fase 3 para ser dinámico.

---

### 4.4.3 Beneficios por Rango

**Beneficios Acumulativos:**

Cada rango mantiene los beneficios de rangos anteriores y añade nuevos:

**Rango 1 - Alux (Principiante):**
- Acceso completo a Módulos 1 y 2
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
- Mentor de nuevos estudiantes

---

## 4.5 Economía (ML Coins)

### 4.5.1 Sistema de Monedas

**¿Qué son los ML Coins? 🪙**

Moneda virtual de GAMILIT (ML = Marie Curie's Legacy). Las usas para comprar power-ups, ítems cosméticos y desbloquear contenido.

**Cómo Ganar ML Coins:**

| Acción | Coins Ganados |
|--------|---------------|
| Completar ejercicio (80%+) | 80-200 coins (según puntuación y módulo) |
| Calificación perfecta | +50 coins bonus |
| Completar misión diaria | 50-100 coins |
| Completar misión semanal | 200-500 coins |
| Desbloquear logro | 50-2000 coins (según rareza) |
| Subir de rango | 500-2000 coins |
| Racha de 7 días | 300 coins |
| Ayudar a compañero | 50 coins |
| Participar en evento | 100-1000 coins |

**Cómo Gastar ML Coins:**
- 🛒 Comprar power-ups en la tienda
- 🎨 Comprar ítems cosméticos (futuro)
- 💡 Comprar pistas en ejercicios (10 coins c/u)
- 🎁 Enviar regalos a amigos (futuro)
- 🏆 Participar en torneos premium (futuro)

---

### 4.5.2 Ver tu Balance

**Ubicación del Balance:**

Tu saldo de ML Coins siempre es visible en:
1. **Header superior derecho** - En todas las páginas
2. **Dashboard** - En stats grid
3. **Perfil** - En sección de estadísticas
4. **Tienda** - Al lado del carrito

**Historial de Transacciones:**

Ve a **Perfil → Economía** para ver:
- 📊 Ingresos totales de coins
- 💰 Gastos totales
- 📈 Gráfica de balance en el tiempo
- 📋 Lista detallada de transacciones:
  ```
  📅 24/11/2025 | +150 🪙 | Ejercicio 2.3 completado
  📅 24/11/2025 | -100 🪙 | Compra: Power-Up Doble XP
  📅 23/11/2025 | +200 🪙 | Misión semanal completada
  ```

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
- **Perfil público** - ON/OFF (si está OFF, solo maestros ven tu perfil)
- **Mostrar en leaderboard** - ON/OFF
- **Permitir mensajes** - ON/OFF (futuro)
- **Mostrar estadísticas** - ON/OFF

**3. Personalización:**
- **Logros destacados** - Selecciona 5 logros para mostrar prominentemente
- **Color de tema** - Elige entre 8 paletas de colores
- **Avatar border** - Desbloquea borders especiales con rangos altos

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
3. Ingresa tu **nueva contraseña** (min 8 caracteres, debe cumplir requisitos)
4. Confirma tu **nueva contraseña**
5. ✅ Contraseña actualizada
6. Todas las sesiones excepto la actual se cierran automáticamente

**Cerrar Cuenta:**
⚠️ Acción permanente - todos tus datos se eliminarán después de 30 días de gracia.

1. Ve a **Configuración → Cuenta → Cerrar Cuenta**
2. Lee las consecuencias cuidadosamente
3. Ingresa tu contraseña para confirmar
4. Ingresa "ELIMINAR MI CUENTA" en el campo de texto
5. Recibirás email de confirmación
6. Tienes 30 días para cambiar de opinión y reactivar

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

**Actividad Reciente:**
- Inicios de sesión (exitosos y fallidos)
- Cambios de contraseña
- Cambios de email
- Cambios de configuración de seguridad

---

### 5.2.4 Configuración de Notificaciones

**Tipos de Notificaciones:**

**1. Notificaciones por Email:**
- ✉️ **Resumen diario** - Resumen de actividad del día
- ✉️ **Misiones completadas** - Cuando completas una misión
- ✉️ **Logros desbloqueados** - Cuando desbloqueas un logro
- ✉️ **Subida de rango** - Cuando subes de rango
- ✉️ **Respuesta de maestro** - Cuando tu maestro responde o califica
- ✉️ **Mensajes de amigos** - Cuando recibes mensaje (futuro)

**2. Notificaciones Push (en navegador):**
- 🔔 **Tiempo real** - Notificaciones instantáneas en navegador
- 🔔 **Misiones a punto de expirar** - 1 hora antes
- 🔔 **Racha en peligro** - Si no has entrado en 20 horas
- 🔔 **Alguien te superó en leaderboard** - Cambios de posición
- 🔔 **Nuevo contenido disponible** - Nuevos ejercicios o módulos

**3. Notificaciones en la App:**
- 🔔 **Badge en header** - Contador de notificaciones no leídas
- 🔔 **Panel de notificaciones** - Click en campana para ver todas
- 🔔 **Histórico** - Últimas 30 días

**Configurar Frecuencia:**
- **Inmediato** - Al ocurrir el evento
- **Diario** - Resumen 1 vez al día (9:00 AM)
- **Semanal** - Resumen 1 vez a la semana (lunes 9:00 AM)
- **Nunca** - Desactivar completamente

---

### 5.2.5 Configuración de Preferencias

**Idioma:**
- 🇲🇽 Español (México) - Por defecto
- 🇪🇸 Español (España)
- 🇺🇸 English (US) - Futuro

**Zona Horaria:**
- Selecciona tu zona horaria para que fechas y horarios se muestren correctamente
- Por defecto: America/Mexico_City

**Formato de Fecha:**
- DD/MM/YYYY (24/11/2025)
- MM/DD/YYYY (11/24/2025)
- YYYY-MM-DD (2025-11-24)

**Sonidos:**
- 🔊 **Efectos de sonido** - ON/OFF
- 🔊 **Música de fondo** - ON/OFF (futuro)
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

**Lector de Pantalla:**
- ✅ Soporte completo para screen readers
- ✅ Atributos ARIA en todos los componentes
- ✅ Navegación por teclado completa

**Navegación por Teclado:**
- Ver atajos de teclado disponibles
- Personalizar atajos (futuro)

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
- ✅ Ejercicio calificado por maestro

**3. Gamificación:**
- 🏆 Logro desbloqueado
- 📈 Subida de rango
- 🎯 Misión completada
- 🥇 Cambio en leaderboard

**4. Sociales:**
- 👥 Nueva solicitud de amistad (futuro)
- 💬 Nuevo mensaje (futuro)
- 🎊 Invitación a gremio (futuro)

**Estados:**
- 🔵 **No leída** - Resaltada en azul
- ⚪ **Leída** - Gris
- 🗑️ **Eliminada** - Ya no visible

**Acciones:**
- Marcar como leída (individualmente)
- Marcar todas como leídas
- Eliminar notificación
- Eliminar todas (más de 30 días)

---

# Capítulo 6: Economía y Tienda

## 6.1 La Tienda

### 6.1.1 Navegar la Tienda

**Ruta:** `/student/shop`

**Estado:** ✅ **100% Funcional** (Power-ups disponibles)
**Futuro:** ⏳ Ítems cosméticos (GAP-007 - Fase 3)

**Categorías Actuales:**

**1. Power-Ups (Disponible):**
- 🧪 Potenciadores para ejercicios
- 💡 Ayudas y pistas
- 🎯 Multiplicadores de recompensas

**2. Cosméticos (Futuro - GAP-007):**
- 🎨 Avatares exclusivos
- 🖼️ Borders para avatar
- 🎭 Emotes y reacciones
- 🏆 Títulos personalizados

**3. Ventajas Temporales (Futuro):**
- 🔥 Boosts de XP por 24h
- 🪙 Boosts de coins por 24h
- ⏰ Tiempo extra en todos los ejercicios

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
4. Haz clic en "Agregar al Carrito"
5. Puedes seguir comprando o ir al carrito
6. En el carrito, revisa tu orden
7. Haz clic en "Comprar Ahora"
8. Confirma la compra
9. ✅ Power-ups añadidos a tu inventario
10. Recibe notificación de compra exitosa

**Descuentos por Rango:**
- **Balam (Rango 3+):** 10% descuento
- **Chaak (Rango 4+):** 20% descuento
- **Kukulkan (Rango 5+):** 30% descuento
- **Ajaw (Rango 6):** 40% descuento

---

### 6.1.3 Ofertas Especiales

**Ofertas Diarias:**
- 1 power-up en descuento 50% cada día (cambia a las 00:00)

**Ofertas Semanales:**
- 1 pack especial con 3-5 ítems variados (cambia cada lunes)

**Ofertas por Evento:**
- Cumpleaños de Marie Curie (7 nov)
- Día Internacional de la Mujer (8 marzo)
- Día del Libro (23 abril)
- Fin de curso

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

**2. Ítems Cosméticos (Futuro):**
- 🎨 Avatares
- 🖼️ Borders
- 🎭 Emotes
- 🏆 Títulos

**3. Especiales:**
- 🎁 Ítems de eventos
- 🌟 Ítems exclusivos
- 🏅 Recompensas de logros

**Información por Ítem:**
- 📦 **Cantidad** en stock
- 📅 **Fecha de adquisición**
- 🔒 **Rareza** (Común, Raro, Épico, Legendario)
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
- ⚠️ Los power-ups se consumen al usarse (excepto los permanentes)
- ⚠️ No puedes usar 2 power-ups del mismo tipo simultáneamente
- ⚠️ Algunos power-ups son temporales (24h, 7 días)

---

### 6.2.3 Gestionar Ítems

**Acciones Disponibles:**

**Equipar (Cosméticos - Futuro):**
- Selecciona ítem cosmético
- Haz clic en "Equipar"
- ✅ Visible en tu perfil y avatar

**Desequipar:**
- Selecciona ítem equipado
- Haz clic en "Desequipar"
- ✅ Vuelve al inventario

**Regalar (Futuro):**
- Selecciona ítem
- Haz clic en "Regalar"
- Elige amigo destinatario
- Confirma regalo
- ✅ Ítem transferido

**Eliminar:**
- Algunos ítems pueden eliminarse (no recomendado)
- Acción irreversible
- No obtienes coins de vuelta

---

## 6.3 Economía Avanzada

### 6.3.1 Estrategias para Ganar Coins

**Maximizar Ingresos:**

**1. Enfócate en Calificaciones Altas:**
- 100% = 200 coins (100 base + 50 bonus + 50 rango)
- 85% = 85 coins (solo base)
- Diferencia: +135% más coins con perfección

**2. Completa Misiones:**
- Misiones diarias: 300-500 coins/semana
- Misiones semanales: 800-2000 coins/mes
- Misiones especiales: 2000-10000 coins/evento

**3. Mantén Racha Activa:**
- Racha de 7 días = 300 coins bonus
- Racha de 30 días = 1500 coins bonus
- Racha de 100 días = 5000 coins bonus

**4. Desbloquea Logros:**
- Logros comunes: 50-200 coins
- Logros raros: 300-500 coins
- Logros épicos: 600-1000 coins
- Logros legendarios: 1500-2000 coins

**5. Sube de Rango:**
- Cada rango da 500-2000 coins como bono
- Además, obtienes descuentos en tienda

---

### 6.3.2 Estrategias de Gasto Inteligente

**Cuándo Comprar Power-Ups:**

**Situaciones Ideales:**
- 🧪 **Tiempo Extra:** Cuando el ejercicio es largo y complejo (Módulo 3+)
- 💡 **Pista Gratis:** Si estás atascado y te quedan pocos intentos
- 🎯 **Doble XP:** Cuando estás cerca de subir de rango
- 🪙 **Doble Coins:** Cuando vas a completar muchos ejercicios seguidos
- 🛡️ **Protección de Racha:** Si tienes racha larga y no podrás entrar mañana

**Evitar Compras:**
- ❌ No compres power-ups "por si acaso" - úsalos inmediatamente
- ❌ No gastes todos tus coins - mantén mínimo 200 de reserva
- ❌ No compres pistas si puedes reintentar el ejercicio gratis

---

### 6.3.3 Packs vs Ítems Individuales

**¿Cuándo Comprar Packs?**

**Pack de Inicio (120 coins):**
- 3 power-ups básicos (valor: 180 coins)
- **Ahorro: 33%**
- Ideal para: Principiantes (Rango 1-2)

**Pack Premium (400 coins):**
- 5 power-ups variados (valor: 600 coins)
- **Ahorro: 33%**
- Ideal para: Estudiantes avanzados (Rango 3+)

**Ítems Individuales:**
- Mejor si solo necesitas 1-2 power-ups específicos
- Mayor flexibilidad

---

# Capítulo 7: Características Sociales

## 7.1 Amigos

### 7.1.1 Sistema de Amigos

**Ruta:** `/student/friends`

**Estado:** ⏸️ **Estructura Básica** (GAP-006 - Fase 3)

**Funcionalidades Planeadas:**

**Agregar Amigos:**
- Buscar por nombre de usuario
- Enviar solicitud de amistad
- Aceptar/rechazar solicitudes
- Límite de 100 amigos

**Interacciones (Futuro):**
- 💬 Enviar mensajes directos
- 🎁 Regalar ítems
- 🏆 Desafiar a duelos
- 👀 Ver perfiles y progreso
- 📊 Comparar estadísticas

**Lista de Amigos:**
- Ver amigos online/offline
- Ordenar por última actividad
- Filtrar por rango o progreso
- Favoritos (hasta 10)

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
- 🏫 Institución específica (solo país)
- 💰 Balance de coins exacto
- 📝 Calificaciones específicas

**Acciones Disponibles:**
- ➕ Agregar como amigo
- 💬 Enviar mensaje (futuro)
- 🏆 Desafiar a duelo (futuro)
- 🚫 Reportar perfil (si es inapropiado)

---

## 7.2 Gremios

### 7.2.1 Sistema de Gremios

**Ruta:** `/student/guilds`

**Estado:** ⏸️ **Estructura Básica** (GAP-011 - Fase 3)

**¿Qué son los Gremios?**

Grupos de 5-20 estudiantes que colaboran para completar desafíos grupales, ganar recompensas colectivas y competir contra otros gremios.

**Funcionalidades Planeadas:**

**Crear Gremio:**
- Nombre único (3-20 caracteres)
- Descripción (200 caracteres)
- Escudo personalizado (8 opciones)
- Público o Privado (con invitación)
- Requisito mínimo de rango (opcional)

**Unirse a Gremio:**
- Buscar gremios públicos
- Filtrar por tamaño, nivel, actividad
- Solicitar unirse (si es privado)
- Aceptar invitación (si te invitaron)

**Roles en Gremio:**
- 👑 **Líder** (1) - Administra el gremio
- ⚔️ **Oficial** (2-3) - Ayuda a gestionar
- 🛡️ **Miembro** - Participante activo
- 🌱 **Novato** - Recién unido (primeros 7 días)

**Actividades de Gremio:**
- 🏆 **Desafíos Grupales** - 5-10 miembros completan objetivos
- 🥇 **Guerra de Gremios** - Competencia semanal contra otros gremios
- 📊 **Ranking de Gremios** - Tabla de clasificación global
- 💰 **Tesoro de Gremio** - Pool de coins compartido
- 🏅 **Logros de Gremio** - Logros exclusivos grupales

---

### 7.2.2 Beneficios de Gremios

**Recompensas Grupales:**
- 🪙 **+10% Coins** para todos los miembros
- 🎯 **+10% XP** para todos los miembros
- 🎁 **Power-ups gratis** semanales
- 🏆 **Logros exclusivos** de gremio
- 🌟 **Título de gremio** junto a tu nombre

**Ranking de Gremios:**
- Basado en XP total de todos los miembros
- Top 10 gremios cada semana reciben:
  - #1: 5000 coins + ítem legendario
  - #2-3: 3000 coins + ítem épico
  - #4-10: 1500 coins + ítem raro

---

## 7.3 Características Sociales Futuras

**Planeado para Fase 3-4:**

**Chat Global (Moderado):**
- Canal general de estudiantes
- Canales por institución
- Canales por gremio
- Filtros de lenguaje inapropiado

**Duelos 1v1:**
- Desafía a un amigo a ejercicio específico
- Compiten simultáneamente
- Ganador recibe bonus de coins

**Torneos:**
- Eventos mensuales de toda la plataforma
- Eliminación simple o todos vs todos
- Premios especiales para ganadores

**Sistema de Mentores:**
- Estudiantes avanzados (Rango 5-6) pueden ser mentores
- Ayudan a nuevos estudiantes
- Ganan recompensas por cada estudiante que ayudan

---

# Capítulo 8: Preguntas Frecuentes

## 8.1 Cuenta y Acceso

**P: ¿Olvidé mi contraseña, qué hago?**
R: Ve a `/auth/forgot-password`, ingresa tu email, y sigue las instrucciones del correo de recuperación.

**P: ¿Puedo cambiar mi email?**
R: Sí, ve a **Configuración → Cuenta → Cambiar Email**. Necesitarás verificar el nuevo email.

**P: ¿Cómo activo 2FA?**
R: Ve a **Configuración → Seguridad → Autenticación de Dos Factores** y sigue los pasos. Ver sección 2.1.5.

**P: ¿Puedo tener múltiples cuentas?**
R: No, está contra los términos de servicio. Una cuenta por estudiante.

**P: ¿Cómo cierro mi cuenta?**
R: Ve a **Configuración → Cuenta → Cerrar Cuenta**. Tienes 30 días de gracia para cambiar de opinión.

---

## 8.2 Ejercicios y Aprendizaje

**P: ¿Puedo reintentar un ejercicio?**
R: Sí, puedes reintentar ejercicios para mejorar tu calificación. Solo se guarda la calificación más alta. Cada reintento reduce puntos disponibles en 10%.

**P: ¿Cuántos ejercicios hay disponibles?**
R: Actualmente **12 ejercicios** (7 en Módulo 1, 5 en Módulo 2). Los Módulos 3-5 con 11 ejercicios adicionales llegarán en Fase 3 (1-4 meses post-MVP).

**P: ¿Los ejercicios tienen límite de tiempo?**
R: Algunos ejercicios tienen timer opcional para desafío adicional, pero la mayoría no tiene límite estricto.

**P: ¿Qué pasa si no termino un ejercicio?**
R: Tu progreso se guarda automáticamente. Puedes continuar desde donde lo dejaste.

**P: ¿Cómo funcionan las pistas?**
R: Las pistas cuestan 10 ML Coins cada una. Al usarlas, recibes información adicional para resolver el ejercicio.

**P: ¿Quién califica mis ejercicios?**
R: Los ejercicios de los Módulos 1 y 2 se califican automáticamente. Los ejercicios de texto abierto (Módulo 5, futuro) serán calificados por maestros.

---

## 8.3 Gamificación

**P: ¿Cómo subo de rango?**
R: Acumula puntos de experiencia (XP) completando ejercicios, misiones y logrando objetivos. Ver tabla de rangos en sección 4.4.1.

**P: ¿Puedo bajar de rango?**
R: No, los rangos son permanentes. Una vez alcanzado un rango, no puedes bajar.

**P: ¿Cómo desbloqueo logros?**
R: Los logros se desbloquean automáticamente al cumplir sus requisitos. Ve a `/student/achievements` para ver todos los disponibles.

**P: ¿Qué son los logros secretos?**
R: Logros ocultos que no se muestran hasta desbloquearlos. Tienen mayores recompensas y requieren acciones específicas.

**P: ¿Cómo funciona el leaderboard?**
R: El leaderboard muestra el ranking de estudiantes por XP total. Se actualiza cada 30 segundos. Puedes filtrar por aula, institución o global.

**P: ¿Las misiones se resetean?**
R: Misiones diarias se resetean cada 24h. Misiones semanales se resetean cada lunes. Misiones especiales son eventos únicos.

---

## 8.4 Economía

**P: ¿Puedo comprar ML Coins con dinero real?**
R: No, ML Coins solo se ganan jugando. No hay microtransacciones ni compras con dinero real.

**P: ¿Los coins expiran?**
R: No, tus ML Coins no expiran nunca.

**P: ¿Puedo transferir coins a otro estudiante?**
R: Actualmente no. En Fase 3, podrás regalar ítems (no coins directamente) a amigos.

**P: ¿Qué hago si perdí coins por un bug?**
R: Contacta a tu maestro o administrador con evidencia (screenshot) y te reembolsarán.

**P: ¿Los descuentos de rango se acumulan?**
R: No, solo aplica el descuento de tu rango actual (10-40% según rango).

---

## 8.5 Tienda e Inventario

**P: ¿Los power-ups expiran?**
R: Los power-ups permanentes no expiran. Los power-ups temporales (24h, 7 días) sí expiran después de activarse.

**P: ¿Puedo devolver un power-up?**
R: No, todas las compras son finales. Asegúrate de querer el ítem antes de comprar.

**P: ¿Cuántos power-ups puedo tener?**
R: No hay límite en tu inventario. Puedes acumular todos los que quieras.

**P: ¿Puedo usar múltiples power-ups a la vez?**
R: Sí, pero no 2 del mismo tipo. Por ejemplo, puedes usar Doble XP + Tiempo Extra simultáneamente, pero no 2 Doble XP.

**P: ¿Cuándo llegarán los ítems cosméticos?**
R: Los ítems cosméticos (avatares, borders, emotes) llegarán en Fase 3, aproximadamente 2-3 meses post-MVP (GAP-007).

---

## 8.6 Social y Privacidad

**P: ¿Cómo oculto mi perfil?**
R: Ve a **Configuración → Privacidad → Perfil Público** y desactívalo. Solo maestros podrán ver tu perfil.

**P: ¿Puedo ocultar mi posición en el leaderboard?**
R: Sí, ve a **Configuración → Privacidad → Mostrar en Leaderboard** y desactívalo.

**P: ¿Cómo reporto un perfil inapropiado?**
R: Ve al perfil del usuario, haz clic en "..." (menú), y selecciona "Reportar Perfil". Un moderador lo revisará.

**P: ¿Cuándo llegarán las funciones de amigos y mensajería?**
R: El sistema de amigos completo y mensajería llegarán en Fase 3, aproximadamente 2-4 meses post-MVP.

**P: ¿Puedo bloquear a otro estudiante?**
R: Actualmente no, pero en Fase 3 podrás bloquear usuarios para que no vean tu perfil ni te contacten.

---

## 8.7 Problemas Técnicos

**P: La página no carga, ¿qué hago?**
R:
1. Refresca la página (Ctrl+R o Cmd+R)
2. Limpia caché del navegador
3. Intenta en navegador diferente
4. Verifica tu conexión a internet
5. Si persiste, contacta soporte técnico

**P: No recibí el email de verificación**
R:
1. Revisa la carpeta de spam
2. Espera 1-2 minutos (puede demorar)
3. Ve a `/auth/verify-email` y solicita reenvío
4. Si no llega, contacta a tu maestro

**P: Mi progreso no se guardó**
R: El progreso se guarda automáticamente cada 30 segundos. Si perdiste progreso, puede ser por:
- Cierre inesperado del navegador
- Pérdida de conexión a internet
- Bug (reporta a soporte técnico)

**P: ¿En qué navegadores funciona GAMILIT?**
R: GAMILIT funciona en:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ Internet Explorer no es soportado

**P: ¿Funciona en móvil/tablet?**
R: Sí, GAMILIT es completamente responsive y funciona en dispositivos móviles y tablets. Algunos ejercicios complejos pueden ser más fáciles en desktop.

---

## 8.8 Contacto y Soporte

**P: ¿Cómo contacto a mi maestro?**
R: Tu maestro puede verte en su portal. Contacta por los canales que tu maestro te haya indicado (email, plataforma de escuela, etc.).

**P: ¿Cómo reporto un bug?**
R: Contacta a tu maestro con:
- Descripción del problema
- Screenshot (si aplica)
- Navegador y sistema operativo
- Pasos para reproducir el bug

**P: ¿Hay soporte técnico?**
R: El soporte técnico está disponible a través de tu institución educativa. Contacta a tu maestro o administrador.

**P: ¿Dónde puedo dar feedback sobre la plataforma?**
R: Tu feedback es valioso. Contacta a tu maestro o usa el formulario de feedback en **Configuración → Ayuda → Enviar Feedback**.

---

## 8.9 Sobre GAMILIT

**P: ¿Qué significa GAMILIT?**
R: GAMILIT significa "Gamification for Multiliteracy" - Gamificación para Literacidad Múltiple.

**P: ¿Por qué Marie Curie?**
R: Marie Curie es un modelo inspirador de perseverancia, ciencia y superación de barreras. Su biografía ofrece contenido rico para desarrollar literacidad múltiple.

**P: ¿Quién creó GAMILIT?**
R: GAMILIT fue desarrollado como proyecto educativo enfocado en literacidad múltiple según el marco de Daniel Cassany.

**P: ¿GAMILIT cuesta dinero?**
R: Eso depende de tu institución educativa. No hay compras dentro de la aplicación con dinero real.

**P: ¿Hay certificados al completar módulos?**
R: Actualmente no, pero está planeado para Fase 4 (4-6 meses post-MVP).

---

## 8.10 Roadmap y Futuro

**P: ¿Cuándo llegarán los Módulos 3, 4 y 5?**
R:
- Módulo 3: 1-2 meses post-MVP
- Módulo 4: 2-3 meses post-MVP
- Módulo 5: 3-4 meses post-MVP

**P: ¿Qué nuevas funciones vienen pronto?**
R: Ver roadmap completo en **Capítulo 1.2** o `orchestration/reportes/RESUMEN-EJECUTIVO-PORTALES-2025-11-24.md`.

**Próximas Funciones (Fase 3):**
- ⏳ Módulos 3-5 con 11 ejercicios
- ⏳ Sistema de amigos y mensajería
- ⏳ Gremios colaborativos
- ⏳ Ítems cosméticos
- ⏳ WebSocket para notificaciones en tiempo real
- ⏳ Duelos 1v1
- ⏳ Torneos mensuales

**P: ¿Habrá más personajes históricos además de Marie Curie?**
R: Posiblemente en Fase 4-5. Se está considerando expandir a otros científicos e inventores.

**P: ¿GAMILIT tendrá app móvil nativa?**
R: Está en evaluación para 2026. Por ahora, la versión web funciona perfectamente en móviles.

---

## 8.11 Glosario de Términos

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

**GAP:** Funcionalidad pendiente de implementar.

**MVP:** Minimum Viable Product (Producto Mínimo Viable) - versión inicial.

**Fase 3:** Período de extensiones después del lanzamiento MVP (2-4 meses).

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
- [ ] Stats grid muestra datos reales (no hardcoded)
- [ ] Misiones activas se muestran con progreso
- [ ] Módulos disponibles están listados
- [ ] Actividad reciente muestra historial
- [ ] Progreso de rango se calcula correctamente

### ✅ Ejercicios Módulo 1 (7 checks)
- [ ] Ejercicio 1.1 - Biografía funciona
- [ ] Ejercicio 1.2 - Cronología funciona
- [ ] Ejercicio 1.3 - Verdadero/Falso funciona
- [ ] Ejercicio 1.4 - Comprensión funciona
- [ ] Ejercicio 1.5 - Personajes funciona
- [ ] Ejercicio 1.6 - Completar Oraciones funciona
- [ ] Ejercicio 1.7 - Resumen Visual funciona

### ✅ Ejercicios Módulo 2 (5 checks)
- [ ] Ejercicio 2.1 - Motivaciones funciona
- [ ] Ejercicio 2.2 - Consecuencias funciona
- [ ] Ejercicio 2.3 - Metáforas funciona
- [ ] Ejercicio 2.4 - Rueda de Inferencias funciona
- [ ] Ejercicio 2.5 - Perspectivas funciona

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
- 👥 Conéctate con otros estudiantes (pronto)
- 🌟 ¡Diviértete mientras aprendes!

---

**FIN DEL MANUAL DEL PORTAL DE ESTUDIANTES** ✅

**Última actualización:** 24 de noviembre de 2025
**Versión del Portal:** 1.0.0 (MVP - 95% Funcional)
**Próxima revisión:** Con lanzamiento de Fase 3 (Módulos 3-5)

**Documentos Relacionados:**
- `docs/finiquito/Manual_Portal_Maestros_ACTUALIZADO.md` (v1.1)
- `docs/finiquito/Manual_Portal_Administrador_ACTUALIZADO.md` (v1.1)
- `orchestration/reportes/INFORME-ALCANCE-Y-VALIDACION-PORTALES-2025-11-24.md`
- `orchestration/reportes/RESUMEN-EJECUTIVO-PORTALES-2025-11-24.md`
