import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Phone, MapPin, Video, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAppointments, fetchAvailability, saveAvailability } from '@/services/appointmentsService';

const APPOINTMENT_TYPES = [
  { value: 'phone', label: 'Llamada Telefónica', icon: <Phone className="h-4 w-4 inline" /> },
  { value: 'office', label: 'Visita en Oficina', icon: <MapPin className="h-4 w-4 inline" /> },
  { value: 'video', label: 'Videollamada', icon: <Video className="h-4 w-4 inline" /> },
];

const WEEKDAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const Appointments = () => {
  const { client, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [availability, setAvailability] = useState({
    days: [],
    hours: '',
    types: ['phone', 'office', 'video'],
  });
  const [saving, setSaving] = useState(false);
  const [hasAvailability, setHasAvailability] = useState(false);

  useEffect(() => {
    if (!client) return;
    setLoading(true);
    Promise.all([
      fetchAppointments(client.id),
      fetchAvailability(client.id)
    ]).then(([appts, avail]) => {
      setAppointments(appts || []);
      if (avail && (avail.days || avail.hours || avail.types)) {
        setAvailability({
          days: avail.days ? avail.days.split(',') : [],
          hours: avail.hours || '',
          types: avail.types ? avail.types.split(',') : ['phone', 'office', 'video']
        });
        setHasAvailability(true);
      } else {
        setHasAvailability(false);
      }
    }).catch(() => {
      toast({ title: 'Error', description: 'No se pudo cargar la información de citas', variant: 'destructive' });
    }).finally(() => setLoading(false));
  }, [client, toast]);

  const handleAvailabilityChange = (field, value) => {
    setAvailability(prev => ({ ...prev, [field]: value }));
  };

  const handleToggleDay = (day) => {
    setAvailability(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const handleToggleType = (type) => {
    setAvailability(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }));
  };

  const handleSaveAvailability = async () => {
    setSaving(true);
    try {
      await saveAvailability({
        clientId: client.id,
        days: availability.days.join(','),
        hours: availability.hours,
        types: availability.types.join(',')
      });
      toast({ title: 'Disponibilidad guardada', description: 'Tus horarios y tipos de cita han sido actualizados.' });
    } catch {
      toast({ title: 'Error', description: 'No se pudo guardar la disponibilidad', variant: 'destructive' });
    }
    setSaving(false);
  };

  if (authLoading || loading) {
    return <div className="flex flex-col items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin mb-2" />
      <span className="text-muted-foreground">Cargando información de tu cuenta...</span>
    </div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><Calendar className="h-7 w-7" /> Citas</h1>
      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Citas Agendadas</TabsTrigger>
          <TabsTrigger value="config">Configuración de Disponibilidad</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Citas Agendadas</CardTitle>
              <CardDescription>Estas son las citas que NNIA ha agendado para ti.</CardDescription>
            </CardHeader>
            <CardContent>
              {!hasAvailability && (
                <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded">
                  <b>¡Atención!</b> Primero debes configurar tu disponibilidad (días, horarios y tipos de cita) para que NNIA pueda agendar citas para ti.
                </div>
              )}
              {appointments.length === 0 ? (
                <div className="text-muted-foreground">No hay citas agendadas aún.</div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appt, idx) => (
                    <div key={idx} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <div className="font-semibold">{appt.name} ({appt.email})</div>
                        <div className="text-sm text-muted-foreground">{APPOINTMENT_TYPES.find(t => t.value === appt.type)?.label || appt.type} - {appt.date} {appt.time}</div>
                        <div className="text-xs text-muted-foreground">Origen: {appt.origin}</div>
                      </div>
                      <div className="text-primary font-bold">{appt.status || 'Pendiente'}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configura tu Disponibilidad</CardTitle>
              <CardDescription>Elige los días, horarios y tipos de cita que NNIA puede ofrecer a tus clientes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Días disponibles</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {WEEKDAYS.map(day => (
                    <Button key={day} type="button" variant={availability.days.includes(day) ? 'default' : 'outline'} onClick={() => handleToggleDay(day)}>{day}</Button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Horarios disponibles</Label>
                <Input
                  type="text"
                  placeholder="Ej: 09:00-13:00, 15:00-18:00"
                  value={availability.hours}
                  onChange={e => handleAvailabilityChange('hours', e.target.value)}
                />
                <div className="text-xs text-muted-foreground mt-1">Puedes poner varios rangos separados por coma.</div>
              </div>
              <div>
                <Label>Tipos de cita disponibles</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {APPOINTMENT_TYPES.map(type => (
                    <Button key={type.value} type="button" variant={availability.types.includes(type.value) ? 'default' : 'outline'} onClick={() => handleToggleType(type.value)}>{type.icon} {type.label}</Button>
                  ))}
                </div>
              </div>
              <Button onClick={handleSaveAvailability} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar Disponibilidad'}</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Appointments; 