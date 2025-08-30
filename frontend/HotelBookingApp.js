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

     // Validation
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

   const icons = {
     user: '👤', email: '📧', calendar: '📅', location: '📍',
     star: '⭐', wifi: '📶', car: '🚗', coffee: '☕', card: '💳'
   };

   return React.createElement('div', { className: 'app-container' },
     // Backend Status Indicator
     React.createElement('div', { 
       className: `status-indicator ${backendStatus}`,
       onClick: checkBackend 
     },
       backendStatus === 'connected' ? '🟢 Backend Conectado' :
       backendStatus === 'error' ? '🔴 Backend Desconectado (Click para reintentar)' :
       '🟡 Verificando Backend...'
     ),

     React.createElement('div', { className: 'container' },
       // Header
       React.createElement('div', { className: 'header' },
         React.createElement('h1', null, '🏨 Hotel Paradise'),
         React.createElement('p', null, 'Tu experiencia perfecta te está esperando')
       ),

       React.createElement('div', { className: 'main-grid' },
         // Hotel Info Card
         React.createElement('div', { className: 'hotel-card' },
           React.createElement('div', { className: 'hotel-hero' },
             React.createElement('div', { className: 'hero-content' },
               React.createElement('div', { className: 'hero-icon' }, icons.location),
               React.createElement('h3', null, 'Ubicación Premium'),
               React.createElement('p', null, 'Centro de la ciudad')
             )
           ),
           
           React.createElement('div', { className: 'hotel-info' },
             React.createElement('div', { className: 'rating' },
               React.createElement('span', { className: 'stars' }, 
                 `${icons.star}${icons.star}${icons.star}${icons.star}${icons.star}`
               ),
               React.createElement('span', { className: 'rating-text' }, '5.0 (124 reseñas)')
             ),

             React.createElement('h4', null, 'Servicios incluidos:'),
             React.createElement('div', { className: 'services-grid' },
               React.createElement('div', { className: 'service-item' },
                 React.createElement('span', null, icons.wifi), ' WiFi gratis'
               ),
               React.createElement('div', { className: 'service-item' },
                 React.createElement('span', null, icons.car), ' Estacionamiento'
               ),
               React.createElement('div', { className: 'service-item' },
                 React.createElement('span', null, icons.coffee), ' Desayuno'
               ),
               React.createElement('div', { className: 'service-item' },
                 React.createElement('span', null, icons.card), ' Pago seguro'
               )
             ),

             React.createElement('div', { className: 'pricing-info' },
               React.createElement('h4', null, 'Tipos de habitación:'),
               React.createElement('div', { className: 'price-list' },
                 React.createElement('div', { className: 'price-item' },
                   React.createElement('span', null, 'Estándar'),
                   React.createElement('span', { className: 'price' }, `${formatPrice(roomPrices.standard)}/noche`)
                 ),
                 React.createElement('div', { className: 'price-item' },
                   React.createElement('span', null, 'Deluxe'),
                   React.createElement('span', { className: 'price' }, `${formatPrice(roomPrices.deluxe)}/noche`)
                 ),
                 React.createElement('div', { className: 'price-item' },
                   React.createElement('span', null, 'Suite'),
                   React.createElement('span', { className: 'price' }, `${formatPrice(roomPrices.suite)}/noche`)
                 )
               )
             )
           )
         ),

         // Booking Form Card
         React.createElement('div', { className: 'booking-card' },
           React.createElement('h2', null, 'Haz tu reserva'),
           
           React.createElement('div', { className: 'form-container' },
             // Personal Info
             React.createElement('div', { className: 'form-row' },
               React.createElement('div', { className: 'form-field' },
                 React.createElement('label', null, `${icons.user} Nombre completo *`),
                 React.createElement('input', {
                   type: 'text',
                   name: 'name',
                   value: formData.name,
                   onChange: handleInputChange,
                   placeholder: 'Tu nombre completo'
                 })
               ),
               React.createElement('div', { className: 'form-field' },
                 React.createElement('label', null, `${icons.email} Email *`),
                 React.createElement('input', {
                   type: 'email',
                   name: 'email',
                   value: formData.email,
                   onChange: handleInputChange,
                   placeholder: 'tu@email.com'
                 })
               )
             ),

             // Dates
             React.createElement('div', { className: 'form-row' },
               React.createElement('div', { className: 'form-field' },
                 React.createElement('label', null, `${icons.calendar} Fecha de entrada *`),
                 React.createElement('input', {
                   type: 'date',
                   name: 'checkIn',
                   value: formData.checkIn,
                   onChange: handleInputChange,
                   min: new Date().toISOString().split('T')[0]
                 })
               ),
               React.createElement('div', { className: 'form-field' },
                 React.createElement('label', null, `${icons.calendar} Fecha de salida *`),
                 React.createElement('input', {
                   type: 'date',
                   name: 'checkOut',
                   value: formData.checkOut,
                   onChange: handleInputChange,
                   min: formData.checkIn || new Date().toISOString().split('T')[0]
                 })
               )
             ),

             // Room and Guests
             React.createElement('div', { className: 'form-row' },
               React.createElement('div', { className: 'form-field' },
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
               React.createElement('div', { className: 'form-field' },
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

             // Price Summary
             nights > 0 && React.createElement('div', { className: 'price-summary' },
               React.createElement('h4', null, 'Resumen de precios:'),
               React.createElement('div', { className: 'price-breakdown' },
                 React.createElement('div', { className: 'price-line' },
                   React.createElement('span', null, `${formatPrice(roomPrices[formData.room])} x ${nights} noche${nights > 1 ? 's' : ''}`),
                   React.createElement('span', null, formatPrice(total))
                 ),
                 React.createElement('div', { className: 'total-line' },
                   React.createElement('span', null, 'Total:'),
                   React.createElement('span', { className: 'total-price' }, formatPrice(total))
                 )
               )
             ),

             // Messages
             error && React.createElement('div', { className: 'error-message' }, error),
             success && React.createElement('div', { className: 'success-message' }, success),

             // Submit Button
             React.createElement('button', {
               onClick: handleSubmit,
               disabled: isLoading || nights <= 0 || backendStatus !== 'connected',
               className: `submit-button ${isLoading || nights <= 0 || backendStatus !== 'connected' ? 'disabled' : ''}`
             }, 
               isLoading ? '⏳ Procesando...' : 
               backendStatus !== 'connected' ? '🔴 Backend Desconectado' :
               `💳 Reservar por ${formatPrice(total)}`
             ),

             React.createElement('p', { className: 'disclaimer' },
               'Al hacer clic en "Reservar", serás redirigido a Bold para completar el pago de forma segura.'
             )
           )
         )
       )
     )
   );
 }; 
