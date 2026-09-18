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
# démonstration). SEED_ON_START=true réinitialise la base (TRUNCATE ... RESTART
# IDENTITY) puis charge le jeu de données de démonstration complet
# (seed_demo.sql : staff + adhérents congolais + auteurs/livres français réels
# + historique d'emprunts). Idempotent : les identifiants repartent de 1 à
# chaque chargement. À n'activer que sur un environnement de test/recette,
# jamais sur une prod avec des données réelles, et à repasser à false ensuite.
if [ "$SEED_ON_START" = "true" ]; then
  echo "==> SEED_ON_START=true : reinitialisation des tables (TRUNCATE)..."
  PGPASSWORD="$DB_PASSWORD" psql -v ON_ERROR_STOP=1 \
    -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    -c 'TRUNCATE emprunts, livres, auteurs, users RESTART IDENTITY CASCADE'
  echo "==> SEED_ON_START=true : chargement du seed de demonstration..."
  PGPASSWORD="$DB_PASSWORD" psql -v ON_ERROR_STOP=1 \
    -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    -f /app/db/seed_demo.sql
fi

exec node server.js