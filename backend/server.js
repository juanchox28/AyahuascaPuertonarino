import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;
const HOST = process.env.HOST || "0.0.0.0";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WOMPI_BASE = process.env.WOMPI_BASE || "https://sandbox.wompi.co/v1";
const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY;
const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY;

// CORS configuration for production
const corsOptions = {
  origin: [
    FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:3000"
  ],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '..')));

// -------------------- IN-MEMORY DATABASE --------------------
let bookings = [];
let rooms = [
  { id: 1, name: "Habitación Sencilla", price: 80000, capacity: 1 },
  { id: 2, name: "Habitación Doble", price: 120000, capacity: 2 },
  { id: 3, name: "Suite Ejecutiva", price: 200000, capacity: 3 },
  { id: 4, name: "Suite Presidencial", price: 350000, capacity: 4 }
];

// -------------------- HEALTH --------------------
app.get("/health", (req, res) => {
  res.json({ 
    ok: true, 
    host: HOST, 
    port: PORT, 
    wompi_base: WOMPI_BASE,
    has_public_key: !!WOMPI_PUBLIC_KEY,
    has_private_key: !!WOMPI_PRIVATE_KEY,
    frontend_url: FRONTEND_URL,
    environment: process.env.NODE_ENV
  });
});

// -------------------- ROOMS --------------------
app.get("/api/rooms", (req, res) => {
  res.json(rooms);
});

app.post("/api/update-room", (req, res) => {
  const { id, price, capacity } = req.body;
  if (!id) return res.status(400).json({ ok: false, error: "Missing room id" });

  const roomIndex = rooms.findIndex(room => room.id === parseInt(id));
  if (roomIndex === -1) {
    return res.status(404).json({ ok: false, error: "Room not found" });
  }

  rooms[roomIndex] = { ...rooms[roomIndex], price, capacity };
  res.json({ ok: true, room: rooms[roomIndex] });
});

// -------------------- BOOKINGS --------------------
app.get("/api/bookings", (req, res) => {
  res.json(bookings.sort((a, b) => new Date(b.created) - new Date(a.created)));
});

app.post("/api/create-booking", async (req, res) => {
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

    // Guardar en memoria
    bookings.push(booking);
    console.log("💾 Reserva creada:", booking);

    // -------------------- WOMPI CALL --------------------
    const payload = {
      name: `Reserva Hotel Paraiso Ayahuasca - ${reference}`,
      amount_in_cents: Math.round(amount * 100),
      currency: "COP",
      single_use: true,
      description: `Reserva para ${name} - ${checkIn} a ${checkOut} - ${guests} huésped(es)`,
      redirect_url: `${FRONTEND_URL}/success.html`,
      collect_shipping: false,
    };

    console.log("📡 Enviando a Wompi:", payload);

    const wompiRes = await fetch(`${WOMPI_BASE}/payment_links`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const wompiData = await wompiRes.json();
    console.log("📡 Wompi response:", wompiData);

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

      res.json({
        ok: true,
        booking: updatedBooking,
        checkout_url: `https://checkout.wompi.co/l/${wompiData.data.id}`,
        wompi_response: wompiData
      });
    } else {
      console.error("❌ Error en respuesta de Wompi:", wompiData);
      
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
    console.error("❌ Error en /api/create-booking:", err);
    res.status(500).json({ 
      ok: false, 
      error: err.message,
      details: "Internal server error" 
    });
  }
});

// Ruta para verificar estado de pago
app.get("/api/payment-status/:reference", async (req, res) => {
  try {
    const { reference } = req.params;
    const booking = bookings.find(b => b.reference === reference);
    
    if (!booking) {
      return res.status(404).json({ ok: false, error: "Booking not found" });
    }

    if (booking.wompi_payment_id) {
      const paymentRes = await fetch(`${WOMPI_BASE}/transactions/${booking.wompi_payment_id}`, {
        headers: {
          Authorization: `Bearer ${WOMPI_PUBLIC_KEY}`,
        },
      });

      const paymentData = await paymentRes.json();
      
      if (paymentData.data) {
        const statusMap = {
          'APPROVED': 'confirmed',
          'DECLINED': 'cancelled',
          'VOIDED': 'cancelled',
          'ERROR': 'payment_failed',
          'PENDING': 'pending'
        };

        booking.status = statusMap[paymentData.data.status] || 'pending';
        booking.payment_status = paymentData.data.status;
        booking.payment_data = paymentData.data;
      }
    }

    res.json({ ok: true, booking });
  } catch (err) {
    console.error("❌ Error checking payment status:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Ruta principal para servir index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Ruta de éxito para redirección de Wompi
app.get('/success.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'success.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    ok: false, 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ ok: false, error: 'Route not found' });
});

// -------------------- SERVER START --------------------
app.listen(PORT, HOST, () => {
  console.log(`✅ Backend corriendo en http://${HOST}:${PORT}`);
  console.log(`📊 ${rooms.length} habitaciones cargadas`);
  console.log(`📋 ${bookings.length} reservas en memoria`);
  console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
  console.log(`💳 Wompi Base URL: ${WOMPI_BASE}`);
  console.log(`🔑 Wompi Keys: Public=${!!WOMPI_PUBLIC_KEY}, Private=${!!WOMPI_PRIVATE_KEY}`);
  console.log(`🏭 Environment: ${process.env.NODE_ENV}`);
  
  if (!WOMPI_PRIVATE_KEY) {
    console.warn('⚠️  WOMPI_PRIVATE_KEY no está configurada. Las reservas fallarán.');
  }
});
