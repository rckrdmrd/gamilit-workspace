# Contexto y Referencias del Proyecto

**Fecha:** 2025-11-02
**Propósito:** Mapa de archivos importantes del proyecto GAMILIT

---

## 📁 Documentación del Proyecto

### Requerimientos
```
/docs/01-fase-alcance-inicial/
├── casos-uso/                 # Casos de uso (UC-*)
│   ├── student/               # Para estudiantes
│   ├── teacher/               # Para profesores
│   └── admin/                 # Para administradores
├── gamificacion/              # Sistema de gamificación
├── modulos/                   # Módulos educativos
└── proyecto/                  # Visión general del proyecto
```

### Especificaciones Técnicas
```
/docs/90-transversal/
├── apis/                      # Especificaciones de APIs
├── tipos-compartidos/         # Tipos TypeScript compartidos
├── arquitectura/              # Arquitectura del sistema
├── testing-strategy/          # Estrategia de testing
└── seguridad/                 # Especificaciones de seguridad
```

---

## 💻 Código del Proyecto

### Backend
```
/apps/backend/src/
├── auth/                      # Autenticación
├── users/                     # Gestión de usuarios
├── gamification/              # Sistema de gamificación
├── educational-content/       # Contenido educativo
└── common/                    # Código compartido
```

### Frontend
```
/apps/frontend/src/
├── features/                  # Features por módulo
├── shared/                    # Componentes compartidos
├── pages/                     # Páginas/Rutas
└── app/                       # Configuración
```

### Database
```
/apps/database/
├── ddl/schemas/               # Esquemas SQL
├── migrations/                # Migrations versionadas
└── seeds/                     # Seeds de datos
```

---

**Creado:** 2025-11-02
