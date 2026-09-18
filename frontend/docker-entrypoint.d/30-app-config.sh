#!/bin/sh
set -e

# Génère assets/js/config.js à partir de la variable APP_API_URL
# (Environment Settings Dokploy). Ce frontend est statique : la valeur est lue
# PAR le navigateur au chargement, donc elle doit être injectée au démarrage du
# conteneur, pas au build.
# Si APP_API_URL est vide/absent, on garde le fichier committé (même origine).
if [ -n "$APP_API_URL" ]; then
  printf 'window.APP_API_URL = "%s";\n' "$APP_API_URL" > /usr/share/nginx/html/assets/js/config.js
  echo "==> APP_API_URL injectee dans assets/js/config.js"
fi