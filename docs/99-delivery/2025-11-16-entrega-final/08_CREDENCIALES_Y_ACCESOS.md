# CREDENCIALES Y ACCESOS - PLATAFORMA GAMILIT

**Referencia Técnica - Incluido en Documentación de Entrega**

**Ubicación:** docs/finiquito/08_CREDENCIALES_Y_ACCESOS.md

---

## 🔐 CREDENCIALES DE USUARIOS DEMO

### Usuario Administrador
- **Email:** admin@gamilit.com
- **Contraseña temporal:** Admin2024!Gamilit
- **Rol:** super_admin
- **Permisos:** Acceso completo a toda la plataforma

### Usuario Maestro Demo
- **Email:** teacher@gamilit.com
- **Contraseña temporal:** Teacher2024!Gamilit
- **Rol:** admin_teacher
- **Permisos:** Gestión de aulas, estudiantes, asignaciones, reportes

### Usuario Estudiante Demo
- **Email:** student@gamilit.com
- **Contraseña temporal:** Student2024!Gamilit
- **Rol:** student
- **Permisos:** Acceso a módulos educativos y actividades

**⚠️ IMPORTANTE:**
- Cambiar TODAS las contraseñas en el primer acceso
- Las contraseñas temporales son solo para demostración
- No usar en producción sin cambiarlas

---

## 🗄️ ACCESO A BASE DE DATOS

### Conexión PostgreSQL
- **Host:** localhost (o 74.208.126.102 si es remoto)
- **Puerto:** 5432
- **Base de datos:** gamilit_platform
- **Usuario:** gamilit_user
- **Contraseña:** gamilit_secure_pass_2024

### Comandos de Conexión
```bash
# Conexión local
psql -U gamilit_user -d gamilit_platform

# Conexión remota
psql -h 74.208.126.102 -U gamilit_user -d gamilit_platform
```

---

## 🔑 VARIABLES DE ENTORNO (.env)

### Backend (.env en apps/backend/)
```env
# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gamilit_platform
DB_USER=gamilit_user
DB_PASSWORD=gamilit_secure_pass_2024

# JWT Authentication
JWT_SECRET=gamilit_jwt_secret_key_2024_very_secure_random_string_12345
JWT_EXPIRES_IN=24h

# Application
NODE_ENV=production
PORT=3006

# URLs
FRONTEND_URL=http://74.208.126.102:5173
CORS_ORIGIN=http://74.208.126.102:5173
```

### Frontend (.env en apps/frontend/)
```env
VITE_API_URL=http://74.208.126.102:3006
VITE_ENV=production
```

---

## 💾 BACKUP Y RESTAURACIÓN

### Crear Backup
```bash
export PGPASSWORD='gamilit_secure_pass_2024'
pg_dump -h localhost -U gamilit_user -d gamilit_platform \
  --clean --if-exists --create \
  -f dump_gamilit_$(date +%Y-%m-%d).sql
```

### Restaurar Backup
```bash
export PGPASSWORD='gamilit_secure_pass_2024'
psql -h localhost -U gamilit_user -d postgres -f dump_gamilit_2025-11-16.sql
```

---

## 🌐 ACCESO AL SERVIDOR

### Información del Servidor
- **IP:** 74.208.126.102
- **Proveedor:** IONOS
- **Sistema Operativo:** Ubuntu Server
- **Acceso SSH:** (Solicitar credenciales SSH por separado si se requiere)

### URLs de Acceso
- **Frontend:** http://74.208.126.102:5173
- **Backend API:** http://74.208.126.102:3006
- **API Docs:** http://74.208.126.102:3006/api-docs (si está habilitado)

---

## 📧 CONFIGURACIÓN DE EMAIL (Si aplica)

Si se requiere configurar envío de emails:

```env
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=noreply@gamilit.com
MAIL_PASSWORD=[Configurar contraseña de email]
MAIL_FROM=noreply@gamilit.com
```

---

## 🔧 COMANDOS ÚTILES DE ADMINISTRACIÓN

### Iniciar Servicios
```bash
# Backend
cd apps/backend
npm run prod

# Frontend
cd apps/frontend
npm run build
npm run preview
```

### Ver Logs
```bash
# Logs de backend (si usa PM2)
pm2 logs gamilit-backend

# Logs de PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-16-main.log
```

### Reiniciar Servicios
```bash
# Reiniciar backend
pm2 restart gamilit-backend

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

---

## ⚠️ RECOMENDACIONES DE SEGURIDAD

### Al Tomar Posesión del Sistema:

1. **Cambiar TODAS las contraseñas:**
   - ✅ Usuarios de la aplicación (admin, teacher, student)
   - ✅ Usuario de base de datos (gamilit_user)
   - ✅ JWT Secret
   - ✅ Acceso SSH al servidor (si aplica)

2. **Generar nuevas claves secretas:**
   ```bash
   # Generar nuevo JWT secret
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

3. **Configurar backup automático:**
   - Programar backups diarios de base de datos
   - Guardar backups en ubicación segura (fuera del servidor)

4. **Configurar firewall:**
   - Permitir solo puertos necesarios (3006, 5432, 80, 443)
   - Restringir acceso a base de datos solo desde localhost

5. **Habilitar HTTPS:**
   - Obtener certificado SSL (Let's Encrypt es gratis)
   - Configurar proxy inverso (Nginx/Traefik)

---

## 📞 SOPORTE POST-ENTREGA

Para consultas urgentes durante los primeros 5 días hábiles (hasta 21/11/2025):

- **Email:** rckrdmrd@gmail.com
- **WhatsApp:** 5568688733
- **Horario:** Lunes a viernes, 9:00 AM - 6:00 PM

**Nota:** El soporte extendido más allá de estos 5 días requiere
nuevo acuerdo según lo establecido en el Convenio de Finiquito.

---

**Fecha de Entrega:** 16 de noviembre de 2025
**Versión:** v1.0.0
**Estado:** Producción

**IMPORTANTE:** Este documento contiene información sensible.
Manténgalo en lugar seguro y no lo comparta públicamente.
