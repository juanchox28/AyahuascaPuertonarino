import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function SuccessPage() {
  const router = useRouter();
  const { query } = router;
  const [bookingDetails, setBookingDetails] = useState(null);

  useEffect(() => {
    if (router.isReady) {
      setBookingDetails(query);
      if (Object.keys(query).length > 0) {
        fetch('/api/send-confirmation-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(query),
        }).catch(error => console.error('Error sending confirmation email:', error));
      }
    }
  }, [router.isReady, query]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const diffTime = Math.abs(new Date(checkOut) - new Date(checkIn));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = bookingDetails ? calculateNights(bookingDetails.checkIn, bookingDetails.checkOut) : 0;
  const formattedAmount = bookingDetails?.amount ? `$${parseInt(bookingDetails.amount).toLocaleString()} COP` : 'N/A';

  return (
    <>
      <Head>
        <title>Pago Exitoso - Hotel Paraíso Ayahuasca</title>
      </Head>
      <header className="header">
        <div className="container">
          <h1>Paraíso Ayahuasca</h1>
          <p>Reserva Confirmada</p>
        </div>
      </header>
      <main className="main">
        <div className="container">
          <div className="success-container" style={{maxWidth: '800px', margin: '2rem auto', padding: '2rem', background: 'white', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}}>
            <div style={{fontSize: '4rem', textAlign: 'center', marginBottom: '1rem', color: '#28a745'}}>✅</div>
            <h2 style={{ textAlign: 'center', color: '#28a745' }}>¡Pago Exitoso!</h2>

            {bookingDetails ? (
              <div>
                <p style={{ textAlign: 'center', fontSize: '1.1rem' }}>Tu reserva ha sido confirmada exitosamente.</p>
                <div style={{background: '#d1ecf1', color: '#0c5460', padding: '1rem', borderRadius: '8px', margin: '1.5rem 0', textAlign: 'center', borderLeft: '4px solid #0c5460'}}>
                  <p>📧 Hemos enviado los detalles de tu reserva a tu correo electrónico <strong>{bookingDetails.email}</strong></p>
                </div>
                <div className="booking-details">
                  <h3 style={{ color: '#495057', marginBottom: '1.5rem' }}>📋 Detalles de tu reserva:</h3>
                  <div className="detail-grid">
                    <div className="detail-item"><strong>Referencia</strong><span>{bookingDetails.reference}</span></div>
                    <div className="detail-item"><strong>Nombre</strong><span>{bookingDetails.name}</span></div>
                    <div className="detail-item"><strong>Email</strong><span>{bookingDetails.email}</span></div>
                    <div className="detail-item"><strong>Check-in</strong><span>{formatDate(bookingDetails.checkIn)}</span></div>
                    <div className="detail-item"><strong>Check-out</strong><span>{formatDate(bookingDetails.checkOut)}</span></div>
                    <div className="detail-item"><strong>Noches</strong><span>{nights}</span></div>
                    <div className="detail-item"><strong>Huéspedes</strong><span>{bookingDetails.guests}</span></div>
                    <div className="detail-item"><strong>Habitación</strong><span>{bookingDetails.room}</span></div>
                  </div>
                  <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745', textAlign: 'center', margin: '1.5rem 0', padding: '1rem', background: '#d4edda', borderRadius: '8px'}}>Total: {formattedAmount}</div>
                </div>
              </div>
            ) : (
              <div style={{background: '#f8d7da', color: '#721c24', padding: '1rem', borderRadius: '8px', margin: '1.5rem 0', textAlign: 'center', borderLeft: '4px solid #dc3545'}}>
                <h3>⚠️ Cargando información de la reserva...</h3>
              </div>
            )}

            <div className="actions" style={{display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem'}}>
              <Link href="/" className="btn-primary">Hacer otra reserva</Link>
              <button onClick={() => window.print()} className="btn-secondary">Imprimir confirmación</button>
              <a href={`mailto:amazonaspuertonarino@gmail.com?subject=Consulta Reserva %23${bookingDetails?.reference || ''}`} className="btn-secondary">Contactar soporte</a>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}