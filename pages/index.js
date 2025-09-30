import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function HomePage() {
  const [rooms, setRooms] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState({});
  const [totalGuests, setTotalGuests] = useState(1);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [nights, setNights] = useState(0);
  const [step, setStep] = useState(1); // 1: date selection, 2: room selection, 3: booking form
  const [bookingDetails, setBookingDetails] = useState({ name: '', email: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({});

  useEffect(() => {
    fetch('/api/rooms')
      .then(res => res.json())
      .then(data => setRooms(data));
  }, []);

  const handleDateFormSubmit = (e) => {
    e.preventDefault();
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    if (checkOut <= checkIn) {
      alert('La fecha de check-out debe ser posterior al check-in');
      return;
    }
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    setNights(Math.ceil(timeDiff / (1000 * 3600 * 24)));
    setStep(2);
  };

  const handleRoomQuantityChange = (roomId, quantity) => {
    const room = rooms.find(r => r.id === roomId);
    if (quantity > 0) {
      setSelectedRooms({
        ...selectedRooms,
        [roomId]: {
          quantity,
          ...room
        }
      });
    } else {
      const newSelectedRooms = { ...selectedRooms };
      delete newSelectedRooms[roomId];
      setSelectedRooms(newSelectedRooms);
    }
  };

  const totalSelectedGuests = Object.values(selectedRooms).reduce((acc, room) => acc + room.quantity * room.capacity, 0);
  const nightlyPrice = Object.values(selectedRooms).reduce((acc, room) => acc + room.quantity * room.price, 0);
  const totalPrice = nights * nightlyPrice;

  const handleBookingFormSubmit = async (e) => {
    e.preventDefault();
    const bookingData = {
      ...bookingDetails,
      amount: totalPrice,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: totalSelectedGuests,
      room: Object.keys(selectedRooms).map(roomId => ({
        roomId,
        quantity: selectedRooms[roomId].quantity
      }))
    };

    const response = await fetch('/api/create-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });

    const result = await response.json();
    if (result.ok) {
      setModalContent(result);
      setModalOpen(true);
    } else {
      alert('Error al crear la reserva: ' + (result.error || 'Error desconocido'));
    }
  };

  const proceedToPayment = () => {
    if (modalContent.checkout_url) {
      window.open(modalContent.checkout_url, '_blank');
      setModalOpen(false);
      // Reset state
      setSelectedRooms({});
      setTotalGuests(1);
      setCheckInDate('');
      setCheckOutDate('');
      setStep(1);
    }
  };

  return (
    <>
      <Head>
        <title>Hotel Ayahuasca - Reservas</title>
      </Head>
      <header className="header">
        <div className="container">
          <h1>Paraiso Ayahuasca</h1>
          <p>Un Paraiso Verde rodeado de selva virgen y comunidades indigenas</p>
        </div>
      </header>
      <main className="main">
        <div className="container">
          {step === 1 && (
            <section className="date-selection">
              <h3>Selecciona tus fechas y huéspedes</h3>
              <form onSubmit={handleDateFormSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="checkIn">Check-in</label>
                    <input type="date" id="checkIn" value={checkInDate} onChange={e => setCheckInDate(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="checkOut">Check-out</label>
                    <input type="date" id="checkOut" value={checkOutDate} onChange={e => setCheckOutDate(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="totalGuests">Total de huéspedes</label>
                    <input type="number" id="totalGuests" value={totalGuests} onChange={e => setTotalGuests(e.target.value)} min="1" max="20" required />
                  </div>
                </div>
                <button type="submit" className="btn-primary">Buscar habitaciones disponibles</button>
              </form>
            </section>
          )}

          {step === 2 && (
            <section className="rooms-section">
              <h3>Habitaciones disponibles</h3>
              <div className="rooms-grid">
                {rooms.map(room => (
                  <div className="room-card" key={room.id}>
                    <div className="room-image">
                      <img src={room.image} alt={room.name} loading="lazy" />
                    </div>
                    <div className="room-info">
                      <h4>{room.name}</h4>
                      <div className="room-description">{room.description}</div>
                      <div className="room-price">${room.price.toLocaleString()} COP/noche</div>
                      <div className="room-capacity">Capacidad máxima: {room.capacity} persona(s)</div>
                      <div className="room-quantity">
                        <label>Cantidad:</label>
                        <div className="quantity-controls">
                          <button type="button" className="quantity-btn minus" onClick={() => handleRoomQuantityChange(room.id, (selectedRooms[room.id]?.quantity || 0) - 1)}>-</button>
                          <input type="number" value={selectedRooms[room.id]?.quantity || 0} readOnly />
                          <button type="button" className="quantity-btn plus" onClick={() => handleRoomQuantityChange(room.id, (selectedRooms[room.id]?.quantity || 0) + 1)}>+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="booking-summary">
                <h4>Resumen de tu selección</h4>
                <div>Total huéspedes seleccionados: {totalSelectedGuests}</div>
                <div>Precio por noche: ${nightlyPrice.toLocaleString()} COP</div>
              </div>
              {totalSelectedGuests >= totalGuests && (
                <button onClick={() => setStep(3)} className="btn-primary">Continuar con la reserva</button>
              )}
            </section>
          )}

          {step === 3 && (
            <section className="booking-form">
              <h3>Completa tu reserva</h3>
              <form onSubmit={handleBookingFormSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">Nombre completo</label>
                    <input type="text" id="name" value={bookingDetails.name} onChange={e => setBookingDetails({ ...bookingDetails, name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" value={bookingDetails.email} onChange={e => setBookingDetails({ ...bookingDetails, email: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="finalGuests">Total de huéspedes</label>
                    <input type="number" id="finalGuests" value={totalSelectedGuests} readOnly />
                  </div>
                </div>
                <div className="booking-details">
                  <h4>Detalles de la reserva</h4>
                  <div>Fechas: {checkInDate} - {checkOutDate}</div>
                  <div>Noches: {nights}</div>
                  <div className="price-summary">
                    <h4>Resumen de precio total</h4>
                    <div id="priceDisplay">${totalPrice.toLocaleString()} COP</div>
                  </div>
                </div>
                <button type="submit" className="btn-primary">Reservar ahora</button>
              </form>
            </section>
          )}
        </div>
      </main>

      {modalOpen && modalContent.booking && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setModalOpen(false)}>&times;</span>
            <h3>Procesando pago</h3>
            <p>Total: <strong>${modalContent.booking.amount.toLocaleString()} COP</strong></p>
            <div className="modal-actions">
              <button onClick={proceedToPayment} className="btn-primary">Ir a pagar</button>
              <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}