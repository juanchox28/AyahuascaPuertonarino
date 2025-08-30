let roomsData = [];
let roomSelections = [];

async function loadRooms() {
  const res = await fetch("/api/rooms");
  roomsData = await res.json();
  addRoomSelection();
}

function addRoomSelection() {
  const container = document.getElementById("roomsContainer");
  const idx = roomSelections.length;

  const div = document.createElement("div");
  div.className = "room-selection";
  div.innerHTML = `
    <h4>Habitación ${idx + 1}</h4>
    <img src="${roomsData[0].img}" alt="hab" class="room-img" style="width:100px;height:80px;object-fit:cover;">
    <label>Tipo:
      <select data-type="${idx}">
        ${roomsData.map(r => `<option value="${r.id}" data-price="${r.price}" data-capacity="${r.capacity}" data-img="${r.img}">${r.name} - ${r.price.toLocaleString("es-CO")} COP (max: ${r.capacity})</option>`).join("")}
      </select>
    </label>
    <label>Huéspedes:
      <input type="number" value="1" min="1" max="${roomsData[0].capacity}" data-guests="${idx}">
    </label>
  `;

  const select = div.querySelector("select");
  const guestsInput = div.querySelector("input[type=number]");
  const img = div.querySelector("img");

  select.addEventListener("change", () => {
    const option = select.options[select.selectedIndex];
    guestsInput.max = option.dataset.capacity;
    if (parseInt(guestsInput.value) > option.dataset.capacity) guestsInput.value = option.dataset.capacity;
    img.src = option.dataset.img;
    updateTotal();
  });

  guestsInput.addEventListener("input", updateTotal);

  container.appendChild(div);
  roomSelections.push(div);
  updateTotal();
}

document.getElementById("addRoomBtn").addEventListener("click", addRoomSelection);

function calculateNights() {
  const checkIn = document.getElementById("checkIn").value;
  const checkOut = document.getElementById("checkOut").value;
  if (!checkIn || !checkOut) return 1;
  const diff = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
  return diff > 0 ? diff : 1;
}

function updateTotal() {
  const nights = calculateNights();
  let total = 0;
  roomSelections.forEach(div => {
    const select = div.querySelector("select");
    const option = select.options[select.selectedIndex];
    total += parseInt(option.dataset.price) * nights;
  });
  document.getElementById("totalPrice").textContent = total.toLocaleString("es-CO");
}

// Fechas
const today = new Date().toISOString().split("T")[0];
document.getElementById("checkIn").setAttribute("min", today);
document.getElementById("checkOut").setAttribute("min", today);

document.getElementById("checkIn").addEventListener("change", () => {
  const checkIn = document.getElementById("checkIn").value;
  document.getElementById("checkOut").setAttribute("min", checkIn);
  updateTotal();
});

document.getElementById("checkOut").addEventListener("change", updateTotal);

document.getElementById("bookingForm").addEventListener("submit", async e => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const checkIn = document.getElementById("checkIn").value;
  const checkOut = document.getElementById("checkOut").value;

  const rooms = roomSelections.map(div => {
    const select = div.querySelector("select");
    const option = select.options[select.selectedIndex];
    const guests = div.querySelector("input[type=number]").value;
    return { id: parseInt(option.value), guests: parseInt(guests) };
  });

  const total = parseInt(document.getElementById("totalPrice").textContent.replace(/\./g, ""));

  try {
    const res = await fetch("/api/create-booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, rooms, total })
    });
    const data = await res.json();

    if (data.ok && data.checkout_url) {
      window.location.href = data.checkout_url; // Redirecciona automáticamente
    } else {
      document.getElementById("result").innerHTML = `<p style="color:red">⚠️ Error creando reserva: ${JSON.stringify(data.wompi_raw)}</p>`;
    }
  } catch (err) {
    console.error(err);
    document.getElementById("result").textContent = "❌ Error en el servidor.";
  }
});

loadRooms();
