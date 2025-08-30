import express from "express";
import path from "path";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
import fs from "fs";
import nodemailer from "nodemailer";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const LOG_FILE = './logs.txt';

// Función de log
function log(message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}\n`;
  console.log(line);
  fs.appendFileSync("logs.txt", line);
}

// Middlewares
// Middleware
app.use(cors({ origin: "http://localhost:8080", methods: ["GET","POST"] }));
app.use(express.json());
app.use('/backend/public', express.static(path.join(process.cwd(), 'public')));

// Cargar habitaciones desde JSON externo
let rooms = [];
try {
  rooms = JSON.parse(fs.readFileSync('./rooms.json', 'utf-8'));
  log("rooms.json cargado correctamente.");
} catch (err) {
  log(`Error leyendo rooms.json: ${err.message}`);
  process.exit(1);
}

// Rutas
app.get("/api/rooms", (req, res) => res.json(rooms));

app.post("/api/create-booking", async (req, res) => {
  try {
    const { name, amount_in_cents, customer_email, room_type, check_in, check_out } = req.body;

    if (!name || !total_persons || !customer_email || !rooms_selected) {
      return res.status(400).json({ error: "Faltan datos obligatorios en la reserva" });
    }
    log(`Reserva solicitada por ${name} (${customer_email}). Monto: ${amount_in_cents/100}`);

    // Calcular monto total
    let amount_in_cents = 0;
    let total_capacity = 0;
    rooms_selected.forEach(r => {
      const room = rooms.find(x => x.id === r.id);
      if (!room) return;
      amount_in_cents += room.price * r.quantity;
      total_capacity += room.capacity * r.quantity;
    });

    if (total_capacity > total_persons) {
      return res.status(400).json({ error: `La capacidad máxima de las habitaciones (${total_capacity}) excede el total de personas (${total_persons})` });
    }

    if (amount_in_cents < 150000) {
      const msg = `Monto insuficiente para Wompi: ${amount_in_cents}`;
      log(msg);
      return res.status(400).json({ error: msg });
    }

    log(`Reserva solicitada por ${name} (${customer_email}). Total personas: ${total_persons}. Monto: ${amount_in_cents/100}`);

    // Crear link de pago Wompi
    const response = await fetch(`${process.env.WOMPI_BASE_URL}/payment_links`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WOMPI_PRIVATE_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: name || "Reserva Hotel Paradise",
        amount_in_cents,
        currency: "COP",
        description: `Reserva de ${room_type}`,
        redirect_url: process.env.RETURN_URL,
        single_use: true,
        collect_shipping: false,
        collect_customer_legal_id: false
      })
    });

    const data = await response.json();
    log(`Respuesta Wompi: ${JSON.stringify(data)}`);

    if (!data.data) {
      log("Error creando reserva en Wompi.");
      return res.status(500).json({ error: "Error creando reserva en Wompi", wompi: data });
    }

    // Enviar correo al cliente y al hotel
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      logger: true,
      debug: true
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: `${customer_email}, amazonaspuertonarino@gmail.com`,
      subject: `Nueva Reserva - ${new Date().toLocaleDateString()} - ${name} - ${room_type}`,
      html: `<h2>Reserva Confirmada</h2>
             <p>Nombre: ${name}</p>
             <p>Total personas: ${total_persons}</p>
             <p>Habitaciones:</p>
             <ul>
               ${rooms_selected.map(r => `<li>${r.quantity} x ${rooms.find(x=>x.id===r.id).type}</li>`).join('')}
             </ul>
             <p>Total: $${(amount_in_cents/100).toLocaleString('es-CO')}</p>`
    };

    try {
      await transporter.sendMail(mailOptions);
      log(`Correo enviado a ${customer_email} y hotel.`);
    } catch (mailErr) {
      log(`Error enviando correo: ${mailErr.message}`);
    }

    res.json({ payment_link: data.data.presigned_redirect_url || data.data.url });

  } catch (error) {
    log(`Error creando reserva: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get("/health", (req, res) => res.send("Backend OK"));

app.listen(PORT, () => log(`🏨 Backend Hotel Paradise corriendo en http://localhost:${PORT}`));

