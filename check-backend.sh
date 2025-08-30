#!/bin/bash

# Ruta al backend
BACKEND_DIR="$HOME/Escritorio/hotel-booking/backend"

echo "📂 Verificando backend en: $BACKEND_DIR"

# Módulos requeridos
modules=("express" "body-parser" "dotenv" "node-fetch")

# Ir al backend
cd "$BACKEND_DIR" || { echo "❌ No se encontró el directorio backend"; exit 1; }

# Verificar que server.js exista
if [ ! -f "server.js" ]; then
  echo "❌ No se encontró server.js en $BACKEND_DIR"
  echo "   Asegúrate de que tu archivo principal del servidor existe con ese nombre."
  exit 1
fi

# Verificar package.json
if [ ! -f "package.json" ]; then
  echo "⚠️ No existe package.json, creando..."
  npm init -y
fi

# Verificar módulos instalados
for module in "${modules[@]}"; do
  if [ -d "node_modules/$module" ]; then
    echo "✅ $module instalado"
  else
    echo "⚠️ $module faltante → instalando..."
    npm install $module
  fi
done

echo "✅ Todas las dependencias están listas."
echo "▶️ Iniciando servidor con: node server.js"
echo "----------------------------------------"

# Ejecutar servidor
node server.js

