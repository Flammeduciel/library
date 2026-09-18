# Contexte de build = RACINE du dépôt (Build Path: . dans Dokploy), pas le
# dossier backend/ : le package npm de l'API vit à la racine du dépôt
# (package.json racine). Le COPY référence donc les chemins depuis la racine
# (backend/, db/, package.json...).
FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# postgresql-client fournit psql, utilisé par start.sh pour appliquer
# db/schema_prod.sql au démarrage (équivalent de `prisma migrate deploy`).
RUN apk add --no-cache postgresql-client \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 backend

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./package.json
COPY backend ./backend
COPY db ./db

RUN chmod +x ./backend/scripts/start.sh && chown -R backend:nodejs /app

USER backend

ENV PORT=4000
EXPOSE 4000

CMD ["./backend/scripts/start.sh"]