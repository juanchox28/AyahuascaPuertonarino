#!/bin/bash

echo "🔧 Arreglando configuración rápida..."

# Create missing directories if they don't exist
mkdir -p frontend

# Create .env.example in backend
echo "📝 Creando .env.example..."
cat > backend/.env.example << 'EOF'
# Bold API Configuration
BOLD_API_KEY=your_bold_api_key_here
RETURN_URL=http://localhost:8080/success.html

# Server Configuration
PORT=3000
NODE_ENV=development

# Database (if using)
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=hotel_booking
# DB_USER=your_db_user
# DB_PASS=your_db_password
EOF

# Create .env file
echo "🔑 Creando archivo .env..."
cp backend/.env.example backend/.env

# Install missing dependencies
echo "📦 Instalando dependencias faltantes..."
cd backend
npm install cors
npm install

# Go back to root
cd ..

# Create frontend files if they don't exist
echo "🎨 Creando archivos frontend..."

# Create index.html
cat > frontend/index.html << 'EOF'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hotel Paradise - Reservas</title>
    <link rel="stylesheet" href="styles.css">
    <script crossorigin src="https://unpkg.com/react@17/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
    <div id="root">
        <div class="loading">
            <h1>🏨 Cargando Hotel Paradise...</h1>
            <p>Preparando tu experiencia de reserva</p>
        </div>
    </div>
    
    <script type="text/babel">
        const { useState, useEffect } = React;

        const HotelBookingApp = () => {
          const [formData, setFormData] = useState({
            name: '',
            email: '',
            checkIn: '',
            checkOut: '',
            guests: 1,
            room: 'standard'
          });
          const [isLoading, setIsLoading] = useState(false);
          const [error, setError] = useState('');
          const [success, setSuccess] = useState('');
          const [backendStatus, setBackendStatus] = useState('checking');

          const roomPrices = {
            standard: 150000,
            deluxe: 250000,
            suite: 400000
          };

          // Check backend connection on load
          useEffect(() => {
            checkBackend();
          }, []);

          const checkBackend = async () => {
            try {
              const response = await fetch('http://localhost:3000/health');
              if (response.ok) {
                setBackendStatus('connected');
              } else {
                setBackendStatus('error');
              }
            } catch (err) {
              setBackendStatus('error');
              console.error('Backend connection error:', err);
            }
          };

          const handleInputChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({
              ...prev,
              [name]: value
            }));
            if (error) setError('');
            if (success) setSuccess('');
          };

          const calculateNights = () => {
            if (!formData.checkIn || !formData.checkOut) return 0;
            const checkIn = new Date(formData.checkIn);
            const checkOut = new Date(formData.checkOut);
            const diffTime = checkOut - checkIn;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays > 0 ? diffDays : 0;
          };

          const calculateTotal = () => {
            const nights = calculateNights();
            return nights * roomPrices[formData.room];
          };

          const handleSubmit = async () => {
            setIsLoading(true);
            setError('');
            setSuccess('');

            if (!formData.name || !formData.email || !formData.checkIn || !formData.checkOut) {
              setError('Por favor completa todos los campos obligatorios');
              setIsLoading(false);
              return;
            }

            if (new Date(formData.checkIn) >= new Date(formData.checkOut)) {
              setError('La fecha de salida debe ser posterior a la fecha de entrada');
              setIsLoading(false);
              return;
            }

            const total = calculateTotal();
            if (total <= 0) {
              setError('Error en el cálculo del precio');
              setIsLoading(false);
              return;
            }

            try {
              const response = await fetch('http://localhost:3000/api/create-booking', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  name: formData.name,
                  email: formData.email,
                  amount: total,
                  checkIn: formData.checkIn,
                  checkOut: formData.checkOut,
                  guests: formData.guests,
                  room: formData.room
                }),
              });

              const data = await response.json();

              if (response.ok && data.ok) {
                setSuccess(`¡Reserva creada exitosamente! Referencia: ${data.reference}`);
                if (data.checkout_url) {
                  setTimeout(() => {
                    window.open(data.checkout_url, '_blank');
                  }, 1500);
                }
              } else {
                setError(data.error || 'Error al crear la reserva');
              }
            } catch (err) {
              setError('Error de conexión con el servidor. Verifica que el backend esté corriendo.');
              console.error('Error:', err);
            } finally {
              setIsLoading(false);
            }
          };

          const formatPrice = (price) => {
            return new Intl.NumberFormat('es-CO', {
              style: 'currency',
              currency: 'COP',
              minimumFractionDigits: 0
            }).format(price);
          };

          const nights = calculateNights();
          const total = calculateTotal();

          return React.createElement('div', { className: 'app-container' },
            React.createElement('div', { className: 'container' },
              React.createElement('div', { className: 'header' },
                React.createElement('h1', null, '🏨 Hotel Paradise'),
                React.createElement('p', null, 'Tu experiencia perfecta te está esperando'),
                React.createElement('div', { 
                  className: `status ${backendStatus}`,
                  onClick: checkBackend 
                },
                  backendStatus === 'connected' ? '🟢 Backend Conectado' :
                  backendStatus === 'error' ? '🔴 Backend Desconectado (Click para reintentar)' :
                  '🟡 Verificando Backend...'
                )
              ),

              React.createElement('div', { className: 'booking-form' },
                React.createElement('h2', null, 'Haz tu reserva'),
                
                React.createElement('div', { className: 'form-grid' },
                  React.createElement('div', null,
                    React.createElement('label', null, '👤 Nombre completo *'),
                    React.createElement('input', {
                      type: 'text',
                      name: 'name',
                      value: formData.name,
                      onChange: handleInputChange,
                      placeholder: 'Tu nombre completo'
                    })
                  ),
                  React.createElement('div', null,
                    React.createElement('label', null, '📧 Email *'),
                    React.createElement('input', {
                      type: 'email',
                      name: 'email',
                      value: formData.email,
                      onChange: handleInputChange,
                      placeholder: 'tu@email.com'
                    })
                  ),
                  React.createElement('div', null,
                    React.createElement('label', null, '📅 Fecha de entrada *'),
                    React.createElement('input', {
                      type: 'date',
                      name: 'checkIn',
                      value: formData.checkIn,
                      onChange: handleInputChange,
                      min: new Date().toISOString().split('T')[0]
                    })
                  ),
                  React.createElement('div', null,
                    React.createElement('label', null, '📅 Fecha de salida *'),
                    React.createElement('input', {
                      type: 'date',
                      name: 'checkOut',
                      value: formData.checkOut,
                      onChange: handleInputChange,
                      min: formData.checkIn || new Date().toISOString().split('T')[0]
                    })
                  ),
                  React.createElement('div', null,
                    React.createElement('label', null, 'Tipo de habitación'),
                    React.createElement('select', {
                      name: 'room',
                      value: formData.room,
                      onChange: handleInputChange
                    },
                      React.createElement('option', { value: 'standard' }, `Estándar - ${formatPrice(roomPrices.standard)}`),
                      React.createElement('option', { value: 'deluxe' }, `Deluxe - ${formatPrice(roomPrices.deluxe)}`),
                      React.createElement('option', { value: 'suite' }, `Suite - ${formatPrice(roomPrices.suite)}`)
                    )
                  ),
                  React.createElement('div', null,
                    React.createElement('label', null, 'Huéspedes'),
                    React.createElement('select', {
                      name: 'guests',
                      value: formData.guests,
                      onChange: handleInputChange
                    },
                      [1, 2, 3, 4].map(num => 
                        React.createElement('option', { key: num, value: num }, 
                          `${num} huésped${num > 1 ? 'es' : ''}`
                        )
                      )
                    )
                  )
                ),

                nights > 0 && React.createElement('div', { className: 'price-summary' },
                  React.createElement('h3', null, `Total: ${formatPrice(total)} (${nights} noche${nights > 1 ? 's' : ''})`),
                  React.createElement('p', null, `${formatPrice(roomPrices[formData.room])} x ${nights} noche${nights > 1 ? 's' : ''}`)
                ),

                error && React.createElement('div', { className: 'error' }, error),
                success && React.createElement('div', { className: 'success' }, success),

                React.createElement('button', {
                  onClick: handleSubmit,
                  disabled: isLoading || nights <= 0 || backendStatus !== 'connected',
                  className: isLoading || nights <= 0 || backendStatus !== 'connected' ? 'disabled' : ''
                }, 
                  isLoading ? '⏳ Procesando...' : 
                  backendStatus !== 'connected' ? '🔴 Backend Desconectado' :
                  `💳 Reservar por ${formatPrice(total)}`
                )
              )
            )
          );
        };

        ReactDOM.render(React.createElement(HotelBookingApp), document.getElementById('root'));
    </script>
</body>
</html>
EOF

# Create styles.css
cat > frontend/styles.css << 'EOF'
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);
  min-height: 100vh;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.app-container {
  min-height: 100vh;
  padding: 2rem;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2.5rem;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.header p {
  color: #6b7280;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.status {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.status.connected {
  background-color: #10b981;
  color: white;
}

.status.error {
  background-color: #ef4444;
  color: white;
}

.status.checking {
  background-color: #f59e0b;
  color: white;
}

.booking-form {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.booking-form h2 {
  font-size: 1.5rem;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-grid label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-grid input,
.form-grid select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
}

.form-grid input:focus,
.form-grid select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.price-summary {
  background: #eff6ff;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.price-summary h3 {
  color: #2563eb;
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #16a34a;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

button {
  width: 100%;
  background: #2563eb;
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover:not(.disabled) {
  background: #1d4ed8;
}

button.disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .app-container {
    padding: 1rem;
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
}
EOF

echo ""
echo "✅ ¡Configuración completada!"
echo ""
echo "🚀 Ahora puedes ejecutar:"
echo "1. Backend: cd backend && npm start"
echo "2. Frontend: cd frontend && python3 -m http.server 8080"
echo "3. Abre http://localhost:8080 en tu navegador"
echo ""
echo "📝 Configura tus credenciales de Bold en backend/.env"
	
