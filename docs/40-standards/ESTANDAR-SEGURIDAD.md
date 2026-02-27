---
titulo: Estandar de Seguridad
tipo: estandar-proyecto
version: 3.0.0
fecha_creacion: 2026-02-02
ultima_actualizacion: 2026-02-27
tags:
  - seguridad
  - owasp
  - autenticacion
  - autorizacion
  - nestjs
  - typescript
---

# Estandar de Seguridad — GAMILIT

> Este estandar ha sido dividido en archivos especializados para mejor mantenibilidad.

---

## Archivos

| Archivo | Contenido | Lineas |
|---------|-----------|--------|
| [ESTANDAR-SEGURIDAD-WEB.md](ESTANDAR-SEGURIDAD-WEB.md) | OWASP Web Top 10 (2021) + Validacion + Auth + Secrets + Headers | ~820 |
| [ESTANDAR-SEGURIDAD-API.md](ESTANDAR-SEGURIDAD-API.md) | OWASP API Security Top 10 (2023) | ~530 |

---

## Checklist de Seguridad

### 8.1 Pre-Deploy

- [ ] **Dependencias:** `npm audit` sin vulnerabilidades criticas/altas
- [ ] **Secrets:** Ninguna credencial hardcodeada o en git
- [ ] **HTTPS:** TLS 1.2+ configurado
- [ ] **Headers:** Helmet configurado con CSP
- [ ] **CORS:** Origenes restringidos a dominios conocidos
- [ ] **Validacion:** DTOs con class-validator en todos los endpoints
- [ ] **Autenticacion:** JWT con expiracion corta (< 1h)
- [ ] **Autorizacion:** Guards en todos los endpoints protegidos
- [ ] **Logging:** Eventos de seguridad registrados
- [ ] **Rate Limiting:** Configurado en endpoints criticos

### 8.2 Durante Desarrollo

- [ ] Validar input en CADA endpoint
- [ ] Usar parametros en queries (nunca concatenar)
- [ ] No exponer datos sensibles en respuestas
- [ ] Sanitizar output que se renderiza como HTML
- [ ] Verificar permisos antes de acceder a recursos
- [ ] Registrar acciones sensibles en audit log

### 8.3 Code Review de Seguridad

- [ ] No hay SQL sin parametrizar
- [ ] No hay secrets en codigo
- [ ] DTOs tienen validaciones apropiadas
- [ ] Respuestas no exponen datos internos
- [ ] Permisos validados en cada operacion
- [ ] Errores no revelan informacion sensible
- [ ] Input sanitizado antes de usar

### 8.4 Periodicidad de Auditorias

| Actividad | Frecuencia | Responsable |
|-----------|------------|-------------|
| `npm audit` | Cada build | CI/CD |
| Revision de dependencias | Semanal | Desarrollo |
| Penetration testing | Trimestral | Seguridad |
| Revision de permisos | Mensual | Administradores |
| Rotacion de secrets | Ver politica | Operaciones |
| Revision de logs de seguridad | Diario | Monitoreo |

---

## Referencias

### Implementacion
- [ESTANDAR-API.md](ESTANDAR-API.md) - Endpoints donde se implementa la seguridad
- [ESTANDAR-SEGURIDAD-WEB.md](ESTANDAR-SEGURIDAD-WEB.md) - OWASP Web Top 10 (2021) + controles de autenticacion, autorizacion, secrets y headers
- [ESTANDAR-SEGURIDAD-API.md](ESTANDAR-SEGURIDAD-API.md) - OWASP API Security Top 10 (2023) con ejemplos especificos de gamilit

### Externas
- OWASP Top 10 (2021): https://owasp.org/Top10/
- OWASP API Security Top 10 (2023): https://owasp.org/API-Security/
- OWASP Cheat Sheet Series: https://cheatsheetseries.owasp.org/
- NestJS Security: https://docs.nestjs.com/security/authentication
- class-validator: https://github.com/typestack/class-validator
- Helmet.js: https://helmetjs.github.io/
