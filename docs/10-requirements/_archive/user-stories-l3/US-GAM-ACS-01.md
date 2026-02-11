# US-GAM-ACS-01: Accesibilidad y Soporte Multi-idioma

**Sistema:** SIMCO v4.0.0 | **Template:** User Story Level 3 (L3)

**Epica:** EPIC-GAM-FRONTEND
**Modulo(s):** core, settings, content
**Story Points:** 8
**Prioridad:** P2
**Sprint:** En progreso

## Descripcion
**Como** estudiante con necesidades especiales o hablante de otro idioma
**Quiero** una plataforma accesible y con soporte multi-idioma
**Para** poder participar en las actividades de comprension lectora sin barreras

## Criterios de Aceptacion

### CA-1: WCAG 2.1 AA Compliance
**Given** un usuario navegando la plataforma
**When** interactua con cualquier componente
**Then** todos los elementos interactivos son accesibles por teclado, las imagenes tienen texto alternativo, el contraste de colores cumple ratio minimo 4.5:1, los formularios tienen labels asociados, y los errores se comunican de forma accesible

### CA-2: Texto a Voz
**Given** un estudiante con dificultades de lectura
**When** activa la funcion de texto a voz en un ejercicio
**Then** el sistema lee en voz alta el contenido del texto, las instrucciones del ejercicio, y las opciones de respuesta, con controles de velocidad y pausa

### CA-3: Soporte Multi-idioma (i18n)
**Given** un usuario que configura su idioma preferido
**When** navega la plataforma
**Then** toda la interfaz se muestra en el idioma seleccionado (espanol por defecto, ingles disponible), los textos de UI estan externalizados via archivos i18n, y los contenidos educativos mantienen su idioma original

### CA-4: Tamano de Fuente Ajustable
**Given** un usuario con dificultades visuales
**When** ajusta las preferencias de tamano de fuente
**Then** todos los textos escalan proporcionalmente, el layout se adapta sin romper, y la preferencia se persiste en el perfil del usuario

### CA-5: Navegacion por Teclado
**Given** un usuario que navega exclusivamente con teclado
**When** utiliza Tab, Enter, Escape y flechas
**Then** puede acceder a todas las funcionalidades, el foco visual es claramente visible, los ejercicios interactivos son completables por teclado, y los modales se cierran con Escape

### CA-6: Alto Contraste
**Given** un usuario que activa el modo de alto contraste
**When** la interfaz se renderiza
**Then** los colores se ajustan para maximizar contraste, los iconos maya mantienen visibilidad, los indicadores de progreso son distinguibles, y el modo se persiste en preferencias

## Notas Tecnicas

| Aspecto | Detalle |
|---------|---------|
| Stack | React 19, react-i18next, TailwindCSS 4.x, Web Speech API |
| Componentes FE | AccessibilityPanel, TextToSpeechControl, FontSizeSlider, HighContrastToggle, LanguageSelector, KeyboardNavigationHelper |
| Archivos i18n | locales/es.json, locales/en.json |
| Dependencias | US-GAM-STD-01 (Portal Estudiante), US-GAM-TCH-01 (Portal Maestro) |

## Definition of Done
- [ ] Auditoria WCAG 2.1 AA pasada
- [ ] Texto a voz funcional para contenido y ejercicios
- [ ] Soporte i18n (espanol, ingles)
- [ ] Tamano de fuente ajustable
- [ ] Navegacion completa por teclado
- [ ] Modo de alto contraste
- [ ] Tests de accesibilidad (axe-core)
- [ ] Inventarios actualizados

## Trazabilidad

| Artefacto | Referencia |
|-----------|------------|
| Requerimiento | RNF-GAM-019, RNF-GAM-020, RNF-GAM-021 |
| Epica padre | EPIC-GAM-FRONTEND |
