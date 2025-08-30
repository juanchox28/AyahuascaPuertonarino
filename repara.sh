#!/bin/bash
echo "🔧 Corrigiendo permisos de npm..."

# Verificar que no se ejecute como root
if [ "$EUID" -eq 0 ]; then
    echo "❌ ERROR: No ejecutar como root!"
    echo "💡 Ejecuta: exit"
    exit 1
fi

# Corregir permisos
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER ~/.node_modules
sudo chown -R $USER:$USER /home/$USER/Escritorio/hotel-booking

# Limpiar
cd /home/$USER/Escritorio/hotel-booking
rm -rf node_modules backend/node_modules package-lock.json backend/package-lock.json

# Reinstalar
echo "📦 Reinstalando dependencias..."
npm install
cd backend && npm install && cd ..

echo "✅ ¡Listo! Ahora ejecuta: npm start"
