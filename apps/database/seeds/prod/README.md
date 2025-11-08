# Seeds de Producción - GAMILIT Platform

**Ambiente:** Producción
**Propósito:** Datos mínimos esenciales para iniciar la plataforma en producción

---

## ⚠️ IMPORTANTE

Este directorio contiene ÚNICAMENTE datos esenciales para producción:
- ❌ **NO** incluye usuarios demo
- ❌ **NO** incluye datos de prueba
- ❌ **NO** incluye ejercicios de ejemplo
- ✅ Solo configuración mínima necesaria

---

## Estructura

```
seeds/prod/
├── README.md (este archivo)
├── auth_management/
│   ├── 01-tenants.sql              # Tenant principal de producción
│   └── 02-auth_providers.sql       # Providers de autenticación
├── system_configuration/
│   ├── 01-system_settings.sql      # Configuración del sistema
│   └── 02-feature_flags.sql        # Feature flags productivos
└── educational_content/
    └── 01-modules.sql              # Módulos educativos activos
```

---

## Orden de Ejecución

Los seeds se ejecutan en este orden (respetando dependencias):

1. **auth_management/01-tenants.sql** - Crear tenant principal
2. **auth_management/02-auth_providers.sql** - Configurar providers
3. **system_configuration/01-system_settings.sql** - Configuración base
4. **system_configuration/02-feature_flags.sql** - Features habilitados
5. **educational_content/01-modules.sql** - Módulos educativos

---

## Diferencias con seeds/dev

| Aspecto | Dev | Prod |
|---------|-----|------|
| Usuarios demo | ✅ 10 usuarios | ❌ 0 usuarios |
| Datos de prueba | ✅ Sí | ❌ No |
| Ejercicios | ✅ Todos | ✅ Solo activos |
| Gamificación | ✅ Datos demo | ❌ Solo estructura |
| Configuración | Permisiva | Estricta |

---

## Creación de Usuarios

Los usuarios en producción se crean:
1. **Automáticamente:** A través del registro de la aplicación
2. **Manualmente:** Por administradores desde el panel
3. **Por importación:** Desde CSV/Excel (futuro)

**⚠️ NO se crean usuarios en seeds de producción**

---

## Notas de Seguridad

- Todos los archivos usan `ON CONFLICT DO NOTHING` o `DO UPDATE` para idempotencia
- No hay passwords en claro
- No hay datos sensibles
- Configuración mínima de seguridad aplicada

---

**Generado por:** ATLAS-DATABASE
**Fecha:** 2025-11-02
