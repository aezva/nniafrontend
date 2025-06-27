import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import AppointmentPreferencesForm from './AppointmentPreferencesForm';
import { fetchAppointments, fetchAvailability, saveAvailability } from '@/services/appointmentsService';
import { useAuth } from '@/contexts/AuthContext';

const DEFAULT_AVAILABILITY = { days: [], hours: '', types: ['phone', 'office', 'video'] };

export default function Citas2() {
  const { client, loading: authLoading } = useAuth();
  const [availability, setAvailability] = useState(DEFAULT_AVAILABILITY);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!client) return;
    setLoading(true);
    Promise.all([
      fetchAppointments(client.id),
      fetchAvailability(client.id)
    ])
      .then(([appts, avail]) => {
        setAppointments(Array.isArray(appts) ? appts : []);
        setAvailability(avail || DEFAULT_AVAILABILITY);
        setError(null);
      })
      .catch(() => setError('No se pudo cargar la información de citas'))
      .finally(() => setLoading(false));
  }, [client]);

  const handleSave = async () => {
    if (!client) return;
    setSaving(true);
    try {
      await saveAvailability({ ...availability, clientId: client.id });
      setError(null);
    } catch {
      setError('No se pudo guardar la disponibilidad');
    }
    setSaving(false);
  };

  if (authLoading || !client) {
    return <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Cargando...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-2">Citas</h1>
      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Cargando...</div>
      )}
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">{error}</div>
      )}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Citas Agendadas</h2>
        {appointments.length === 0 ? (
          <div className="text-muted-foreground text-center p-4 bg-yellow-50 rounded border border-yellow-200">
            <strong>No hay citas agendadas aún.</strong><br />
            Cuando NNIA o tus clientes agenden una cita, aparecerá aquí.
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appt, idx) => (
              <div key={idx} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <div className="font-semibold">{appt.name} ({appt.email})</div>
                  <div className="text-sm text-muted-foreground">{appt.type} - {appt.date} {appt.time}</div>
                  <div className="text-xs text-muted-foreground">Origen: {appt.origin}</div>
                </div>
                <div className="text-primary font-bold">{appt.status || 'Pendiente'}</div>
              </div>
            ))}
          </div>
        )}
      </section>
      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Configura tu Disponibilidad</h2>
        <AppointmentPreferencesForm
          availability={availability}
          setAvailability={setAvailability}
          saving={saving}
          onSave={handleSave}
        />
      </section>
    </div>
  );
} 