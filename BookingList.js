 
import React, { useEffect, useState } from "react";

function BookingList() {
  const [bookings, setBookings] = useState([]);

  const loadBookings = () => {
    fetch("http://localhost:3000/api/bookings")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setBookings(data.bookings);
      });
  };

  useEffect(() => {
    loadBookings();
  }, []);

  return (
    <div>
      <h2>📋 Reservas Registradas</h2>
      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Referencia</th>
            <th>Cliente</th>
            <th>Email</th>
            <th>Check-In</th>
            <th>Check-Out</th>
            <th>Habitación</th>
            <th>Huéspedes</th>
            <th>Monto (COP)</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.reference}>
              <td>{b.reference}</td>
              <td>{b.name}</td>
              <td>{b.email}</td>
              <td>{b.checkIn}</td>
              <td>{b.checkOut}</td>
              <td>{b.room}</td>
              <td>{b.guests}</td>
              <td>{b.amount.toLocaleString("es-CO")}</td>
              <td>{b.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BookingList;
