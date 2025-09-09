---
title: "Contacto"
date: 2024-01-20T10:00:00-05:00
draft: false
---

## Contáctanos

Estamos aquí para ayudarte. Ponte en contacto con nosotros para más información sobre reservas o cualquier consulta.

<div class="contact-grid">
  <div class="contact-info">
    <h3>Información de Contacto</h3>
    <p><strong>Email:</strong> paraisoayahuasca@gmail.com</p>
    <p><strong>Teléfono:</strong> +57 XXX XXX XXXX</p>
    <p><strong>Dirección:</strong> Amazonas, Colombia</p>
    
    <div class="social-links">
      <h4>Síguenos</h4>
      <a href="#" class="social-link">Instagram</a>
      <a href="#" class="social-link">Facebook</a>
      <a href="#" class="social-link">Twitter</a>
    </div>
  </div>

  <div class="contact-form">
    <h3>Envíanos un mensaje</h3>
    <form>
      <div class="form-group">
        <label for="contactName">Nombre</label>
        <input type="text" id="contactName" name="name" required>
      </div>
      <div class="form-group">
        <label for="contactEmail">Email</label>
        <input type="email" id="contactEmail" name="email" required>
      </div>
      <div class="form-group">
        <label for="contactMessage">Mensaje</label>
        <textarea id="contactMessage" name="message" rows="5" required></textarea>
      </div>
      <button type="submit" class="btn btn-primary">Enviar mensaje</button>
    </form>
  </div>
</div>

<style>
.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-top: 2rem;
}

.contact-info {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 15px;
}

.contact-form {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.social-links {
  margin-top: 2rem;
}

.social-link {
  display: inline-block;
  margin-right: 1rem;
  padding: 0.5rem 1rem;
  background: #2c5530;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  transition: background 0.3s ease;
}

.social-link:hover {
  background: #1e3e23;
}

@media (max-width: 768px) {
  .contact-grid {
    grid-template-columns: 1fr;
  }
}
</style>
