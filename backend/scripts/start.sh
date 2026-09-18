#!/bin/sh
set -e

# Applique le schéma idempotent (l'équivalent de `prisma migrate deploy`) :
# safe à chaque déploiement, rien de nouveau à appliquer ne casse le boot.
# Nécessite DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME (fournis par Dokploy).
echo "==> Application du schema (idempotent)..."
PGPASSWORD="$DB_PASSWORD" psql -v ON_ERROR_STOP=1 \
  -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  -f /app/db/schema_prod.sql

# Le seed n'est jamais exécuté automatiquement par défaut (données de
# démonstration). SEED_ON_START=true crée uniquement les comptes staff de
# seed_prod.sql, une seule fois (idempotent).
if [ "$SEED_ON_START" = "true" ]; then
  echo "==> SEED_ON_START=true : creation des comptes admin/biblio..."
  PGPASSWORD="$DB_PASSWORD" psql -v ON_ERROR_STOP=1 \
    -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    -f /app/db/seed_prod.sql
fi

exec node backend/server.js