#!/bin/bash
################################################################################
# Script de Preparación de Entrega en USB - Proyecto GAMILIT
# Fecha: 16 de noviembre de 2025
# Versión: v1.0.0
################################################################################

set -e  # Salir si hay algún error

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuración
PROJECT_ROOT="/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit"
USB_PATH="${1:-/media/usb/GAMILIT_ENTREGA_2025-11-16}"
DELIVERY_DATE="2025-11-16"

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  PREPARACIÓN DE ENTREGA USB - PROYECTO GAMILIT v1.0.0${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Función de ayuda
show_help() {
    echo "Uso: $0 [RUTA_USB]"
    echo ""
    echo "Ejemplo:"
    echo "  $0 /media/usb/GAMILIT_ENTREGA"
    echo "  $0 /mnt/usb/ENTREGA"
    echo ""
    echo "Si no se especifica ruta, se usa: $USB_PATH"
    exit 0
}

if [ "$1" == "-h" ] || [ "$1" == "--help" ]; then
    show_help
fi

echo -e "${YELLOW}📁 Destino: $USB_PATH${NC}"
echo -e "${YELLOW}📦 Origen: $PROJECT_ROOT${NC}"
echo ""

# Verificar que existe el directorio del proyecto
if [ ! -d "$PROJECT_ROOT" ]; then
    echo -e "${RED}❌ Error: No se encuentra el directorio del proyecto${NC}"
    exit 1
fi

# Preguntar confirmación
echo -e "${YELLOW}⚠️  Este script creará la estructura de entrega en:${NC}"
echo -e "${YELLOW}   $USB_PATH${NC}"
echo ""
read -p "¿Continuar? (s/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${RED}Cancelado por el usuario${NC}"
    exit 1
fi

################################################################################
# PASO 1: Crear estructura de carpetas
################################################################################
echo ""
echo -e "${GREEN}[1/6] Creando estructura de carpetas...${NC}"

mkdir -p "$USB_PATH"/{01-DOCUMENTOS-ENTREGA,02-CODIGO-FUENTE,03-DOCUMENTACION-PLANEACION,04-BASE-DATOS/{DDL,SEEDS,SCRIPTS,BACKUP},05-MANUALES}

echo -e "${GREEN}✅ Estructura creada${NC}"

################################################################################
# PASO 2: Copiar documentos de entrega
################################################################################
echo ""
echo -e "${GREEN}[2/6] Copiando documentos de entrega...${NC}"

if [ -d "$PROJECT_ROOT/docs/finiquito" ]; then
    # Copiar solo archivos .docx principales (excluir scripts y markdown)
    cp "$PROJECT_ROOT/docs/finiquito"/*.docx "$USB_PATH/01-DOCUMENTOS-ENTREGA/" 2>/dev/null || true

    # Copiar también la guía de entrega
    cp "$PROJECT_ROOT/docs/finiquito/GUIA_ENTREGA_USB.md" "$USB_PATH/" 2>/dev/null || true

    echo -e "${GREEN}✅ $(ls -1 "$USB_PATH/01-DOCUMENTOS-ENTREGA"/*.docx 2>/dev/null | wc -l) documentos copiados${NC}"
else
    echo -e "${YELLOW}⚠️  No se encontró la carpeta de finiquito${NC}"
fi

################################################################################
# PASO 3: Copiar código fuente (sin node_modules, .git, etc.)
################################################################################
echo ""
echo -e "${GREEN}[3/6] Copiando código fuente (esto puede tardar varios minutos)...${NC}"

# Verificar si rsync está disponible
if command -v rsync &> /dev/null; then
    rsync -av --progress \
        --exclude 'node_modules' \
        --exclude '.git' \
        --exclude 'dist' \
        --exclude 'build' \
        --exclude '.cache' \
        --exclude '.env' \
        --exclude '*.log' \
        --exclude '.turbo' \
        --exclude 'coverage' \
        --exclude '.next' \
        "$PROJECT_ROOT/" \
        "$USB_PATH/02-CODIGO-FUENTE/gamilit/"

    echo -e "${GREEN}✅ Código fuente copiado con rsync${NC}"
else
    # Fallback a cp si no hay rsync
    echo -e "${YELLOW}⚠️  rsync no disponible, usando cp (más lento)${NC}"

    cp -r "$PROJECT_ROOT" "$USB_PATH/02-CODIGO-FUENTE/gamilit/"

    # Limpiar manualmente
    find "$USB_PATH/02-CODIGO-FUENTE/gamilit/" -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null || true
    find "$USB_PATH/02-CODIGO-FUENTE/gamilit/" -type d -name ".git" -exec rm -rf {} + 2>/dev/null || true
    find "$USB_PATH/02-CODIGO-FUENTE/gamilit/" -type d -name "dist" -exec rm -rf {} + 2>/dev/null || true
    find "$USB_PATH/02-CODIGO-FUENTE/gamilit/" -type f -name "*.log" -delete 2>/dev/null || true

    echo -e "${GREEN}✅ Código fuente copiado con cp${NC}"
fi

################################################################################
# PASO 4: Copiar documentación de planeación
################################################################################
echo ""
echo -e "${GREEN}[4/6] Copiando documentación de planeación...${NC}"

if [ -d "$PROJECT_ROOT/docs" ]; then
    cp -r "$PROJECT_ROOT/docs" "$USB_PATH/03-DOCUMENTACION-PLANEACION/"
    echo -e "${GREEN}✅ Documentación copiada${NC}"
else
    echo -e "${YELLOW}⚠️  No se encontró carpeta docs/${NC}"
fi

if [ -d "$PROJECT_ROOT/orchestration" ]; then
    cp -r "$PROJECT_ROOT/orchestration" "$USB_PATH/03-DOCUMENTACION-PLANEACION/"
    echo -e "${GREEN}✅ Orchestration copiada${NC}"
fi

################################################################################
# PASO 5: Base de datos
################################################################################
echo ""
echo -e "${GREEN}[5/6] Preparando base de datos...${NC}"

# Copiar DDL
if [ -d "$PROJECT_ROOT/apps/database/ddl" ]; then
    cp -r "$PROJECT_ROOT/apps/database/ddl"/* "$USB_PATH/04-BASE-DATOS/DDL/" 2>/dev/null || true
    echo -e "${GREEN}✅ DDL copiados${NC}"
fi

# Copiar Seeds
if [ -d "$PROJECT_ROOT/apps/database/seeds" ]; then
    cp -r "$PROJECT_ROOT/apps/database/seeds"/* "$USB_PATH/04-BASE-DATOS/SEEDS/" 2>/dev/null || true
    echo -e "${GREEN}✅ Seeds copiados${NC}"
fi

# Copiar scripts
if [ -d "$PROJECT_ROOT/apps/database/scripts" ]; then
    cp -r "$PROJECT_ROOT/apps/database/scripts"/* "$USB_PATH/04-BASE-DATOS/SCRIPTS/" 2>/dev/null || true
    echo -e "${GREEN}✅ Scripts copiados${NC}"
fi

# Crear backup de base de datos
echo ""
echo -e "${YELLOW}¿Desea crear un backup de la base de datos actual? (s/N):${NC}"
read -p "" -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    if command -v pg_dump &> /dev/null; then
        echo -e "${GREEN}Creando backup de base de datos...${NC}"
        export PGPASSWORD='3RZ2uYhCnJBXQqEwPPbZK3NFfk4T4W4Q'

        pg_dump -h localhost -U gamilit_user -d gamilit_platform \
            --clean --if-exists --create \
            -f "$USB_PATH/04-BASE-DATOS/BACKUP/dump_gamilit_${DELIVERY_DATE}.sql" \
            && echo -e "${GREEN}✅ Backup creado exitosamente${NC}" \
            || echo -e "${YELLOW}⚠️  No se pudo crear el backup (verificar que la BD esté corriendo)${NC}"

        unset PGPASSWORD
    else
        echo -e "${YELLOW}⚠️  pg_dump no disponible${NC}"
    fi
else
    echo -e "${YELLOW}⏭️  Backup omitido${NC}"
fi

################################################################################
# PASO 6: Crear archivos de configuración y README
################################################################################
echo ""
echo -e "${GREEN}[6/6] Creando archivos de configuración...${NC}"

# Copiar manuales de usuario
echo -e "${GREEN}Copiando manuales de usuario...${NC}"
cp "$PROJECT_ROOT/docs/finiquito/"Manual*.docx "$USB_PATH/05-MANUALES/" 2>/dev/null || true

# Crear .env.template
cat > "$USB_PATH/05-MANUALES/.env.template" << 'EOF'
# ═══════════════════════════════════════════════════════════════
# CONFIGURACIÓN - PROYECTO GAMILIT
# IMPORTANTE: Renombrar a .env y completar con valores reales
# ═══════════════════════════════════════════════════════════════

# Backend Configuration
NODE_ENV=production
PORT=3006

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gamilit_platform
DB_USER=gamilit_user
DB_PASSWORD=***CAMBIAR_POR_PASSWORD_SEGURO***

# JWT (Generar nueva clave secreta)
JWT_SECRET=***GENERAR_CLAVE_ALEATORIA_SEGURA***
JWT_EXPIRES_IN=1h

# Frontend
VITE_API_URL=http://localhost:3006

# CORS
CORS_ORIGIN=http://localhost:5173

# ═══════════════════════════════════════════════════════════════
# Para generar JWT_SECRET seguro, usar:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# ═══════════════════════════════════════════════════════════════
EOF

# Crear README principal
cat > "$USB_PATH/README.txt" << 'EOF'
═══════════════════════════════════════════════════════════════════
    PROYECTO GAMILIT - PLATAFORMA DE GAMIFICACIÓN EDUCATIVA
                  Entrega Final - 16 de noviembre 2025
═══════════════════════════════════════════════════════════════════

VERSIÓN: v1.0.0
COMMIT: 2a578a2
FECHA: 16/11/2025

CONTENIDO DE ESTA ENTREGA:
──────────────────────────────────────────────────────────────────

📁 01-DOCUMENTOS-ENTREGA/
   → Documentos legales (Acta, Anexos, Convenio)
   → Revisar y firmar según corresponda

📁 02-CODIGO-FUENTE/
   → Código fuente completo
   → Backend: NestJS + TypeScript
   → Frontend: React 19 + TypeScript + Vite
   → Base de Datos: PostgreSQL 16.x

📁 03-DOCUMENTACION-PLANEACION/
   → Historias de usuario
   → Especificaciones técnicas
   → Documentación de requerimientos

📁 04-BASE-DATOS/
   → Scripts DDL (estructura)
   → Seeds (datos iniciales)
   → Backup completo

📁 05-MANUALES/
   → Instrucciones de instalación
   → Templates de configuración

REQUISITOS:
──────────────────────────────────────────────────────────────────
- Node.js 18.x o superior
- PostgreSQL 16.x
- npm 9.x o superior

INICIO RÁPIDO:
──────────────────────────────────────────────────────────────────
1. Leer GUIA_ENTREGA_USB.md
2. Instalar requisitos
3. Configurar base de datos (usar scripts en 04-BASE-DATOS/)
4. Configurar .env (usar template en 05-MANUALES/)
5. npm install (en backend y frontend)
6. npm run dev

═══════════════════════════════════════════════════════════════════
     NOTA: Esta entrega NO incluye historial de Git
   Enfocada en documentación de planeación y código funcional
═══════════════════════════════════════════════════════════════════

Desarrollador: Adrián Flores Cortés
EOF

echo -e "${GREEN}✅ Archivos de configuración creados${NC}"

################################################################################
# Resumen final
################################################################################
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}                    ✅ ENTREGA PREPARADA                      ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}📁 Ubicación: $USB_PATH${NC}"
echo ""
echo -e "${YELLOW}Contenido:${NC}"
du -sh "$USB_PATH"/* 2>/dev/null | while read size path; do
    echo -e "  ${GREEN}$size${NC}\t$(basename "$path")"
done
echo ""
echo -e "${YELLOW}Tamaño total:${NC}"
du -sh "$USB_PATH" 2>/dev/null
echo ""
echo -e "${GREEN}✅ Proceso completado exitosamente${NC}"
echo ""
echo -e "${YELLOW}Siguiente paso:${NC}"
echo -e "  1. Verificar contenido en: $USB_PATH"
echo -e "  2. Revisar README.txt"
echo -e "  3. Copiar a USB físico si es necesario"
echo -e "  4. Verificar que NO hay credenciales reales"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
