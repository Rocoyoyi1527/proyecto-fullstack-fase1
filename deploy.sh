#!/bin/bash

# Script de despliegue rápido para Ubuntu
# Ejecutar con: bash deploy.sh

echo "🚀 Iniciando despliegue de Proyecto Full Stack..."
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encuentra package.json"
    echo "Por favor ejecuta este script desde la raíz del proyecto"
    exit 1
fi

# Verificar que existe .env.production
if [ ! -f ".env.production" ]; then
    echo "⚠️  No se encuentra .env.production"
    echo "Por favor crea el archivo .env.production con tus variables de entorno"
    exit 1
fi

# Detener contenedores existentes
echo "🛑 Deteniendo contenedores existentes..."
docker-compose down

# Construir nueva imagen
echo "🔨 Construyendo imagen Docker..."
docker-compose build

# Iniciar contenedores
echo "▶️  Iniciando aplicación..."
docker-compose up -d

# Esperar unos segundos
echo "⏳ Esperando que la aplicación inicie..."
sleep 5

# Verificar estado
echo ""
echo "📊 Estado del contenedor:"
docker ps | grep proyecto-fullstack

echo ""
echo "📝 Últimas líneas de los logs:"
docker logs --tail 20 proyecto-fullstack

echo ""
echo "✅ Despliegue completado!"
echo ""
echo "📍 Tu aplicación está corriendo en:"
echo "   - Local: http://localhost:3000"
echo "   - Web: https://obelisque.space"
echo ""
echo "Para ver logs en tiempo real: docker logs -f proyecto-fullstack"
echo "Para detener: docker-compose down"
echo ""
