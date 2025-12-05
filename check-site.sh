#!/bin/bash
# check-site.sh
# Script de vérification automatique de l'état du site

FRONTEND_URL="https://arbre-a-palabre-9e83a.web.app"
BACKEND_URL="https://arbre-palabres-backend.onrender.com/health"

echo "======================================="
echo "🔍 DIAGNOSTIC ARBRE A PALABRES"
echo "======================================="

# 1. Test Frontend
echo -n "Testing Frontend ($FRONTEND_URL)... "
if curl -s -f -I $FRONTEND_URL > /dev/null; then
  echo "✅ UP"
else
  echo "❌ DOWN"
fi

# 2. Test Backend
echo -n "Testing Backend ($BACKEND_URL)... "
RESPONSE=$(curl -s $BACKEND_URL)
if [ $? -eq 0 ] && echo $RESPONSE | grep -q "OK"; then
  echo "✅ UP"
  echo "   Response: $RESPONSE"
else
  echo "❌ DOWN or ERROR"
  echo "   Raw: $RESPONSE"
fi

echo "======================================="
echo "Terminé."
