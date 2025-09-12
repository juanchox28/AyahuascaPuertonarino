---
title: "Reservas"
date: 2024-01-20T10:00:00-05:00
draft: false
---

<section class="booking-section">
  <div class="container">
    <div class="date-selection" id="dateSelectionSection">
      <h3>Selecciona tus fechas y huéspedes</h3>
      <form id="dateForm">
        <div class="form-grid">
          <div class="form-group">
            <label for="checkIn">Check-in</label>
            <input type="date" id="checkIn" name="checkIn" required>
          </div>
          <div class="form-group">
            <label for="checkOut">Check-out</label>
            <input type="date" id="checkOut" name="checkOut" required>
          </div>
          <div class="form-group">
            <label for="totalGuests">Total de huéspedes</label>
            <input type="number" id="totalGuests" name="totalGuests" min="1" max="20" required>
          </div>
        </div>
        <button type="submit" class="btn btn-primary">Buscar habitaciones disponibles</button>
      </form>
    </div>

    <div class="rooms-section hidden" id="roomsSection">
      <h3>Habitaciones disponibles</h3>
      <div class="rooms-grid" id="roomsGrid"></div>
      
      <div class="booking-summary">
        <h4>Resumen de tu selección</h4>
        <div id="selectedRoomsSummary">No has seleccionado habitaciones</div>
        <div id="totalSelectedGuests">Total huéspedes seleccionados: 0</div>
        <div id="totalNightlyPrice">Precio por noche: $0 COP</div>
      </div>
    </div>

    <div class="booking-form hidden" id="bookingFormSection">
      <h3>Completa tu reserva</h3>
      <form id="bookingForm">
        <div class="form-grid">
          <div class="form-group">
            <label for="name">Nombre completo</label>
            <input type="text" id="name" name="name" required>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required>
          </div>
          <div class="form-group">
            <label for="finalGuests">Total de huéspedes</label>
            <input type="number" id="finalGuests" name="finalGuests" min="1" readonly>
          </div>
        </div>
        
        <div class="booking-details">
          <h4>Detalles de la reserva</h4>
          <div id="bookingDates">Fechas: </div>
          <div id="bookingNights">Noches: 0</div>
          <div id="selectedRoomsReview"></div>
          
          <div class="price-summary">
            <h4>Resumen de precio total</h4>
            <div id="priceDisplay">$0 COP</div>
          </div>
        </div>
        
        <button type="submit" class="btn btn-primary">Reservar ahora</button>
      </form>
    </div>
  </div>
</section>

<div id="modal" class="modal hidden">
  <div class="modal-content">
    <span class="close">&times;</span>
    <h3>Procesando pago</h3>
    <p id="modalMessage">Redirigiendo a Wompi para completar el pago...</p>
    <div class="modal-actions">
      <button id="goToPayment" class="btn btn-primary">Ir a pagar</button>
      <button id="cancelPayment" class="btn btn-secondary">Cancelar</button>
    </div>
  </div>
</div>

<script type="module" src="/js/booking.js"></script>

<style>
.booking-section {
  padding: 2rem 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-group input {
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.hidden {
  display: none;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.room-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 10px;
  border: 2px solid #e9ecef;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
</style>
