import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configuración del transporter de email
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Plantilla HTML para el email de confirmación
const createConfirmationEmail = (booking) => {
  const nights = Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24));
  const totalAmount = parseInt(booking.amount).toLocaleString();
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .detail-item { margin: 10px 0; }
        .total { font-size: 1.2em; font-weight: bold; color: #667eea; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9em; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Reserva Confirmada</h1>
          <p>Hotel Paraíso Ayahuasca</p>
        </div>
        
        <div class="content">
          <h2>¡Hola ${booking.name}!</h2>
          <p>Tu reserva ha sido confirmada exitosamente. Aquí tienes los detalles:</p>
          
          <div class="booking-details">
            <h3>📋 Detalles de la Reserva</h3>
            <div class="detail-item"><strong>Referencia:</strong> ${booking.reference}</div>
            <div class="detail-item"><strong>Nombre:</strong> ${booking.name}</div>
            <div class="detail-item"><strong>Email:</strong> ${booking.email}</div>
            <div class="detail-item"><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString('es-ES')}</div>
            <div class="detail-item"><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString('es-ES')}</div>
            <div class="detail-item"><strong>Noches:</strong> ${nights}</div>
            <div class="detail-item"><strong>Huéspedes:</strong> ${booking.guests}</div>
            <div class="detail-item"><strong>Habitación:</strong> ${booking.room}</div>
            
            <div class="total">
              💰 Total Pagado: $${totalAmount} COP
            </div>
          </div>
          
          <p><strong>📍 Ubicación:</strong><br>
          Hotel Paraíso Ayahuasca<br>
          Amazonas, Putumayo, Colombia</p>
          
          <p><strong>📞 Contacto:</strong><br>
          Teléfono: +57 123 456 7890<br>
          Email: info@paraisoayahuasca.com</p>
          
          <p>¡Esperamos verte pronto para una experiencia transformadora!</p>
        </div>
        
        <div class="footer">
          <p>Este email fue enviado automáticamente. Por favor no responder.</p>
          <p>© 2024 Hotel Paraíso Ayahuasca. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Función para enviar email de confirmación
export const sendConfirmationEmail = async (booking) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️ Credenciales de email no configuradas. Skipping email send.');
      return { success: false, error: 'Email credentials not configured' };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: booking.email,
      cc: 'amazonaspuertonarino@gmail.com',
      subject: `✅ Confirmación de Reserva - ${booking.reference} - Hotel Paraíso Ayahuasca`,
      html: createConfirmationEmail(booking),
      text: `Reserva confirmada para ${booking.name}. Referencia: ${booking.reference}. Fechas: ${booking.checkIn} a ${booking.checkOut}. Huéspedes: ${booking.guests}. Total: $${booking.amount} COP.`
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('📧 Email enviado exitosamente:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    return { success: false, error: error.message };
  }
};

export default { sendConfirmationEmail };
