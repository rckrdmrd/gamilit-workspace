# ANALISIS-RECURSOS-VISUALES

> Analisis tecnico de bajo esfuerzo/alto impacto para recursos visuales de tienda usando `metadata` JSONB.

**Fecha:** 2026-02-17  
**Version:** 1.1.0  
**Alcance:** Tienda visual y equipamiento cosmético (sin cambios de schema adicionales).  
**Contrato canónico:** `docs/40-standards/ESTANDAR-METADATA-ITEMS.md`.

---

## 1. Estrategia de renderizado

Se mantiene estrategia **CSS-First** para minimizar peso de assets y acelerar iteración.

| Tipo de recurso | Implementacion | Complejidad | Peso |
| :--- | :--- | :--- | :--- |
| Marcos (Tier 1) | Tailwind CSS (ring/shadow/gradient) | Baja | 0 KB |
| Marcos (Tier 2) | PNG/SVG superpuesto | Media | 5-20 KB |
| Efectos de nombre | `bg-clip-text` + gradientes | Baja | 0 KB |
| Temas de color | CSS variables + tokens Tailwind | Media/Alta | 0 KB |
| Avatares pack | Assets PNG optimizados | Baja | 5-10 KB |

---

## 2. Catalogo propuesto con formato canonico

Todos los ejemplos usan claves `snake_case` y `type` canonicos.

### 2.1 Marcos de avatar (`profile_frame`)

#### A) Marco CSS

```json
{
  "type": "profile_frame",
  "render_mode": "css",
  "css_class": "ring-4 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)]",
  "animation_class": "animate-pulse",
  "position": "outside",
  "fallback": {
    "render_mode": "css",
    "css_class": "ring-2 ring-slate-400"
  }
}
```

#### B) Marco imagen

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

### 2.2 Efectos de nombre (`name_effect`)

```json
{
  "type": "name_effect",
  "css_class": "bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 text-transparent bg-clip-text font-extrabold",
  "fallback": {
    "css_class": "font-semibold text-amber-500"
  }
}
```

```json
{
  "type": "name_effect",
  "css_class": "font-mono text-green-400 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]",
  "icon_suffix": "⚡",
  "fallback": {
    "css_class": "font-semibold text-emerald-400"
  }
}
```

### 2.3 Tintes de interfaz (`theme_color`)

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

### 2.4 Avatares (colecciones)

Recomendacion operativa:
- Evitar carga libre de fotos.
- Usar packs curados (`/assets/avatars/`) o generacion controlada por semilla.

Ejemplo metadata para avatar generado:

```json
{
  "type": "avatar_variant",
  "provider": "dicebear",
  "style": "adventurer",
  "seed": "user123"
}
```

---

## 3. Priorizacion de implementacion (sprint actual)

| Prioridad | Recurso | Estado recomendado | Esfuerzo | Impacto |
| :--- | :--- | :--- | :--- | :--- |
| 1 (Alta) | Marcos CSS | Implementar ahora | Muy bajo | Alto |
| 2 (Alta) | Efectos de nombre | Implementar ahora | Muy bajo | Medio |
| 3 (Media) | Avatares pack | Implementar ahora | Bajo | Alto |
| 4 (Baja) | Theme color | Postergar (requiere refactor de tokens) | Alto | Alto |

---

## 4. Limites de alcance y diferidos

### En alcance (este ciclo)
- Normalizacion de metadata canónica.
- Documentacion de flujo tecnico y UX de equipamiento.
- Contratos API de equipar/quitar/consultar.

### Diferido (proximo ciclo)
- Theming global completo con tokens dinamicos.
- Motor avanzado de animaciones custom fuera de whitelist.

---

## 5. Seed SQL de referencia

```sql
-- Marco CSS: Aura Legendaria
INSERT INTO gamification_system.shop_items (..., metadata) VALUES (
  ...,
  '{
    "type": "profile_frame",
    "render_mode": "css",
    "css_class": "ring-4 ring-offset-2 ring-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]",
    "position": "outside",
    "fallback": { "render_mode": "css", "css_class": "ring-2 ring-slate-400" }
  }'
);

-- Efecto Nombre: Fuego
INSERT INTO gamification_system.shop_items (..., metadata) VALUES (
  ...,
  '{
    "type": "name_effect",
    "css_class": "bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent font-bold",
    "fallback": { "css_class": "font-semibold text-amber-500" }
  }'
);
```

---

## 6. Conclusión

La infraestructura actual de `metadata` JSONB es suficiente para soportar personalizacion visual escalable sin aumentar complejidad de base de datos. La ruta de mayor retorno es iniciar con marcos CSS y efectos de nombre bajo contrato canónico y con validacion de seguridad CSS.
