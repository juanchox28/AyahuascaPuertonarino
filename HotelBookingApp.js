import React, { useState } from 'react';

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

  const roomPrices = {
    standard: 150000,
    deluxe: 250000,
    suite: 400000
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Basic validation
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
      // Call your backend server (assuming it's running on port 3000)
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
        setSuccess(`¡Reserva creada! Referencia: ${data.reference}`);
        // Redirect to Bold checkout
        if (data.checkout_url) {
          window.open(data.checkout_url, '_blank');
        }
      } else {
        setError(data.error || 'Error al crear la reserva');
      }
    } catch (err) {
      setError('Error de conexión. Por favor intenta nuevamente.');
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

  // Simple icons using Unicode symbols (no external dependencies needed)
  const icons = {
    user: '👤',
    email: '📧',
    calendar: '📅',
    location: '📍',
    star: '⭐',
    wifi: '📶',
    car: '🚗',
    coffee: '☕',
    card: '💳'
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0' }}>
            Hotel Paradise
          </h1>
          <p style={{ color: '#6b7280', margin: 0 }}>Tu experiencia perfecta te está esperando</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
          {/* Hotel Info */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '256px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              textAlign: 'center'
            }}>
              <div>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>{icons.location}</div>
                <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Ubicación Premium</h3>
                <p style={{ margin: 0 }}>Centro de la ciudad</p>
              </div>
            </div>
            
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ color: '#fbbf24' }}>{icons.star}{icons.star}{icons.star}{icons.star}{icons.star}</span>
                <span style={{ marginLeft: '8px', color: '#6b7280' }}>5.0 (124 reseñas)</span>
              </div>

              <h4 style={{ fontWeight: '600', marginBottom: '12px' }}>Servicios incluidos:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', color: '#6b7280' }}>
                  <span style={{ marginRight: '8px' }}>{icons.wifi}</span>
                  <span>WiFi gratis</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', color: '#6b7280' }}>
                  <span style={{ marginRight: '8px' }}>{icons.car}</span>
                  <span>Estacionamiento</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', color: '#6b7280' }}>
                  <span style={{ marginRight: '8px' }}>{icons.coffee}</span>
                  <span>Desayuno</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', color: '#6b7280' }}>
                  <span style={{ marginRight: '8px' }}>{icons.card}</span>
                  <span>Pago seguro</span>
                </div>
              </div>

              <div style={{
                marginTop: '24px',
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px'
              }}>
                <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>Tipos de habitación:</h4>
                <div style={{ fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Estándar</span>
                    <span style={{ fontWeight: '600' }}>{formatPrice(roomPrices.standard)}/noche</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Deluxe</span>
                    <span style={{ fontWeight: '600' }}>{formatPrice(roomPrices.deluxe)}/noche</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Suite</span>
                    <span style={{ fontWeight: '600' }}>{formatPrice(roomPrices.suite)}/noche</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            padding: '24px'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px' }}>
              Haz tu reserva
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Personal Info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    {icons.user} Nombre completo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Tu nombre completo"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    {icons.email} Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              {/* Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    {icons.calendar} Fecha de entrada *
                  </label>
                  <input
                    type="date"
                    name="checkIn"
                    value={formData.checkIn}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    {icons.calendar} Fecha de salida *
                  </label>
                  <input
                    type="date"
                    name="checkOut"
                    value={formData.checkOut}
                    onChange={handleInputChange}
                    min={formData.checkIn || new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Room and Guests */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Tipo de habitación
                  </label>
                  <select
                    name="room"
                    value={formData.room}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="standard">Estándar - {formatPrice(roomPrices.standard)}</option>
                    <option value="deluxe">Deluxe - {formatPrice(roomPrices.deluxe)}</option>
                    <option value="suite">Suite - {formatPrice(roomPrices.suite)}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Huéspedes
                  </label>
                  <select
                    name="guests"
                    value={formData.guests}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    {[1, 2, 3, 4].map(num => (
                      <option key={num} value={num}>{num} huésped{num > 1 ? 'es' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price Summary */}
              {nights > 0 && (
                <div style={{
                  backgroundColor: '#eff6ff',
                  padding: '16px',
                  borderRadius: '8px'
                }}>
                  <h4 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                    Resumen de precios:
                  </h4>
                  <div style={{ fontSize: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>{formatPrice(roomPrices[formData.room])} x {nights} noche{nights > 1 ? 's' : ''}</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontWeight: 'bold',
                      fontSize: '18px',
                      paddingTop: '8px',
                      borderTop: '1px solid #e5e7eb'
                    }}>
                      <span>Total:</span>
                      <span style={{ color: '#2563eb' }}>{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Messages */}
              {error && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  padding: '12px 16px',
                  borderRadius: '8px'
                }}>
                  {error}
                </div>
              )}
              {success && (
                <div style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#16a34a',
                  padding: '12px 16px',
                  borderRadius: '8px'
                }}>
                  {success}
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading || nights <= 0}
                style={{
                  width: '100%',
                  backgroundColor: isLoading || nights <= 0 ? '#9ca3af' : '#2563eb',
                  color: 'white',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '16px',
                  border: 'none',
                  cursor: isLoading || nights <= 0 ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && nights > 0) {
                    e.target.style.backgroundColor = '#1d4ed8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading && nights > 0) {
                    e.target.style.backgroundColor = '#2563eb';
                  }
                }}
              >
                {isLoading ? 'Procesando...' : `Reservar por ${formatPrice(total)}`}
              </button>
            </div>

            <p style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', marginTop: '16px', margin: '16px 0 0 0' }}>
              Al hacer clic en "Reservar", serás redirigido a Bold para completar el pago de forma segura.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelBookingApp;
