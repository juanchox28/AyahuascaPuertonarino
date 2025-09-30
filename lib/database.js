// -------------------- IN-MEMORY DATABASE --------------------
export let bookings = [];
export let rooms = [
    {
        id: 'dormitorio',
        name: 'Cama en Dormitorio',
        price: 50000,
        capacity: 1,
        image: 'https://conexion-amazonas.com/wp-content/uploads/2025/05/DSCF0164-scaled.jpg',
        description: 'Domritorio Compartido x 4 camas'
    },
    {
        id: 'sencilla pvt',
        name: 'Sencilla Privada',
        price: 70000,
        capacity: 1,
        image: 'https://conexion-amazonas.com/wp-content/uploads/2025/05/DSCF0150-1-scaled.jpg',
        description: 'Habitacion privada para una persona'
    },
    {
        id: 'Matrimonial Deluxe',
        name: 'Habitación Deluxe',
        price: 120000,
        capacity: 2,
        image: 'https://conexion-amazonas.com/wp-content/uploads/2025/05/IMG_20250427_105039882_HDR-1-scaled.jpg',
        description: 'suite para 2 personas'
    },
    {
        id: 'triple-familiar',
        name: 'Suite Familiar',
        price: 135000,
        capacity: 3,
        image: 'https://conexion-amazonas.com/wp-content/uploads/2025/05/DSCF02342-1-scaled.jpg',
        description: 'Espaciosa suite para familias'
    },
    {
        id: 'cuadruple-familiar',
        name: 'Suite Familiar ',
        price: 150000,
        capacity: 4,
        image: 'https://conexion-amazonas.com/wp-content/uploads/2025/05/DSCF02342-1-scaled.jpg',
        description: 'Suite con cama matrimonial+ 2 camas sencillas'
    },
    {
        id: 'Matrimonial+hamaca',
        name: 'Matrimonial con vista al rio y Hamaca',
        price: 130000,
        capacity: 2,
        image: 'https://conexion-amazonas.com/wp-content/uploads/2025/05/DSCF0202-1-scaled.jpg',
        description: 'La suite más exclusiva del hotel'
    },
    {
        id: 'Doble',
        name: 'Suite Doble Sencilla',
        price: 110000,
        capacity: 2,
        image: 'https://conexion-amazonas.com/wp-content/uploads/2025/05/DSCF02382-scaled.jpg',
        description: 'Suite con dos camas sencillas'
    }
];