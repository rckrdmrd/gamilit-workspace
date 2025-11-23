#!/bin/bash

# ========================================
# Script de validación completa de correcciones
# ========================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contadores
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Función para imprimir headers
print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

# Función para checks
check() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    local desc="$1"
    local cmd="$2"

    echo -n "  ⏳ $desc... "

    if eval "$cmd" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

# Función para checks con output
check_with_output() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    local desc="$1"
    local cmd="$2"

    echo ""
    echo -e "${YELLOW}  🔍 $desc${NC}"

    if output=$(eval "$cmd" 2>&1); then
        echo "$output"
        echo -e "${GREEN}  ✅ PASS${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo "$output"
        echo -e "${RED}  ❌ FAIL${NC}"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

# ========================================
# INICIO DE VALIDACIONES
# ========================================

print_header "🧪 VALIDACIÓN COMPLETA DE CORRECCIONES"

echo "Fecha: $(date)"
echo "Usuario: $(whoami)"
echo "Directorio: $(pwd)"
echo ""

# ========================================
# 1. VALIDAR COMPILACIÓN TYPESCRIPT
# ========================================

print_header "1️⃣ Validación de Compilación TypeScript"

if [ ! -d "apps/backend" ]; then
    echo -e "${RED}❌ Directorio apps/backend no encontrado${NC}"
    echo "Ejecutar desde el directorio raíz del proyecto"
    exit 1
fi

cd apps/backend

check "npm está instalado" "command -v npm"
check "node_modules existe" "test -d node_modules"

echo ""
echo -e "${YELLOW}  📦 Ejecutando build...${NC}"
if npm run build 2>&1 | tee /tmp/build-output.log; then
    echo -e "${GREEN}  ✅ Build exitoso${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${RED}  ❌ Build falló${NC}"
    echo "Ver logs en: /tmp/build-output.log"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

cd ../..

# ========================================
# 2. VALIDAR ENUMS EN BACKEND
# ========================================

print_header "2️⃣ Validación de ENUMs en Backend"

ENUM_FILES=(
    "apps/backend/src/shared/enums/aal-level.enum.ts"
    "apps/backend/src/shared/enums/code-challenge-method.enum.ts"
    "apps/backend/src/shared/enums/gamilit-role.enum.ts"
    "apps/backend/src/shared/enums/rango-maya.enum.ts"
    "apps/backend/src/shared/enums/bucket-type.enum.ts"
)

for file in "${ENUM_FILES[@]}"; do
    check "Archivo existe: $(basename $file)" "test -f $file"
done

check "ENUMs exportados en index.ts" "grep -q 'aal-level.enum' apps/backend/src/shared/enums/index.ts"

# ========================================
# 3. VALIDAR TABLAS EN DATABASE
# ========================================

print_header "3️⃣ Validación de Tablas en Database"

# Pedir credenciales de DB
read -p "Database name (default: gamilit): " DB_NAME
DB_NAME=${DB_NAME:-gamilit}

echo ""
echo "Conectando a DB: $DB_NAME"
echo ""

if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ psql no está instalado${NC}"
    exit 1
fi

# Verificar conexión
if ! psql -d $DB_NAME -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${RED}❌ No se puede conectar a DB: $DB_NAME${NC}"
    echo "Verificar credenciales y que la DB existe"
    exit 1
fi

echo -e "${GREEN}✅ Conexión a DB exitosa${NC}"
echo ""

# Verificar tablas
check_with_output "Tabla system_metrics existe" \
    "psql -d $DB_NAME -c '\dt audit_logging.system_metrics'"

check_with_output "Tabla tags existe" \
    "psql -d $DB_NAME -c '\dt content_management.tags'"

check_with_output "Tabla module_tags existe" \
    "psql -d $DB_NAME -c '\dt content_management.module_tags'"

# ========================================
# 4. VALIDAR SEEDS
# ========================================

print_header "4️⃣ Validación de Seeds"

SEED_FILES=(
    "apps/database/seeds/dev/educational_content/02-exercises-module1.sql"
    "apps/database/seeds/dev/educational_content/03-exercises-module2.sql"
    "apps/database/seeds/dev/educational_content/04-exercises-module3.sql"
    "apps/database/seeds/dev/educational_content/05-exercises-module4.sql"
    "apps/database/seeds/dev/educational_content/06-exercises-module5.sql"
)

for file in "${SEED_FILES[@]}"; do
    check "Seed existe: $(basename $file)" "test -f $file"
done

echo ""
echo -e "${YELLOW}  🔍 Validando valores exercise_type en seeds...${NC}"

INVALID_VALUES=(
    "multiple_choice"
    "essay"
    "fill_blank"
    "interactive"
    "detective"
    "predictor"
    "analysis"
    "debate"
    "tribunal"
    "podcast"
    "presentacion"
    "video"
    "diario_multimedia"
    "video_carta"
    "comic_digital"
)

FOUND_INVALID=0
for value in "${INVALID_VALUES[@]}"; do
    if grep -r "'$value'" apps/database/seeds/dev/educational_content/*.sql > /dev/null 2>&1; then
        echo -e "${RED}    ❌ Valor inválido encontrado: $value${NC}"
        FOUND_INVALID=$((FOUND_INVALID + 1))
    fi
done

if [ $FOUND_INVALID -eq 0 ]; then
    echo -e "${GREEN}    ✅ No se encontraron valores inválidos${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${RED}    ❌ Se encontraron $FOUND_INVALID valores inválidos${NC}"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

# ========================================
# 5. VALIDAR EXERCISE_TYPES EN DB
# ========================================

print_header "5️⃣ Validación de exercise_type en DB"

echo -e "${YELLOW}  📊 Tipos de ejercicios en DB:${NC}"
psql -d $DB_NAME -c "
SELECT
    exercise_type,
    COUNT(*) as count
FROM educational_content.exercises
GROUP BY exercise_type
ORDER BY count DESC;
" 2>&1 || true

echo ""
echo -e "${YELLOW}  📋 Valores ENUM válidos en DDL:${NC}"
psql -d $DB_NAME -c "
SELECT unnest(enum_range(NULL::educational_content.exercise_type)) as valid_types
ORDER BY 1;
" 2>&1 || true

echo ""
echo -e "${YELLOW}  🔍 Verificando tipos inválidos en DB...${NC}"
INVALID_COUNT=$(psql -d $DB_NAME -t -c "
SELECT COUNT(*)
FROM educational_content.exercises e
WHERE NOT EXISTS (
    SELECT 1
    FROM unnest(enum_range(NULL::educational_content.exercise_type)) AS valid(val)
    WHERE valid.val::text = e.exercise_type::text
);
" 2>&1 | tr -d ' ')

if [ "$INVALID_COUNT" = "0" ]; then
    echo -e "${GREEN}    ✅ Todos los tipos son válidos (0 inválidos)${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${RED}    ❌ Se encontraron $INVALID_COUNT tipos inválidos${NC}"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

# ========================================
# 6. VALIDAR TESTS UNITARIOS
# ========================================

print_header "6️⃣ Validación de Tests Unitarios"

cd apps/backend

echo -e "${YELLOW}  🧪 Ejecutando tests...${NC}"
if npm run test 2>&1 | tee /tmp/test-output.log; then
    echo -e "${GREEN}  ✅ Tests pasaron${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${RED}  ❌ Algunos tests fallaron${NC}"
    echo "Ver logs en: /tmp/test-output.log"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

cd ../..

# ========================================
# 7. VALIDAR DECORADORES (OPCIONAL)
# ========================================

print_header "7️⃣ Validación de Decoradores (análisis estático)"

echo -e "${YELLOW}  🔍 Buscando DTOs sin decoradores UUID...${NC}"

UUID_PROPS=$(grep -r ":\s*string" apps/backend/src --include="*.dto.ts" -A 1 | grep -i "id\|uuid" | wc -l)
UUID_DECORATORS=$(grep -r "@IsUUID" apps/backend/src --include="*.dto.ts" | wc -l)

echo "    Properties tipo UUID encontradas: $UUID_PROPS"
echo "    Decoradores @IsUUID() encontrados: $UUID_DECORATORS"

if [ $UUID_DECORATORS -ge 50 ]; then
    echo -e "${GREEN}    ✅ Cobertura de @IsUUID() aceptable${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${YELLOW}    ⚠️  Cobertura de @IsUUID() baja (esperado >= 50)${NC}"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

# ========================================
# RESUMEN FINAL
# ========================================

print_header "📊 RESUMEN DE VALIDACIÓN"

echo "Total de checks: $TOTAL_CHECKS"
echo -e "${GREEN}Checks pasados: $PASSED_CHECKS${NC}"
echo -e "${RED}Checks fallidos: $FAILED_CHECKS${NC}"
echo ""

PERCENTAGE=$(( PASSED_CHECKS * 100 / TOTAL_CHECKS ))
echo "Porcentaje de éxito: ${PERCENTAGE}%"
echo ""

if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡TODAS LAS VALIDACIONES PASARON!${NC}"
    echo ""
    echo "✅ Sistema validado completamente"
    echo "✅ Correcciones aplicadas exitosamente"
    echo ""
    echo "Próximos pasos:"
    echo "  1. git add ."
    echo "  2. git commit -m 'fix: aplicar correcciones fase 1 (P0)'"
    echo "  3. git push origin <branch>"
    echo "  4. Crear Pull Request"
    exit 0
else
    echo -e "${RED}❌ ALGUNAS VALIDACIONES FALLARON${NC}"
    echo ""
    echo "Revisar los errores marcados con ❌"
    echo ""
    echo "Logs generados:"
    echo "  - /tmp/build-output.log"
    echo "  - /tmp/test-output.log"
    exit 1
fi
