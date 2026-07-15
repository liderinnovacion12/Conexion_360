#!/usr/bin/env bash
# ============================================================
# Respaldo manual de la base de datos de Supabase.
#
# El plan Free de Supabase NO incluye respaldos automáticos ni
# point-in-time recovery (eso empieza en el plan Pro). Mientras tanto,
# este script genera un dump completo (esquema + datos) con pg_dump.
#
# CÓMO USARLO
# 1. Instala las herramientas de cliente de PostgreSQL si no las tienes:
#      - Windows: https://www.postgresql.org/download/windows/
#        (o con Git Bash ya instalado, usa el instalador de PostgreSQL
#        y agrega su carpeta "bin" al PATH — trae pg_dump.exe)
#      - Mac: brew install libpq && brew link --force libpq
#      - Linux: apt install postgresql-client
#
# 2. Consigue tu cadena de conexión en el dashboard de Supabase:
#    Project Settings → Database → Connection string → "URI"
#    (elige "Session pooler" o "Direct connection"). Se ve así:
#      postgresql://postgres.xxxx:TU_PASSWORD@aws-0-us-west-2.pooler.supabase.com:5432/postgres
#
# 3. NUNCA pegues esa URL en el chat ni la subas a git. Guárdala en una
#    variable de entorno antes de correr el script, por ejemplo:
#      export SUPABASE_DB_URL="postgresql://...tu_cadena_completa..."
#      bash scripts/backup-supabase.sh
#
# Los respaldos quedan en la carpeta backups/ (ya está en .gitignore,
# así que nunca se suben al repositorio por accidente).
# ============================================================

set -euo pipefail

if [ -z "${SUPABASE_DB_URL:-}" ]; then
  echo "Falta la variable de entorno SUPABASE_DB_URL."
  echo "Defínela con tu cadena de conexión de Supabase (Project Settings > Database) y vuelve a correr:"
  echo '  export SUPABASE_DB_URL="postgresql://...tu_cadena..."'
  echo "  bash scripts/backup-supabase.sh"
  exit 1
fi

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "No se encontró pg_dump en el PATH. Instala las herramientas de cliente de PostgreSQL"
  echo "(ver instrucciones al inicio de este script) y vuelve a intentar."
  exit 1
fi

BACKUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/backups"
mkdir -p "$BACKUP_DIR"

STAMP="$(date +%Y%m%d-%H%M%S)"
OUT_FILE="$BACKUP_DIR/conexion360-$STAMP.sql.gz"

echo "Generando respaldo en: $OUT_FILE"
pg_dump "$SUPABASE_DB_URL" \
  --no-owner \
  --no-privileges \
  --schema=public \
  | gzip > "$OUT_FILE"

echo "Respaldo listo: $OUT_FILE"

# Rotación: conserva solo los últimos 14 respaldos para no llenar el disco.
KEEP=14
ls -1t "$BACKUP_DIR"/conexion360-*.sql.gz 2>/dev/null | tail -n +$((KEEP + 1)) | xargs -r rm -f

echo "Respaldos actuales:"
ls -1 "$BACKUP_DIR"/conexion360-*.sql.gz
