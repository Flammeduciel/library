# Contexte de build = dossier frontend/ (Build Path: frontend dans Dokploy).
# Ici pas de build step : le frontend est statique, nginx ne fait que le servir.
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html

# L'entrypoint officiel de l'image nginx exécute /docker-entrypoint.d/*.sh au
# démarrage : on s'en sert pour générer js/config.js à partir de la variable
# APP_API_URL renseignée dans les Environment Settings de Dokploy.
COPY docker-entrypoint.d/30-app-config.sh /docker-entrypoint.d/30-app-config.sh
RUN chmod +x /docker-entrypoint.d/30-app-config.sh

EXPOSE 3000