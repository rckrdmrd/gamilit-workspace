# US-GAM-CONTENT-01: Gestion de Contenido Educativo

**Prefijo:** GAM | **Modulo:** content | **Prioridad:** P1 | **SP:** 5
**Epic:** EPIC-GAM-BACKEND

---

## Historia de Usuario

**Como** administrador de la plataforma,
**Quiero** crear, categorizar y versionar contenido educativo (lecturas, materiales multimedia),
**Para** alimentar el sistema de ejercicios con contenido de calidad y actualizado.

---

## Criterios de Aceptacion

### Escenario 1: Crear nueva lectura
**Given** un administrador en el portal de gestion de contenido
**When** crea una nueva lectura con: titulo, texto, grado recomendado, dificultad, modulo asociado, tags
**Then** la lectura se guarda con estado "borrador"
**And** puede agregar multimedia (imagenes, audio)
**And** puede asociar ejercicios existentes a la lectura
**And** al publicar, la lectura esta disponible para todos los tenants (contenido global)

### Escenario 2: Versionar contenido
**Given** una lectura publicada que necesita actualizacion
**When** el admin edita el texto y guarda
**Then** se crea una nueva version del contenido
**And** la version anterior se mantiene como historial
**And** ejercicios asociados se mantienen vinculados a la version activa

### Escenario 3: Contenido local de maestro
**Given** un maestro que quiere crear contenido especifico para su aula
**When** crea una lectura marcada como "local"
**Then** la lectura solo esta disponible para las aulas de ese maestro
**And** no aparece en el catalogo global
**And** RLS garantiza que otros tenants no la ven

---

## Definition of Done

- [ ] CRUD de contenido educativo completo
- [ ] Versionado de contenido funciona
- [ ] Contenido global vs local (RLS)
- [ ] Busqueda full-text por titulo, texto, tags
- [ ] Asociacion lectura-ejercicios
- [ ] Upload de multimedia
- [ ] Tests para CRUD, versionado, busqueda
