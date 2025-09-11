class HotelBookingApp {
    constructor() {
        this.rooms = [];
        this.selectedRooms = {};
        this.totalGuests = 0;
        this.totalPrice = 0;
        this.checkInDate = null;
        this.checkOutDate = null;
        this.nights = 0;
        this.baseURL = window.location.origin;
			this.baseURL = import.meta.env.PROD ? 'https://ayahuascapuertonarino.fly.dev' : '';
       
        this.init();
    }

    async init() {
        await this.loadRooms();
        this.setupEventListeners();
        this.setupDateValidation();
        this.checkBackendHealth();
    }

    async checkBackendHealth() {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            const health = await response.json();
            console.log('Backend health:', health);
            
            if (!health.has_private_key) {
                console.warn('Wompi private key not configured. Payments will fail.');
            }
        } catch (error) {
            console.error('Backend health check failed:', error);
        }
    }

    async loadRooms() {
        try {
            this.rooms = [
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
        } catch (error) {
            console.error('Error loading rooms:', error);
        }
    }

    setupEventListeners() {
        // Date form submission
        const dateForm = document.getElementById('dateForm');
        if (dateForm) {
            dateForm.addEventListener('submit', (e) => this.handleDateFormSubmit(e));
        }

        // Room selection events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quantity-btn')) {
                this.handleQuantityChange(e);
            }
        });

        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('quantity-input')) {
                this.handleInputChange(e);
            }
        });

        // Booking form submission
        setTimeout(() => {
            const bookingForm = document.getElementById('bookingForm');
            if (bookingForm) {
                bookingForm.addEventListener('submit', (e) => this.handleSubmit(e));
            }
        }, 100);

        // Modal events
        setTimeout(() => {
            const closeBtn = document.querySelector('.close');
            const cancelBtn = document.getElementById('cancelPayment');
            const paymentBtn = document.getElementById('goToPayment');

            if (closeBtn) closeBtn.addEventListener('click', () => this.hideModal());
            if (cancelBtn) cancelBtn.addEventListener('click', () => this.hideModal());
            if (paymentBtn) paymentBtn.addEventListener('click', () => this.proceedToPayment());
        }, 100);

        // Date picker events
        const checkInInput = document.getElementById('checkIn');
        const checkOutInput = document.getElementById('checkOut');
        
        if (checkInInput) {
            checkInInput.addEventListener('click', () => this.openDatePicker('checkIn'));
            checkInInput.addEventListener('change', () => this.updateCheckoutMinDate());
        }
        
        if (checkOutInput) {
            checkOutInput.addEventListener('click', () => this.openDatePicker('checkOut'));
        }
    }

    setupDateValidation() {
        const today = new Date().toISOString().split('T')[0];
        const checkIn = document.getElementById('checkIn');
        const checkOut = document.getElementById('checkOut');
        
        if (checkIn) checkIn.min = today;
        if (checkOut) checkOut.min = today;
    }

    updateCheckoutMinDate() {
        const checkIn = document.getElementById('checkIn');
        const checkOut = document.getElementById('checkOut');
        
        if (checkIn.value && checkOut) {
            const checkInDate = new Date(checkIn.value);
            const nextDay = new Date(checkInDate);
            nextDay.setDate(checkInDate.getDate() + 1);
            checkOut.min = nextDay.toISOString().split('T')[0];
            
            // Reset checkout if it's before the new min date
            if (checkOut.value && new Date(checkOut.value) <= checkInDate) {
                checkOut.value = '';
            }
        }
    }

    openDatePicker(field) {
        const input = document.getElementById(field);
        if (input) {
            input.showPicker();
        }
    }

    handleDateFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        this.checkInDate = new Date(data.checkIn);
        this.checkOutDate = new Date(data.checkOut);
        this.totalGuests = parseInt(data.totalGuests);
        
        if (this.checkOutDate <= this.checkInDate) {
            alert('La fecha de check-out debe ser posterior al check-in');
            return;
        }
        
        this.nights = Math.ceil((this.checkOutDate - this.checkInDate) / (1000 * 60 * 60 * 24));
        
        this.showRoomsSection();
        this.displayRooms();
    }

    showRoomsSection() {
        const dateSection = document.getElementById('dateSelectionSection');
        const roomsSection = document.getElementById('roomsSection');
        
        if (dateSection && roomsSection) {
            dateSection.classList.add('hidden');
            roomsSection.classList.remove('hidden');
            roomsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    displayRooms() {
        const grid = document.getElementById('roomsGrid');
        if (!grid) return;
        
        grid.innerHTML = '';

        this.rooms.forEach(room => {
            const card = document.createElement('div');
            card.className = 'room-card';
            card.innerHTML = `
                <div class="room-image">
                    <img src="${room.image}" alt="${room.name}" loading="lazy">
                </div>
                <div class="room-info">
                    <h4>${room.name}</h4>
                    <div class="room-description">${room.description}</div>
                    <div class="room-price">$${room.price.toLocaleString()} COP/noche</div>
                    <div class="room-capacity">Capacidad máxima: ${room.capacity} persona(s)</div>
                    <div class="room-quantity">
                        <label>Cantidad:</label>
                        <div class="quantity-controls">
                            <button type="button" class="quantity-btn minus" data-room="${room.id}">-</button>
                            <input type="number" id="quantity-${room.id}" class="quantity-input" 
                                   min="0" max="10" value="0" data-room="${room.id}" data-capacity="${room.capacity}">
                            <button type="button" class="quantity-btn plus" data-room="${room.id}">+</button>
                        </div>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    handleQuantityChange(e) {
        const roomId = e.target.dataset.room;
        const input = document.getElementById(`quantity-${roomId}`);
        const currentValue = parseInt(input.value);
        const room = this.rooms.find(r => r.id === roomId);
        
        if (e.target.classList.contains('plus')) {
            input.value = currentValue + 1;
        } else if (e.target.classList.contains('minus') && currentValue > 0) {
            input.value = currentValue - 1;
        }
        
        this.updateRoomSelection(roomId, parseInt(input.value), room.capacity);
    }

    handleInputChange(e) {
        const roomId = e.target.dataset.room;
        const capacity = parseInt(e.target.dataset.capacity);
        let value = parseInt(e.target.value) || 0;
        
        if (value < 0) {
            value = 0;
            e.target.value = 0;
        }
        
        this.updateRoomSelection(roomId, value, capacity);
    }

    updateRoomSelection(roomId, quantity, capacity) {
        if (quantity > 0) {
            this.selectedRooms[roomId] = {
                quantity: quantity,
                capacity: capacity,
                room: this.rooms.find(r => r.id === roomId)
            };
        } else {
            delete this.selectedRooms[roomId];
        }
        
        this.updateSummary();
    }

    updateSummary() {
        this.calculateTotals();
        this.updateUI();
        this.validateSelection();
    }

    calculateTotals() {
        let selectedGuests = 0;
        let nightlyPrice = 0;
        
        Object.values(this.selectedRooms).forEach(roomData => {
            selectedGuests += roomData.quantity * roomData.capacity;
            nightlyPrice += roomData.quantity * roomData.room.price;
        });
        
        this.totalSelectedGuests = selectedGuests;
        this.nightlyPrice = nightlyPrice;
        this.totalPrice = this.nights * nightlyPrice;
    }

    updateUI() {
        const summary = document.getElementById('selectedRoomsSummary');
        const totalGuestsEl = document.getElementById('totalSelectedGuests');
        const totalPriceEl = document.getElementById('totalNightlyPrice');
        
        if (!summary || !totalGuestsEl || !totalPriceEl) return;
        
        if (Object.keys(this.selectedRooms).length === 0) {
            summary.innerHTML = 'No has seleccionado habitaciones';
            totalGuestsEl.textContent = 'Total huéspedes seleccionados: 0';
            totalPriceEl.textContent = 'Precio por noche: $0 COP';
            return;
        }
        
        let summaryHTML = '<ul>';
        Object.entries(this.selectedRooms).forEach(([roomId, roomData]) => {
            const room = roomData.room;
            summaryHTML += `
                <li>
                    ${roomData.quantity}x ${room.name} - ${roomData.quantity * roomData.capacity} huéspedes
                </li>
            `;
        });
        summaryHTML += '</ul>';
        
        summary.innerHTML = summaryHTML;
        totalGuestsEl.textContent = `Total huéspedes seleccionados: ${this.totalSelectedGuests}`;
        totalPriceEl.textContent = `Precio por noche: $${this.nightlyPrice.toLocaleString()} COP`;
        
        // Show booking form if selection is complete
        if (this.totalSelectedGuests >= this.totalGuests) {
            this.showBookingForm();
        }
    }

    validateSelection() {
        if (this.totalSelectedGuests > this.totalGuests) {
            alert(`Has seleccionado ${this.totalSelectedGuests} huéspedes pero solo necesitas ${this.totalGuests}. Por favor ajusta tu selección.`);
        }
    }

    showBookingForm() {
        const roomsSection = document.getElementById('roomsSection');
        const bookingSection = document.getElementById('bookingFormSection');
        const finalGuestsInput = document.getElementById('finalGuests');
        const bookingDates = document.getElementById('bookingDates');
        const bookingNights = document.getElementById('bookingNights');
        const priceDisplay = document.getElementById('priceDisplay');
        
        if (roomsSection && bookingSection && finalGuestsInput && bookingDates && bookingNights && priceDisplay) {
            roomsSection.classList.add('hidden');
            bookingSection.classList.remove('hidden');
            
            finalGuestsInput.value = this.totalSelectedGuests;
            bookingDates.textContent = `Fechas: ${this.checkInDate.toLocaleDateString()} - ${this.checkOutDate.toLocaleDateString()}`;
            bookingNights.textContent = `Noches: ${this.nights}`;
            priceDisplay.textContent = `$${this.totalPrice.toLocaleString()} COP`;
            
            this.updateBookingFormSummary();
            bookingSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    updateBookingFormSummary() {
        const review = document.getElementById('selectedRoomsReview');
        if (!review) return;
        
        let reviewHTML = '<h5>Habitaciones seleccionadas:</h5><ul>';
        
        Object.entries(this.selectedRooms).forEach(([roomId, roomData]) => {
            const room = roomData.room;
            const roomTotal = roomData.quantity * room.price * this.nights;
            reviewHTML += `
                <li>
                    ${roomData.quantity}x ${room.name} - $${roomTotal.toLocaleString()} COP
                </li>
            `;
        });
        reviewHTML += '</ul>';
        
        review.innerHTML = reviewHTML;
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        const bookingData = {
            name: data.name,
            email: data.email,
            amount: this.totalPrice,
            checkIn: this.checkInDate.toISOString().split('T')[0],
            checkOut: this.checkOutDate.toISOString().split('T')[0],
            guests: this.totalSelectedGuests,
            room: Object.keys(this.selectedRooms).map(roomId => ({
                roomId,
                quantity: this.selectedRooms[roomId].quantity
            }))
        };

        try {
            const response = await fetch(`${this.baseURL}/api/create-booking`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData)
            });

            const result = await response.json();
            
            if (result.ok) {
                this.showModal(result);
            } else {
                alert('Error al crear la reserva: ' + (result.error || 'Error desconocido'));
                console.error('Booking error:', result);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al conectar con el servidor. Por favor verifica que el backend esté ejecutándose.');
        }
    }

    showModal(bookingResult) {
        const modal = document.getElementById('modal');
        const message = document.getElementById('modalMessage');
        const paymentBtn = document.getElementById('goToPayment');
        
        if (!modal || !message || !paymentBtn) return;
        
        if (bookingResult.checkout_url) {
            message.innerHTML = `
                <p>Reserva creada exitosamente. Referencia: <strong>${bookingResult.booking.reference}</strong></p>
                <p>Total: <strong>$${bookingResult.booking.amount.toLocaleString()} COP</strong></p>
                <p>Serás redirigido a Wompi para completar el pago.</p>
            `;
            this.paymentUrl = bookingResult.checkout_url;
        } else {
            message.innerHTML = `
                <p>Error al generar el link de pago. Por favor contacta al soporte.</p>
                <p>Referencia: <strong>${bookingResult.booking.reference}</strong></p>
                <p>Error: ${bookingResult.error || 'Error desconocido'}</p>
            `;
            paymentBtn.style.display = 'none';
        }
        
        modal.classList.remove('hidden');
    }

    hideModal() {
        const modal = document.getElementById('modal');
        const paymentBtn = document.getElementById('goToPayment');
        
        if (modal) modal.classList.add('hidden');
        if (paymentBtn) paymentBtn.style.display = 'block';
    }

    proceedToPayment() {
        if (this.paymentUrl) {
            window.open(this.paymentUrl, '_blank');
            this.hideModal();
            
            const form = document.getElementById('bookingForm');
            const dateForm = document.getElementById('dateForm');
            
            if (form) form.reset();
            if (dateForm) dateForm.reset();
            
            // Reset app state
            this.selectedRooms = {};
            this.totalGuests = 0;
            this.totalPrice = 0;
            this.checkInDate = null;
            this.checkOutDate = null;
            this.nights = 0;
            
            // Show date selection again
            const dateSection = document.getElementById('dateSelectionSection');
            const roomsSection = document.getElementById('roomsSection');
            const bookingSection = document.getElementById('bookingFormSection');
            
            if (dateSection) dateSection.classList.remove('hidden');
            if (roomsSection) roomsSection.classList.add('hidden');
            if (bookingSection) bookingSection.classList.add('hidden');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new HotelBookingApp();
});
