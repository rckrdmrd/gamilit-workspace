# Docker Cheatsheet - GAMILIT

**Ultima actualizacion:** 2026-01-04

---

## Comandos Basicos

```bash
# Ver contenedores
docker ps
docker ps -a  # incluye detenidos

# Ver imagenes
docker images

# Logs
docker logs <container>
docker logs -f <container>  # follow

# Shell en contenedor
docker exec -it <container> bash
docker exec -it <container> sh
```

---

## Docker Compose

### Desarrollo

```bash
cd apps/

# Iniciar servicios
docker compose up -d

# Ver logs
docker compose logs -f

# Detener
docker compose down

# Rebuild
docker compose up -d --build
```

### Servicios Disponibles

| Servicio | Puerto | Descripcion |
|----------|--------|-------------|
| postgres | 5432 | Base de datos |
| backend | 3000 | API NestJS |
| frontend | 5173 | Vite dev server |

---

## Base de Datos

```bash
# Conectar a PostgreSQL
docker exec -it gamilit-postgres psql -U gamilit_user -d gamilit_platform

# Backup
docker exec gamilit-postgres pg_dump -U gamilit_user gamilit_platform > backup.sql

# Restore
docker exec -i gamilit-postgres psql -U gamilit_user gamilit_platform < backup.sql
```

---

## Imagenes

```bash
# Construir imagen
docker build -t gamilit-backend:latest ./apps/backend

# Tag para registry
docker tag gamilit-backend:latest registry.example.com/gamilit-backend:latest

# Push
docker push registry.example.com/gamilit-backend:latest

# Pull
docker pull registry.example.com/gamilit-backend:latest
```

---

## Limpieza

```bash
# Contenedores detenidos
docker container prune

# Imagenes sin usar
docker image prune

# Volumenes sin usar
docker volume prune

# Todo (cuidado!)
docker system prune -a
```

---

## Troubleshooting

```bash
# Ver uso de recursos
docker stats

# Inspeccionar contenedor
docker inspect <container>

# Ver redes
docker network ls

# Reiniciar contenedor
docker restart <container>

# Forzar eliminacion
docker rm -f <container>
```

---

## docker-compose.yml Ejemplo

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: gamilit_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: gamilit_platform
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://gamilit_user:${DB_PASSWORD}@postgres:5432/gamilit_platform
    ports:
      - "3000:3000"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

---

## Referencias

- [Docker Docs](https://docs.docker.com/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
