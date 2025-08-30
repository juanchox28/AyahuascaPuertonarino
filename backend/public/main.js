const form = document.getElementById('booking-form');
const roomsSection = document.getElementById('rooms-section');
const bookingForm = document.getElementById('booking-form');
const roomsContainer = document.getElementById('rooms-container');
const payButton = document.getElementById('pay-button');
const selectedPersonsEl = document.getElementById('selected-persons');
const summary = document.getElementById('summary');
const totalPeopleEl = document.getElementById('total-people');
const totalAmountEl = document.getElementById('total-amount');

let totalPersons = 0;
let roomsData = [];
let formData = {};
let rooms = [];

// Al enviar el formulario, mostrar habitaciones
form.addEventListener('submit', async (e) => {
bookingForm.addEventListener('submit', async e => {
  e.preventDefault();
  totalPersons = parseInt(form.total_persons.value);
  roomsSection.classList.remove('hidden');
  await loadRooms();
});
  formData = Object.fromEntries(new FormData(bookingForm).entries());
  formData.total_people = parseInt(formData.total_people);

// Cargar habitaciones desde backend
async function loadRooms() {
  const res = await fetch('/api/rooms');
  roomsData = await res.json();
  roomsContainer.innerHTML = '';
  roomsContainer.style.display = 'grid';
  roomsContainer.style.gridTemplateColumns = 'repeat(auto-fill,minmax(220px,1fr))';
  roomsContainer.style.gap = '20px';

  roomsData.forEach(room => {
    const div = document.createElement('div');
    div.classList.add('room-card');
    div.innerHTML = `
      <div class="room-info">
        <img src="${room.image}" alt="${room.type}">
        <div>
          <strong>${room.type}</strong>
          <p>Capacidad: ${room.capacity} personas</p>
          <p>Precio por habitación: $${room.price.toLocaleString('es-CO')}</p>
        </div>
      </div>
      <div>
        <label>Cantidad:</label>
        <input type="number" min="0" max="${Math.ceil(totalPersons/room.capacity)}" value="0" data-id="${room.id}">
      </div>
    `;
    roomsContainer.appendChild(div);
  });

  // Escuchar cambios para actualizar resumen
  roomsContainer.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', updateSummary);
  });
  bookingForm.style.display = 'none';
  payButton.style.display = 'block';
  summary.style.display = 'block';

  updateSummary();
}

function updateSummary() {
  const inputs = roomsContainer.querySelectorAll('input[type="number"]');
  let selectedPersons = 0;
  let totalAmount = 0;

  inputs.forEach(input => {
    const room = roomsData.find(r => r.id == input.dataset.id);
    const qty = parseInt(input.value) || 0;
    selectedPersons += room.capacity * qty;
    totalAmount += room.price * qty;
  });

  selectedPersonsEl.textContent = selectedPersons;
  totalAmountEl.textContent = totalAmount.toLocaleString('es-CO');

  if (selectedPersons > totalPersons) {
    document.getElementById('summary').classList.add('overlimit');
    payButton.disabled = true;
  } else {
    document.getElementById('summary').classList.remove('overlimit');
    payButton.disabled = false;
  }
}

// Enviar datos a backend
payButton.addEventListener('click', async () => {
  const selectedRooms = [];
  roomsContainer.querySelectorAll('input[type="number"]').forEach(input => {
    const qty = parseInt(input.value);
    if (qty > 0) selectedRooms.push({ id: parseInt(input.dataset.id), quantity: qty });
  });

  if(totalSelected > formData.total_people) {
    alert(`Capacidad total excede ${formData.total_people} personas!`);
    return;
  }

 const payload = {
    name: form.name.value,
    customer_email: form.email.value,
    total_persons: totalPersons,
    rooms_selected: selectedRooms
  };

  const res = await fetch('/api/create-booking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (data.payment_link) {
    window.location.href = data.payment_link;
  } else {
    alert('Error al crear la reserva: ' + JSON.stringify(data.error));
  }
});
