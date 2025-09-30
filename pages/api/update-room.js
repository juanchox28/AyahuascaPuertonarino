import { rooms } from '../../lib/database';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { id, price, capacity } = req.body;

    if (!id) {
      return res.status(400).json({ ok: false, error: "Missing room id" });
    }

    const roomIndex = rooms.findIndex(room => room.id === parseInt(id));

    if (roomIndex === -1) {
      return res.status(404).json({ ok: false, error: "Room not found" });
    }

    rooms[roomIndex] = { ...rooms[roomIndex], price, capacity };
    res.status(200).json({ ok: true, room: rooms[roomIndex] });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}