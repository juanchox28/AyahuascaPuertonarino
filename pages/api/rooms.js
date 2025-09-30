import { rooms } from '../../lib/database';

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json(rooms);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}