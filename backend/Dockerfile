# Contexte de build = dossier backend/ lui-même (Build Path: backend dans
# Dokploy). Tout ce dont l'image a besoin vit dans backend/ : son propre
# package.json (mêmes dépendances que celui de la racine), les schémas de
# production dans backend/db/, server.js et tous les dossiers de code.
# Le COPY est donc relatif au contexte backend/, aucun fichier hors
# de ce dossier n'est requis.
FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# postgresql-client fournit psql, utilisé par start.sh pour appliquer
# backend/db/schema_prod.sql au démarrage (équivalent de `prisma migrate deploy`).
RUN apk add --no-cache postgresql-client \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 backend

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN chmod +x ./scripts/start.sh && chown -R backend:nodejs /app

USER backend

ENV PORT=4000
EXPOSE 4000

CMD ["sh", "./scripts/start.sh"]