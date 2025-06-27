import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || '';

export async function fetchAppointments(clientId) {
  const res = await axios.get(`${API_URL}/nnia/appointments`, { params: { clientId } });
  return res.data.appointments;
}

export async function createAppointment(appointment) {
  const res = await axios.post(`${API_URL}/nnia/appointments`, appointment);
  return res.data.appointment;
}

export async function fetchAvailability(clientId) {
  const res = await axios.get(`${API_URL}/nnia/availability`, { params: { clientId } });
  return res.data.availability;
}

export async function saveAvailability({ clientId, days, hours, types }) {
  const res = await axios.post(`${API_URL}/nnia/availability`, { clientId, days, hours, types });
  return res.data.availability;
} 