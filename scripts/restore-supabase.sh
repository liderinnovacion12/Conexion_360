#!/usr/bin/env bash
# ============================================================
# Restaura un respaldo generado por backup-supabase.sh.
#
# ADVERTENCIA: esto sobrescribe datos existentes en el destino. Úsalo
# normalmente contra un proyecto de Supabase NUEVO o de pruebas, no
# contra producción, a menos que sepas exactamente lo que haces.
#
# USO:
#   export SUPABASE_DB_URL="postgresql://...cadena del proyecto destino..."
#   bash scripts/restore-supabase.sh backups/conexion360-20260101-120000.sql.gz
# ============================================================

set -euo pipefail

if [ -z "${SUPABASE_DB_URL:-}" ]; then
  echo "Falta la variable de entorno SUPABASE_DB_URL (cadena de conexión del proyecto DESTINO)."
  exit 1
fi

FILE="${1:-}"
if [ -z "$FILE" ] || [ ! -f "$FILE" ]; then
  echo "Uso: bash scripts/restore-supabase.sh <ruta-al-respaldo.sql.gz>"
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "No se encontró psql en el PATH. Instala las herramientas de cliente de PostgreSQL."
  exit 1
fi

echo "Vas a restaurar '$FILE' sobre:"
echo "  $SUPABASE_DB_URL"
read -r -p "Escribe RESTAURAR para confirmar: " CONFIRM
if [ "$CONFIRM" != "RESTAURAR" ]; then
  echo "Cancelado."
  exit 1
fi

gunzip -c "$FILE" | psql "$SUPABASE_DB_URL"

echo "Restauración completa."
