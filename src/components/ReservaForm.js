// src/components/ReservaForm.js
import React, { useState } from 'react';
import { db } from '../firebase.config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

function ReservaForm() {
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    fecha: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "reservas"), {
        ...form,
        timestamp: Timestamp.now()
      });
      alert('Reserva enviada con éxito 🎉');
      setForm({ nombre: '', email: '', fecha: '' });
    } catch (error) {
      console.error("Error al guardar la reserva:", error);
      alert("Error al enviar reserva");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '0 auto' }}>
      <h2>Reservar Asesoría</h2>
      <input type="text" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" required />
      <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Correo" required />
      <input type="date" name="fecha" value={form.fecha} onChange={handleChange} required />
      <button type="submit">Enviar</button>
    </form>
  );
}

export default ReservaForm;
