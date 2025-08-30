#!/bin/bash

echo "🏨 Configurando Hotel Paradise..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js primero."
    exit 1
fi

# Check if Python is installed (for frontend server)
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
    echo "⚠️ Python no está instalado. Puedes usar cualquier servidor web local."
fi

# Install backend dependencies
echo "📦 Instalando dependencias del backend..."
cd backend
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env..."
    cp .env.example .env
    echo "✅ Archivo .env creado. Por favor configura tus credenciales de Bold."
fi

cd ..

echo "✅ Configuración completada!"
echo ""
echo "🚀 Para iniciar la aplicación:"
echo "1. Backend: cd backend && npm start"
echo "2. Frontend: cd frontend && python -m http.server 8080"
echo "3. Abre http://localhost:8080 en tu navegador"
echo ""
echo "📝 No olvides configurar tus credenciales de Bold en backend/.env" 
