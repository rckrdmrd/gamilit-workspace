# ESTANDAR-METADATA-ITEMS

> Contrato canonico para `metadata` JSONB de items visuales en `gamification_system.shop_items`.

**Fecha:** 2026-02-17  
**Version:** 1.1.0  
**Contexto:** Integracion Tienda Visual (`shop_items.metadata` + `user_equipped_items`).  
**Referencias:** `docs/20-architecture/gamificacion/ANALISIS-RECURSOS-VISUALES.md`, `docs/20-architecture/gamificacion/DISENO-SISTEMA-EQUIPAMIENTO.md`.

---

## 1. Alcance y objetivo

Este estandar define la estructura JSONB canonica para:
- Configurar renderizado visual de items de tienda.
- Asegurar consistencia FE/BE/DB.
- Eliminar ambiguedades entre formatos legacy y nuevos.

No define precios, stock ni reglas de negocio comerciales.

---

## 2. Reglas generales del contrato

| Regla | Estado | Descripcion |
|------|--------|-------------|
| Naming en `snake_case` | Obligatorio | Todas las claves JSON deben usar `snake_case`. |
| `type` explicito | Obligatorio | Debe ser uno de los tipos permitidos por este estandar. |
| Compatibilidad gradual | Obligatorio | Formato legacy puede leerse temporalmente, pero no escribirse. |
| Sin estilos inline | Obligatorio | Prohibido guardar CSS inline (`style`, `javascript:`). |
| Fallback definido | Obligatorio | Todo item visual debe tener fallback funcional de render. |

---

## 3. Tipos permitidos y esquema canonico

### 3.1 `profile_frame`

```json
{
  "type": "profile_frame",
  "render_mode": "css",
  "css_class": "ring-4 ring-yellow-400",
  "animation_class": "animate-pulse",
  "fallback": {
    "render_mode": "css",
    "css_class": "ring-2 ring-slate-400"
  }
}
```

```json
{
  "type": "profile_frame",
  "render_mode": "image",
  "asset_url": "/assets/frames/dragon-gold.png",
  "position": "overlay",
  "z_index": 10,
  "fallback": {
    "render_mode": "css",
    "css_class": "ring-2 ring-slate-400"
  }
}
```

Reglas:
- Si `render_mode = css`: `css_class` es obligatorio.
- Si `render_mode = image`: `asset_url` es obligatorio y debe iniciar con `/assets/`.
- `position` permite: `inside`, `outside`, `overlay`.

### 3.2 `name_effect`

```json
{
  "type": "name_effect",
  "css_class": "bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent font-bold",
  "font_family": "font-mono",
  "icon_suffix": "🔥",
  "fallback": {
    "css_class": "font-semibold text-amber-500"
  }
}
```

Reglas:
- `css_class` obligatorio.
- `font_family` e `icon_suffix` opcionales.

### 3.3 `theme_color`

```json
{
  "type": "theme_color",
  "colors": {
    "primary": "#8B5CF6",
    "secondary": "#A78BFA",
    "accent": "#4C1D95"
  },
  "fallback": {
    "colors": {
      "primary": "#4F46E5",
      "secondary": "#6366F1",
      "accent": "#312E81"
    }
  }
}
```

Reglas:
- `colors.primary`, `colors.secondary` y `colors.accent` obligatorios.
- Valores deben cumplir formato HEX (`#RRGGBB`).

---

## 4. Compatibilidad legacy -> canonico

| Legacy | Canonico | Accion |
|--------|----------|--------|
| `cssClass` | `css_class` | Migrar en seeds y docs. |
| `assetUrl` | `asset_url` | Migrar en seeds y docs. |
| `css_frame` | `profile_frame` + `render_mode: css` | Normalizar tipo. |
| `image_frame` | `profile_frame` + `render_mode: image` | Normalizar tipo. |
| `overlay: true/false` | `position: overlay/outside` | Mapear semantica explicitamente. |

Politica:
- Lectura legacy: permitida temporalmente por compatibilidad.
- Escritura legacy: prohibida a partir de este estandar.

---

## 5. Seguridad CSS y whitelist

### 5.1 Permitido
- Clases utilitarias Tailwind predefinidas para:
  - `ring-*`, `shadow-*`, `bg-gradient-*`, `text-*`, `font-*`, `animate-*`
  - utilidades compositivas validadas por el equipo de frontend.

### 5.2 Prohibido
- Cadenas con `style=`, `javascript:`, `url(javascript:)`, `<script`.
- Clases o tokens fuera de whitelist para clases dinamicas.

### 5.3 Recomendacion operativa
- Mantener una whitelist centralizada por tipo de item en frontend y validacion backend.
- Rechazar metadata que no cumpla whitelist en endpoints admin/seeds.

---

## 6. Validaciones minimas por capa

### Backend
1. Validar `type`.
2. Validar campos obligatorios por `type`/`render_mode`.
3. Validar rutas `asset_url` bajo `/assets/`.
4. Validar patrones HEX de `theme_color`.
5. Rechazar payload con claves legacy en operaciones de escritura.

### Frontend
1. Resolver visual por `type`.
2. Aplicar fallback al detectar metadata invalida o asset inexistente.
3. Registrar warning no bloqueante cuando se detecte legacy en lectura.

### Database/Seeds
1. Sembrar solo formato canonico.
2. Evitar mezcla legacy/canonico en un mismo seed.

---

## 6.1 Separacion obligatoria `effect_data` vs `metadata`

Para `gamification_system.shop_items` la semantica obligatoria es:

| Campo | Proposito | Ejemplos |
|------|-----------|----------|
| `effect_data` | Comportamiento funcional del item en backend | boost, duracion, magnitud, reglas de uso |
| `metadata` | Definicion visual/renderizable en frontend | `type`, `render_mode`, `css_class`, `asset_url`, `colors` |

Reglas:
1. No duplicar negocio en `metadata`.
2. No poner claves visuales nuevas en `effect_data`.
3. En seeds legacy se permite lectura de visual desde `effect_data` solo durante transicion.
4. Toda nueva variante debe quedar en `metadata` y respetar este estandar.

---

## 7. Ejemplos de uso rapido

### Seed SQL (canonico)

```sql
INSERT INTO gamification_system.shop_items (..., metadata)
VALUES (
  ...,
  '{
    "type": "profile_frame",
    "render_mode": "css",
    "css_class": "ring-4 ring-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]",
    "position": "outside",
    "fallback": { "render_mode": "css", "css_class": "ring-2 ring-slate-400" }
  }'
);
```

---

## 8. Criterio de cumplimiento

Un artefacto se considera conforme cuando:
- Usa claves canonicas (`snake_case`).
- Usa `type` permitido.
- No contiene claves legacy.
- Tiene fallback valido.
- Referencia este estandar desde arquitectura/API/UX.
