#!/bin/bash
#
# COMANDOS DE VALIDACIÓN: Recompensas XP Módulo 2
# Fecha: 2025-11-24
# Agente: Database-Agent
# Propósito: Scripts para re-validar las recompensas XP del Módulo 2
#

set -e

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Paths
PROJECT_ROOT="/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit"
DEV_SEEDS="${PROJECT_ROOT}/apps/database/seeds/dev/educational_content/03-exercises-module2.sql"
PROD_SEEDS="${PROJECT_ROOT}/apps/database/seeds/prod/educational_content/03-exercises-module2.sql"

echo "=========================================="
echo "  VALIDACIÓN RECOMPENSAS XP - MÓDULO 2"
echo "=========================================="
echo ""

# Función para validar un archivo
validate_file() {
  local file=$1
  local env=$2

  echo -e "${YELLOW}Validando ambiente: $env${NC}"
  echo "Archivo: $file"
  echo ""

  # Buscar líneas con "true, 15," (enable_hints, hint_cost_ml_coins)
  # Las líneas inmediatamente siguientes contienen xp_reward, ml_coins_reward

  local lines=(127 220 304 384)
  local ex_num=1
  local all_correct=true

  for line in "${lines[@]}"; do
    local value=$(sed -n "${line}p" "$file" | tr -d ' \t' | tr -d ',')

    if [ "$value" = "10020" ]; then
      echo -e "  Ejercicio 2.$ex_num (línea $line): ${GREEN}✅ 100 XP, 20 ML Coins${NC}"
    else
      echo -e "  Ejercicio 2.$ex_num (línea $line): ${RED}❌ Valor incorrecto: $value${NC}"
      all_correct=false
    fi

    ex_num=$((ex_num + 1))
  done

  # Línea especial para ejercicio 2.5 (diferente en prod)
  if [ "$env" = "DEV" ]; then
    local line=514
  else
    local line=589
  fi

  local value=$(sed -n "${line}p" "$file" | tr -d ' \t' | tr -d ',')

  if [ "$value" = "10020" ]; then
    echo -e "  Ejercicio 2.5 (línea $line): ${GREEN}✅ 100 XP, 20 ML Coins${NC}"
  else
    echo -e "  Ejercicio 2.5 (línea $line): ${RED}❌ Valor incorrecto: $value${NC}"
    all_correct=false
  fi

  echo ""

  if [ "$all_correct" = true ]; then
    echo -e "${GREEN}✅ AMBIENTE $env: TODOS LOS VALORES CORRECTOS${NC}"
  else
    echo -e "${RED}❌ AMBIENTE $env: HAY VALORES INCORRECTOS${NC}"
  fi

  echo ""
}

# Validar archivo DEV
validate_file "$DEV_SEEDS" "DEV"

echo "------------------------------------------"
echo ""

# Validar archivo PROD
validate_file "$PROD_SEEDS" "PROD"

echo "=========================================="
echo ""
echo "RESUMEN:"
echo "  - Total ejercicios: 5"
echo "  - XP esperado por ejercicio: 100"
echo "  - ML Coins esperados por ejercicio: 20"
echo "  - Total XP del módulo: 500"
echo "  - Total ML Coins del módulo: 100"
echo ""
echo "IMPACTO:"
echo "  - Permite progresión Ajaw (250 XP) → Nacom (500 XP)"
echo ""
echo "=========================================="
echo ""

# Verificar estado de git
echo "ESTADO GIT:"
cd "$PROJECT_ROOT"
if git diff --quiet apps/database/seeds/dev/educational_content/03-exercises-module2.sql && \
   git diff --quiet apps/database/seeds/prod/educational_content/03-exercises-module2.sql; then
  echo -e "${GREEN}✅ No hay cambios sin commitear${NC}"
else
  echo -e "${YELLOW}⚠️  Hay cambios sin commitear en los archivos de seeds${NC}"
  git diff --name-only apps/database/seeds/*/educational_content/03-exercises-module2.sql
fi

echo ""
echo "Validación completada: $(date)"
echo ""
