import { sendConfirmationEmail } from '../../lib/emailService';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { reference, name, email, checkIn, checkOut, guests, room, amount } = req.body;

      const booking = {
        reference,
        name,
        email,
        checkIn,
        checkOut,
        guests,
        room,
        amount
      };

      const result = await sendConfirmationEmail(booking);

      if (result.success) {
        res.status(200).json({
          ok: true,
          message: 'Email enviado exitosamente',
          messageId: result.messageId
        });
      } else {
        res.status(200).json({ // Still a success from the API perspective
          ok: false,
          error: result.error,
          message: 'Email no enviado (configuración requerida)'
        });
      }
    } catch (error) {
      res.status(500).json({
        ok: false,
        error: error.message,
        message: 'Error interno del servidor'
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}