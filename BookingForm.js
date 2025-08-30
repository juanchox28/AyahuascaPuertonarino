import React, { useState } from "react";

function BookingForm({ onBookingCreated }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
    room: "standard",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:3000/api/create-booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (data.ok) {
      alert(`✅ Reserva creada con referencia: ${data.booking.reference}`);
      onBookingCreated();
    } else {
      alert("❌ Error al crear la reserva");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>📅 Crear Reserva</h2>
      <label>
        Nombre:
        <input name="name" value={form.name} onChange={handleChange} required />
      </label>
      <br />

      <label>
        Email:
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />
      </label>
      <br />

      <label>
        Check-In:
        <input
          type="date"
          name="checkIn"
          value={form.checkIn}
          onChange={handleChange}
          required
        />
      </label>
      <br />

      <label>
        Check-Out:
        <input
          type="date"
          name="checkOut"
          value={form.checkOut}
          onChange={handleChange}
          required
        />
      </label>
      <br />

      <label>
        Huéspedes:
        <input
          type="number"
          name="guests"
          min="1"
          value={form.guests}
          onChange={handleChange}
          required
        />
      </label>
      <br />

      <label>
        Habitación:
        <select name="room" value={form.room} onChange={handleChange}>
          <option value="standard">Standard - $150,000</option>
          <option value="deluxe">Deluxe - $250,000</option>
          <option value="suite">Suite - $400,000</option>
        </select>
      </label>
      <br />

      <button type="submit">Reservar</button>
    </form>
  );
}

export default BookingForm;
