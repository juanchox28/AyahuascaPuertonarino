 
/**
 * Integración de Embedded Checkout Bold para Hotel Paradise
 * Documentación: https://developers.bold.co/pagos-en-linea/boton-de-pagos/integracion-manual/integracion-personalizada
 */

class BoldEmbeddedCheckout {
    constructor(options = {}) {
        this.options = {
            backendUrl: options.backendUrl || 'http://localhost:3000',
            container: options.container || 'bold-checkout-container',
            onReady: options.onReady || null,
            onSuccess: options.onSuccess || null,
            onFailure: options.onFailure || null,
            onClose: options.onClose || null
        };
        
        this.checkoutInstance = null;
        this.isLoaded = false;
        this.currentSession = null;
        
        this.init();
    }

    async init() {
        await this.loadBoldScript();
        this.setupContainer();
        console.log("✅ Bold Embedded Checkout inicializado");
    }

    loadBoldScript() {
        return new Promise((resolve, reject) => {
            if (typeof BoldCheckout !== 'undefined') {
                this.isLoaded = true;
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://checkout.bold.co/library/boldPaymentButton.js';
            script.onload = () => {
                this.isLoaded = true;
                console.log('✅ Script de Bold cargado');
                resolve();
            };
            script.onerror = (error) => {
                console.error('❌ Error cargando script de Bold:', error);
                reject(error);
            };
            document.head.appendChild(script);
        });
    }

    setupContainer() {
        let container = document.getElementById(this.options.container);
        if (!container) {
            container = document.createElement('div');
            container.id = this.options.container;
            container.style.width = '100%';
            container.style.minHeight = '500px';
            container.style.border = '1px solid #e0e0e0';
            container.style.borderRadius = '8px';
            document.body.appendChild(container);
        }
        this.container = container;
    }

    async createCheckoutSession(bookingData) {
        try {
            console.log("📡 Creando sesión de checkout...", bookingData);
            
            const response = await fetch(`${this.options.backendUrl}/api/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...bookingData,
                    embedded: true
                })
            });

            const data = await response.json();
            
            if (!data.ok) {
                throw new Error(data.error || 'Error al crear sesión');
            }

            this.currentSession = data;
            return data;
        } catch (error) {
            console.error('❌ Error creando sesión:', error);
            throw error;
        }
    }

    async openCheckout(bookingData) {
        try {
            // Crear sesión primero
            const session = await this.createCheckoutSession(bookingData);
            
            if (!this.isLoaded) {
                throw new Error('Script de Bold no cargado');
            }

            // Configurar instancia de Bold Checkout :cite[2]
            this.checkoutInstance = new BoldCheckout({
                checkoutUrl: session.embedded_url || session.checkout_url,
                onReady: () => {
                    console.log('✅ Checkout listo');
                    if (this.options.onReady) this.options.onReady();
                },
                onPaymentSuccess: (data) => {
                    console.log('✅ Pago exitoso:', data);
                    if (this.options.onSuccess) this.options.onSuccess(data);
                    this.closeCheckout();
                },
                onPaymentFailure: (error) => {
                    console.error('❌ Pago fallido:', error);
                    if (this.options.onFailure) this.options.onFailure(error);
                },
                onClose: () => {
                    console.log('🔒 Checkout cerrado');
                    if (this.options.onClose) this.options.onClose();
                    this.closeCheckout();
                }
            });

            // Abrir checkout en modo embedded
            this.checkoutInstance.open({
                mode: 'embedded',
                container: this.options.container
            });

        } catch (error) {
            console.error('❌ Error abriendo checkout:', error);
            throw error;
        }
    }

    closeCheckout() {
        if (this.checkoutInstance) {
            this.checkoutInstance.close();
            this.checkoutInstance = null;
        }
        
        // Limpiar contenedor
        if (this.container) {
            this.container.innerHTML = '';
        }
    }

    getSessionStatus(sessionId) {
        return fetch(`${this.options.backendUrl}/api/checkout-session/${sessionId}`)
            .then(response => response.json());
    }

    // Métodos de utilidad
    formatPrice(amount) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
    }

    validateBookingData(data) {
        const errors = [];
        if (!data.name) errors.push('Nombre requerido');
        if (!data.email) errors.push('Email requerido');
        if (!data.amount || data.amount <= 0) errors.push('Monto inválido');
        if (!data.checkIn) errors.push('Fecha de entrada requerida');
        if (!data.checkOut) errors.push('Fecha de salida requerida');
        
        return errors;
    }
}

// Inicialización global
document.addEventListener('DOMContentLoaded', function() {
    window.HotelParadiseCheckout = new BoldEmbeddedCheckout({
        backendUrl: 'http://localhost:3000',
        container: 'bold-embedded-checkout',
        onReady: function() {
            console.log('🏨 Checkout de Hotel Paradise listo');
        },
        onSuccess: function(paymentData) {
            alert('✅ ¡Reserva confirmada! ID: ' + paymentData.reference);
            // Redirigir a página de éxito
            window.location.href = '/reserva-exitosa?reference=' + paymentData.reference;
        },
        onFailure: function(error) {
            alert('❌ Error en el pago: ' + error.message);
        },
        onClose: function() {
            console.log('Modal de checkout cerrado');
        }
    });
});