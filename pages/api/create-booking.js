import { bookings } from '../../lib/database';
import fetch from 'node-fetch';

const WOMPI_BASE = process.env.WOMPI_BASE || "https://sandbox.wompi.co/v1";
const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { name, email, amount, checkIn, checkOut, guests, room } = req.body;

      if (!WOMPI_PRIVATE_KEY) {
        return res.status(500).json({
          ok: false,
          error: "Wompi private key not configured",
          message: "Please set WOMPI_PRIVATE_KEY in .env file"
        });
      }

      const reference = `BK-${Date.now()}`;

      const booking = {
        id: bookings.length + 1,
        reference,
        name,
        email,
        amount,
        checkIn,
        checkOut,
        guests,
        room,
        status: "pending",
        created: new Date().toISOString(),
      };

      bookings.push(booking);

      const payload = {
        name: `Reserva Hotel Paraiso Ayahuasca - ${reference}`,
        amount_in_cents: Math.round(amount * 100),
        currency: "COP",
        single_use: true,
        description: `Reserva para ${name} - ${checkIn} a ${checkOut} - ${guests} huésped(es)`,
        redirect_url: `${FRONTEND_URL}/success?reference=${reference}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&room=${encodeURIComponent(room)}&amount=${amount}`,
        collect_shipping: false,
      };

      const wompiRes = await fetch(`${WOMPI_BASE}/payment_links`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const wompiData = await wompiRes.json();

      if (wompiData.data && wompiData.data.id) {
        const updatedBooking = {
          ...booking,
          wompi_payment_id: wompiData.data.id,
          checkout_url: `https://checkout.wompi.co/l/${wompiData.data.id}`,
          status: "payment_pending"
        };

        const bookingIndex = bookings.findIndex(b => b.reference === reference);
        if (bookingIndex !== -1) {
          bookings[bookingIndex] = updatedBooking;
        }

        res.status(200).json({
          ok: true,
          booking: updatedBooking,
          checkout_url: `https://checkout.wompi.co/l/${wompiData.data.id}`,
          wompi_response: wompiData
        });
      } else {
        const updatedBooking = {
          ...booking,
          status: "payment_failed",
          error: wompiData.error || "Unknown error from Wompi"
        };

        const bookingIndex = bookings.findIndex(b => b.reference === reference);
        if (bookingIndex !== -1) {
          bookings[bookingIndex] = updatedBooking;
        }

        res.status(400).json({
          ok: false,
          booking: updatedBooking,
          error: wompiData.error || "Failed to create payment link",
          wompi_response: wompiData
        });
      }
    } catch (err) {
      res.status(500).json({
        ok: false,
        error: err.message,
        details: "Internal server error"
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}