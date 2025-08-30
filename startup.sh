#!/bin/bash
echo "🚀 Iniciando aplicación Hotel Paradise..."

# Matar procesos en puertos 3000 y 8080
sudo kill -9 $(sudo lsof -ti:3000) 2>/dev/null
sudo kill -9 $(sudo lsof -ti:8080) 2>/dev/null

echo "📦 Iniciando backend..."
cd /home/numae/Escritorio/hotel-booking/backend
npm start &

echo "⏳ Esperando que backend inicie..."
sleep 3

echo "🌐 Iniciando frontend..."
cd /home/numae/Escritorio/hotel-booking
python3 -m http.server 8080 &

echo "✅ Aplicación iniciada!"
echo "📍 Backend: http://localhost:3000"
echo "📍 Frontend: http://localhost:8080"
echo "📍 Health check: http://localhost:3000/health"
