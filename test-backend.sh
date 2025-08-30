#!/bin/bash

BACKEND_DIR="./backend"
SERVER_LOG="./server.log"

echo "🛑 Deteniendo procesos previos..."
pkill -f "node server.js" 2>/dev/null

echo "▶️ Iniciando backend..."
cd $BACKEND_DIR
nohup node server.js > ../server.log 2>&1 &

sleep 3

echo "📡 Haciendo request de prueba a /api/create-booking..."
curl -X POST http://localhost:3000/api/create-booking \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cliente Prueba",
    "email": "cliente@prueba.com",
    "amount": 10000,
    "checkIn": "2025-09-01",
    "checkOut": "2025-09-05"
  }'

echo -e "\n\n📜 Logs en vivo del servidor (Ctrl+C para salir):"
cd ..
tail -f server.log
