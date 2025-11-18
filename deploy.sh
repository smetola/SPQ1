#!/bin/bash
# Script para hacer deploy con cache-busting automático

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Preparando deploy a GitHub Pages...${NC}"

# 1. Incrementar versión en index.html
echo -e "${YELLOW}📝 Incrementando versión de cache-busting...${NC}"

# Buscar la versión actual
CURRENT_VERSION=$(grep -oP 'app\.js\?v=\K[0-9.]+' index.html)

if [ -z "$CURRENT_VERSION" ]; then
    echo -e "${YELLOW}⚠️  No se encontró versión. Añadiendo v=1.0${NC}"
    sed -i 's/app\.js"/app.js?v=1.0"/g' index.html
    NEW_VERSION="1.0"
else
    # Incrementar versión (ejemplo: 1.1 → 1.2)
    NEW_VERSION=$(echo "$CURRENT_VERSION + 0.1" | bc)
    NEW_VERSION=$(printf "%.1f" $NEW_VERSION)
    
    echo -e "Versión actual: ${CURRENT_VERSION}"
    echo -e "Nueva versión: ${GREEN}${NEW_VERSION}${NC}"
    
    # Reemplazar en index.html
    sed -i "s/app\.js?v=$CURRENT_VERSION/app.js?v=$NEW_VERSION/g" index.html
fi

# 2. Git add, commit y push
echo -e "${YELLOW}📦 Haciendo commit...${NC}"
git add -A

read -p "📝 Mensaje del commit (Enter para usar versión): " COMMIT_MSG
if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Deploy v$NEW_VERSION"
fi

git commit -m "$COMMIT_MSG"

echo -e "${YELLOW}⬆️  Subiendo a GitHub...${NC}"
git push origin main

echo -e "${GREEN}✅ Deploy completado!${NC}"
echo -e "${GREEN}🌐 La web se actualizará en 2-3 minutos${NC}"
echo -e ""
echo -e "💡 Recuerda hacer hard refresh en el navegador:"
echo -e "   - PC: Ctrl+Shift+R"
echo -e "   - Móvil: Modo incógnito o borrar caché"
