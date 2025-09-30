import { bookings } from '../../../lib/database';
import { sendConfirmationEmail } from '../../../lib/emailService';
import fetch from 'node-fetch';

const WOMPI_BASE = process.env.WOMPI_BASE || "https://sandbox.wompi.co/v1";
const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY;

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { reference } = req.query;
      const booking = bookings.find(b => b.reference === reference);

      if (!booking) {
        return res.status(404).json({ ok: false, error: "Booking not found" });
      }

      if (booking.wompi_payment_id) {
        const paymentRes = await fetch(`${WOMPI_BASE}/transactions/${booking.wompi_payment_id}`, {
          headers: {
            Authorization: `Bearer ${process.env.WOMPI_PUBLIC_KEY}`,
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

          if (booking.status === 'confirmed') {
            await sendConfirmationEmail(booking);
          }
        }
      }

      res.status(200).json({ ok: true, booking });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}