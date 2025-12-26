#!/bin/bash

# Script para comparar DDL entre origen y destino
ORIGEN="/home/isem/workspace/projects/gamilit/apps/database/ddl/schemas"
DESTINO="/home/isem/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas"
OUTPUT="/home/isem/workspace/projects/gamilit/orchestration/analisis-homologacion-database-2025-12-18"

SCHEMAS=(
  "admin_dashboard"
  "audit_logging"
  "auth"
  "auth_management"
  "communication"
  "content_management"
  "educational_content"
  "gamification_system"
  "gamilit"
  "lti_integration"
  "notifications"
  "progress_tracking"
  "public"
  "social_features"
  "storage"
  "system_configuration"
)

echo "# ANÁLISIS DE DIFERENCIAS DDL - ORIGEN vs DESTINO"
echo "Fecha: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "## Directorios analizados"
echo "- **ORIGEN:** $ORIGEN"
echo "- **DESTINO:** $DESTINO"
echo ""

# Archivos temporales para tracking
NUEVOS_FILE="$OUTPUT/temp_nuevos.txt"
ELIMINADOS_FILE="$OUTPUT/temp_eliminados.txt"
MODIFICADOS_FILE="$OUTPUT/temp_modificados.txt"

> "$NUEVOS_FILE"
> "$ELIMINADOS_FILE"
> "$MODIFICADOS_FILE"

for schema in "${SCHEMAS[@]}"; do
  echo "Procesando schema: $schema"

  # Encontrar todos los archivos SQL en origen
  if [ -d "$ORIGEN/$schema" ]; then
    find "$ORIGEN/$schema" -type f -name "*.sql" | while read -r file_origen; do
      # Calcular ruta relativa
      rel_path="${file_origen#$ORIGEN/$schema/}"
      file_destino="$DESTINO/$schema/$rel_path"

      if [ ! -f "$file_destino" ]; then
        # Archivo NUEVO (solo en origen)
        echo "$schema|$rel_path|NUEVO" >> "$NUEVOS_FILE"
      else
        # Comparar checksums
        md5_origen=$(md5sum "$file_origen" | cut -d' ' -f1)
        md5_destino=$(md5sum "$file_destino" | cut -d' ' -f1)

        if [ "$md5_origen" != "$md5_destino" ]; then
          # Archivo MODIFICADO
          echo "$schema|$rel_path|MODIFICADO|$file_origen|$file_destino" >> "$MODIFICADOS_FILE"
        fi
      fi
    done
  fi

  # Encontrar archivos que existen en destino pero no en origen
  if [ -d "$DESTINO/$schema" ]; then
    find "$DESTINO/$schema" -type f -name "*.sql" | while read -r file_destino; do
      rel_path="${file_destino#$DESTINO/$schema/}"
      file_origen="$ORIGEN/$schema/$rel_path"

      if [ ! -f "$file_origen" ]; then
        # Archivo ELIMINADO (solo en destino)
        echo "$schema|$rel_path|ELIMINADO" >> "$ELIMINADOS_FILE"
      fi
    done
  fi
done

echo "Comparación completada. Resultados en $OUTPUT/temp_*.txt"
