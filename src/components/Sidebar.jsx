import React from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Ticket, Briefcase, Bot, CreditCard, Settings, LogOut, ChevronRight, Calendar, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { useState, useRef, useEffect } from 'react';

const navItems = [{
  href: '/',
  label: 'Dashboard',
  icon: LayoutDashboard
}, {
  href: '/messages',
  label: 'Mensajes',
  icon: MessageSquare
}, {
  href: '/tickets',
  label: 'Tickets',
  icon: Ticket
}, {
  href: '/appointments',
  label: 'Citas',
  icon: Calendar
}, {
  href: '/my-business',
  label: 'Mi Negocio',
  icon: Briefcase
}, {
  href: '/assistant',
  label: 'Asistente IA',
  icon: Bot
}, {
  href: '/subscription',
  label: 'Suscripción',
  icon: CreditCard
}];

const Sidebar = ({
  isSidebarOpen,
  handleLogout
}) => {
  const location = useLocation();
  const { toast } = useToast();
  const { user, client } = useAuth();
  const { unreadCount, notifications, markAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotImplemented = () => {
    toast({
      title: "🚧 ¡Función en construcción!",
      description: "Esta característica aún no está implementada, ¡pero puedes solicitarla en tu próximo prompt! 🚀",
      variant: "default"
    });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <aside className={cn("fixed top-0 left-0 h-full bg-card border-r border-border z-40 transition-transform duration-300 ease-in-out", isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full", "md:translate-x-0 md:w-64")}>
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <motion.div animate={{
              rotate: [0, 15, -10, 5, 0]
            }} transition={{
              duration: 1,
              ease: "easeInOut"
            }}>
              <Bot className="h-8 w-8 text-primary" />
            </motion.div>
            <span className="text-xl font-bold">NNIA</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map(item => (
            <NavLink key={item.href} to={item.href} className={({
              isActive
            }) => cn('flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors', isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
              <item.icon className="mr-3 h-5 w-5" />
              <span>{item.label}</span>
              {location.pathname === item.href && (
                <motion.div layoutId="active-indicator" className="ml-auto">
                  <ChevronRight className="h-4 w-4" />
                </motion.div>
              )}
            </NavLink>
          ))}
          {user && (
            <li>
              <Link to="/citas2" className="sidebar-link">Citas (nuevo)</Link>
            </li>
          )}
        </nav>

        <div className="relative flex items-center justify-center my-4">
          <button className="relative p-2 rounded-full hover:bg-gray-100" onClick={() => setOpen(o => !o)} aria-label="Notificaciones">
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5">{unreadCount}</span>
            )}
          </button>
          {open && (
            <div ref={dropdownRef} className="absolute z-50 right-0 mt-2 w-80 bg-white border rounded shadow-lg max-h-96 overflow-y-auto">
              <div className="p-3 border-b font-bold">Notificaciones</div>
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">Sin notificaciones recientes.</div>
              ) : (
                <ul>
                  {notifications.slice(0, 10).map(n => (
                    <li key={n.id} className={`px-4 py-3 border-b last:border-b-0 cursor-pointer ${!n.read ? 'bg-blue-50' : ''}`}
                        onClick={() => { markAsRead(n.id); setOpen(false); }}>
                      <div className="font-semibold text-sm">{n.title}</div>
                      <div className="text-xs text-muted-foreground">{n.body}</div>
                      <div className="text-xs text-right text-gray-400">{new Date(n.created_at).toLocaleString()}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border mt-auto">
          <div className="space-y-2">
            <NavLink to="/settings" className={({
              isActive
            }) => cn('flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors', isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
              <Settings className="mr-3 h-5 w-5" />
              <span>Ajustes</span>
            </NavLink>
            <button onClick={handleLogout} className="w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <LogOut className="mr-3 h-5 w-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
          <div className="flex items-center mt-6 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer" onClick={handleNotImplemented}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={client?.profile_image_url} alt={client?.name || user?.email} />
              <AvatarFallback>{getInitials(client?.name || user?.email)}</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-semibold text-foreground">{client?.name || 'Usuario'}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;