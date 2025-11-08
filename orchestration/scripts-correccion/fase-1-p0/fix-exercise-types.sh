#!/bin/bash

# ========================================
# CORRECCIÓN C1.4: Fix exercise_type en seeds
# ========================================

set -e  # Exit on error

echo "🔧 Corrigiendo valores exercise_type en seeds..."

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -d "apps/database/seeds/dev/educational_content" ]; then
    echo -e "${RED}❌ Error: Directorio de seeds no encontrado${NC}"
    echo "Ejecutar desde el directorio raíz del proyecto"
    exit 1
fi

# Backup de seeds originales
echo -e "${YELLOW}📦 Creando backup de seeds...${NC}"
mkdir -p apps/database/seeds/dev/educational_content/.backup
cp apps/database/seeds/dev/educational_content/*.sql apps/database/seeds/dev/educational_content/.backup/ 2>/dev/null || true
echo -e "${GREEN}✅ Backup creado en .backup/${NC}"

# ========================================
# Mapeo de valores
# ========================================

# Archivo: 02-exercises-module1.sql
echo -e "${YELLOW}🔄 Corrigiendo 02-exercises-module1.sql...${NC}"
sed -i "s/'multiple_choice'/'crucigrama'/g" apps/database/seeds/dev/educational_content/02-exercises-module1.sql
sed -i "s/'essay'/'construccion_hipotesis'/g" apps/database/seeds/dev/educational_content/02-exercises-module1.sql
sed -i "s/'fill_blank'/'emparejamiento'/g" apps/database/seeds/dev/educational_content/02-exercises-module1.sql
sed -i "s/'interactive'/'infografia_interactiva'/g" apps/database/seeds/dev/educational_content/02-exercises-module1.sql
echo -e "${GREEN}✅ 02-exercises-module1.sql corregido${NC}"

# Archivo: 03-exercises-module2.sql
echo -e "${YELLOW}🔄 Corrigiendo 03-exercises-module2.sql...${NC}"
sed -i "s/'detective'/'detective_textual'/g" apps/database/seeds/dev/educational_content/03-exercises-module2.sql
sed -i "s/'predictor'/'prediccion_narrativa'/g" apps/database/seeds/dev/educational_content/03-exercises-module2.sql
sed -i "s/'analysis'/'analisis_fuentes'/g" apps/database/seeds/dev/educational_content/03-exercises-module2.sql
echo -e "${GREEN}✅ 03-exercises-module2.sql corregido${NC}"

# Archivo: 04-exercises-module3.sql
echo -e "${YELLOW}🔄 Corrigiendo 04-exercises-module3.sql...${NC}"
sed -i "s/'debate'/'debate_digital'/g" apps/database/seeds/dev/educational_content/04-exercises-module3.sql
# Nota: 'analysis' puede estar repetido, usar global replace
sed -i "s/'analysis'/'analisis_fuentes'/g" apps/database/seeds/dev/educational_content/04-exercises-module3.sql
sed -i "s/'tribunal'/'tribunal_opiniones'/g" apps/database/seeds/dev/educational_content/04-exercises-module3.sql
echo -e "${GREEN}✅ 04-exercises-module3.sql corregido${NC}"

# Archivo: 05-exercises-module4.sql
echo -e "${YELLOW}🔄 Corrigiendo 05-exercises-module4.sql...${NC}"
sed -i "s/'presentacion'/'infografia_interactiva'/g" apps/database/seeds/dev/educational_content/05-exercises-module4.sql
sed -i "s/'podcast'/'podcast_argumentativo'/g" apps/database/seeds/dev/educational_content/05-exercises-module4.sql
sed -i "s/'video'/'comprension_auditiva'/g" apps/database/seeds/dev/educational_content/05-exercises-module4.sql
echo -e "${GREEN}✅ 05-exercises-module4.sql corregido${NC}"

# Archivo: 06-exercises-module5.sql
echo -e "${YELLOW}🔄 Corrigiendo 06-exercises-module5.sql...${NC}"
sed -i "s/'diario_multimedia'/'diario_interactivo'/g" apps/database/seeds/dev/educational_content/06-exercises-module5.sql
sed -i "s/'video_carta'/'capsula_tiempo'/g" apps/database/seeds/dev/educational_content/06-exercises-module5.sql
sed -i "s/'comic_digital'/'collage_digital'/g" apps/database/seeds/dev/educational_content/06-exercises-module5.sql
echo -e "${GREEN}✅ 06-exercises-module5.sql corregido${NC}"

echo ""
echo -e "${GREEN}✅ Todos los seeds corregidos${NC}"
echo ""

# ========================================
# Validación opcional
# ========================================

read -p "¿Deseas ejecutar los seeds ahora? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🗃️  Ejecutando seeds...${NC}"

    # Verificar conexión a DB
    if ! command -v psql &> /dev/null; then
        echo -e "${RED}❌ psql no está instalado${NC}"
        exit 1
    fi

    # Pedir credenciales de DB (o usar variables de entorno)
    read -p "Database name (default: gamilit): " DB_NAME
    DB_NAME=${DB_NAME:-gamilit}

    echo "Ejecutando seeds en DB: $DB_NAME"

    for seed in apps/database/seeds/dev/educational_content/{02..06}-exercises-module*.sql; do
        echo "  - Ejecutando: $(basename $seed)"
        psql -d $DB_NAME -f $seed || {
            echo -e "${RED}❌ Error ejecutando $seed${NC}"
            echo -e "${YELLOW}⚠️  Puedes restaurar desde .backup/ si es necesario${NC}"
            exit 1
        }
    done

    echo -e "${GREEN}✅ Seeds ejecutados exitosamente${NC}"

    # Validación de tipos
    echo ""
    echo -e "${YELLOW}📊 Validando tipos de ejercicios en DB...${NC}"
    psql -d $DB_NAME -c "
    SELECT
        exercise_type,
        COUNT(*) as count
    FROM educational_content.exercises
    GROUP BY exercise_type
    ORDER BY count DESC;
    " || true

    echo ""
    echo -e "${YELLOW}📋 Comparando con valores ENUM válidos...${NC}"
    psql -d $DB_NAME -c "
    SELECT unnest(enum_range(NULL::educational_content.exercise_type)) as valid_types
    ORDER BY 1;
    " || true

fi

echo ""
echo -e "${GREEN}🎉 Corrección completada${NC}"
echo ""
echo "Archivos modificados:"
echo "  - 02-exercises-module1.sql"
echo "  - 03-exercises-module2.sql"
echo "  - 04-exercises-module3.sql"
echo "  - 05-exercises-module4.sql"
echo "  - 06-exercises-module5.sql"
echo ""
echo "Backup guardado en: apps/database/seeds/dev/educational_content/.backup/"
echo ""
echo "Para restaurar backup:"
echo "  cp apps/database/seeds/dev/educational_content/.backup/*.sql apps/database/seeds/dev/educational_content/"
