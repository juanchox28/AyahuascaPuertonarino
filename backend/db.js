import Database from "better-sqlite3";

const db = new Database("./database.sqlite");

// Tabla de reservas
db.prepare(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reference TEXT UNIQUE,
    name TEXT,
    email TEXT,
    checkIn TEXT,
    checkOut TEXT,
    guests INTEGER,
    room TEXT,
    amount INTEGER,
    status TEXT,
    created TEXT
  )
`).run();

// Tabla de habitaciones
db.prepare(`
  CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    price INTEGER
  )
`).run();

// Insertar habitaciones por defecto si no existen
const rooms = [
  { name: "standard", price: 150000 },
  { name: "deluxe", price: 250000 },
  { name: "suite", price: 400000 },
];

for (const r of rooms) {
  const exists = db.prepare("SELECT 1 FROM rooms WHERE name = ?").get(r.name);
  if (!exists) {
    db.prepare("INSERT INTO rooms (name, price) VALUES (?, ?)").run(r.name, r.price);
  }
}

export default db;
