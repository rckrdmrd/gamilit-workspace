#!/bin/bash
# =====================================================
# Script de Verificación: Seeds Educational Content
# =====================================================
# Descripción: Verifica la integridad de los seeds
# Autor: SA-SEEDS-EDUCATIONAL
# Fecha: 2025-11-02
# =====================================================

echo "=================================================="
echo "  VERIFICACIÓN DE SEEDS: Educational Content"
echo "=================================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
total_files=0
missing_files=0

# Archivos esperados
declare -a expected_files=(
    "01-modules.sql"
    "02-exercises-module1.sql"
    "03-exercises-module2.sql"
    "04-exercises-module3.sql"
    "05-exercises-module4.sql"
    "06-exercises-module5.sql"
    "07-assessment-rubrics.sql"
    "README.md"
)

echo "1. Verificando archivos..."
echo ""

for file in "${expected_files[@]}"; do
    total_files=$((total_files + 1))
    if [ -f "$file" ]; then
        size=$(ls -lh "$file" | awk '{print $5}')
        lines=$(wc -l < "$file")
        echo -e "${GREEN}✓${NC} $file (${size}, ${lines} líneas)"
    else
        echo -e "${RED}✗${NC} $file - FALTA"
        missing_files=$((missing_files + 1))
    fi
done

echo ""
echo "2. Verificando estructura SQL..."
echo ""

# Verificar módulos
if grep -q "MOD-01-LITERAL" 01-modules.sql 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Módulo 1 (Literal) encontrado"
else
    echo -e "${RED}✗${NC} Módulo 1 (Literal) NO encontrado"
fi

if grep -q "MOD-02-INFERENCIAL" 01-modules.sql 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Módulo 2 (Inferencial) encontrado"
else
    echo -e "${RED}✗${NC} Módulo 2 (Inferencial) NO encontrado"
fi

if grep -q "MOD-03-CRITICA" 01-modules.sql 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Módulo 3 (Crítica) encontrado"
else
    echo -e "${RED}✗${NC} Módulo 3 (Crítica) NO encontrado"
fi

if grep -q "MOD-04-DIGITAL" 01-modules.sql 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Módulo 4 (Digital) encontrado"
else
    echo -e "${RED}✗${NC} Módulo 4 (Digital) NO encontrado"
fi

if grep -q "MOD-05-CREATIVO" 01-modules.sql 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Módulo 5 (Creativo) encontrado"
else
    echo -e "${RED}✗${NC} Módulo 5 (Creativo) NO encontrado"
fi

echo ""
echo "3. Estadísticas..."
echo ""

total_lines=$(wc -l *.sql 2>/dev/null | tail -1 | awk '{print $1}')
total_size=$(du -sh . 2>/dev/null | awk '{print $1}')

echo "   Líneas totales de SQL: ${total_lines}"
echo "   Tamaño total: ${total_size}"
echo ""

echo "=================================================="
if [ $missing_files -eq 0 ]; then
    echo -e "${GREEN}✓ VERIFICACIÓN EXITOSA${NC}"
    echo "  Todos los archivos están presentes"
else
    echo -e "${RED}✗ VERIFICACIÓN FALLIDA${NC}"
    echo "  Faltan $missing_files archivo(s)"
fi
echo "=================================================="
