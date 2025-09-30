import { bookings } from '../../lib/database';

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json(bookings.sort((a, b) => new Date(b.created) - new Date(a.created)));
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}