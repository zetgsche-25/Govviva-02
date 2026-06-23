import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Check, 
  Trash2, 
  X, 
  Award, 
  CheckCircle, 
  AlertTriangle, 
  MapPin, 
  Inbox,
  Loader2
} from 'lucide-react';

interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async (showLoading = false) => {
    if (!user) return;
    if (showLoading) setLoading(true);
    try {
      const data = await api.get('/notifications');
      if (data && data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Poll for live notification updates every 15 seconds
  useEffect(() => {
    if (!user) return;
    
    // Initial fetch
    fetchNotifications(true);

    const interval = setInterval(() => {
      fetchNotifications(false);
    }, 15000);

    return () => clearInterval(interval);
  }, [user]);

  // Handle marking a single notification as read
  const handleMarkAsRead = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.post(`/notifications/${id}/read`);
      // Update local state directly
      setNotifications(prev => 
        prev.map(notif => notif.id === id ? { ...notif, is_read: true } : notif)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  // Handle marking all as read
  const handleMarkAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // Handle deleting a single notification
  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      // Re-fetch to confirm counts
      fetchNotifications(false);
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  // Map icon and styling based on notification topic/title
  const getNotificationStyle = (title: string, isRead: boolean) => {
    const isCert = title.toLowerCase().includes('certificado');
    const isCancel = title.toLowerCase().includes('cancel');
    const isLoc = title.toLowerCase().includes('local') || title.toLowerCase().includes('alteraç');
    const isApprove = title.toLowerCase().includes('aprov') || title.toLowerCase().includes('inscrit') || title.toLowerCase().includes('inscriç');

    let Icon = Bell;
    let bgIcon = "bg-blue-50 text-blue-600";
    let borderStyle = "border-l-4 border-l-gov-blue";

    if (isCert) {
      Icon = Award;
      bgIcon = "bg-emerald-50 text-emerald-600";
      borderStyle = "border-l-4 border-l-emerald-500";
    } else if (isCancel) {
      Icon = AlertTriangle;
      bgIcon = "bg-rose-50 text-rose-600";
      borderStyle = "border-l-4 border-l-rose-500";
    } else if (isLoc) {
      Icon = MapPin;
      bgIcon = "bg-amber-50 text-amber-600";
      borderStyle = "border-l-4 border-l-amber-500";
    } else if (isApprove) {
      Icon = CheckCircle;
      bgIcon = "bg-teal-50 text-teal-600";
      borderStyle = "border-l-4 border-l-teal-500";
    }

    if (isRead) {
      borderStyle = "border-l-4 border-l-gray-200 border-opacity-50";
    }

    return { Icon, bgIcon, borderStyle };
  };

  if (!user) return null;

  return (
    <div id="govviva-notification-wrapper" className="relative" ref={dropdownRef}>
      {/* Target Bell Trigger Button */}
      <button
        id="notification-bell-btn"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            fetchNotifications(false); // Quick sync when opening
          }
        }}
        className={`p-3 rounded-2xl relative transition-all border outline-none ${
          isOpen
            ? 'bg-gov-blue/5 border-gov-blue/20 text-gov-blue'
            : 'bg-gray-50 border-gray-100 text-gray-400 hover:text-gov-blue hover:bg-gov-blue/5'
        }`}
        title="Central de Notificações"
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'animate-bounce' : ''}`} />
        
        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span 
            id="notification-badge-count" 
            className="absolute -top-1.5 -right-1.5 min-w-5 h-5 bg-red-500 text-white text-[9px] font-black uppercase rounded-full flex items-center justify-center px-1.5 border-2 border-white animate-in zoom-in-50"
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Popover Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="notification-dropdown-panel"
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-[24px] shadow-2xl border border-gray-100 overflow-hidden z-50 text-left outline-none"
          >
            {/* Popover Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Notificações</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Central GOVVIVA Maricá</p>
              </div>
              
              {unreadCount > 0 && (
                <button
                  id="mark-all-read-btn"
                  onClick={handleMarkAllAsRead}
                  className="text-[10px] font-black text-gov-blue hover:text-gov-blue-dark uppercase tracking-widest hover:underline transition-colors focus:outline-none"
                >
                  Limpar Novidades
                </button>
              )}
            </div>

            {/* Scrollable Viewport List */}
            <div 
              id="notification-list-container" 
              className="max-h-[350px] overflow-y-auto divide-y divide-gray-50 scrollbar-thin"
            >
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-gov-blue" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-[9px]">Buscando notificações...</span>
                </div>
              ) : notifications.length === 0 ? (
                /* Empty State */
                <div className="py-12 px-6 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                    <Inbox className="w-6 h-6 text-gray-300" />
                  </div>
                  <h4 className="text-xs font-black text-gray-800 uppercase">Histórico Vazio</h4>
                  <p className="text-[11px] text-gray-400 font-semibold mt-1 max-w-[240px]">
                    Nenhuma notificação por aqui. Quando houver avisos ou emissões, notificaremos você!
                  </p>
                </div>
              ) : (
                /* Notification List Items */
                notifications.map(notif => {
                  const { Icon, bgIcon, borderStyle } = getNotificationStyle(notif.title, notif.is_read);
                  return (
                    <div
                      key={notif.id}
                      className={`p-4 hover:bg-gray-50/70 transition-all flex gap-3 relative group ${borderStyle} ${
                        !notif.is_read ? 'bg-blue-50/5' : ''
                      }`}
                    >
                      {/* Left Badge Icon */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${bgIcon} mt-0.5`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      {/* Text details */}
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2">
                          <h5 className={`text-xs uppercase font-black tracking-tight truncate ${
                            !notif.is_read ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {notif.title}
                          </h5>
                          {!notif.is_read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-gov-blue shrink-0 animate-pulse" />
                          )}
                        </div>
                        <p className={`text-[11px] leading-relaxed mt-1 font-semibold ${
                          !notif.is_read ? 'text-gray-700' : 'text-gray-400'
                        }`}>
                          {notif.message}
                        </p>
                        <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest block mt-1.5">
                          {new Date(notif.created_at).toLocaleString('pt-BR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      {/* Mini Operations / Action Buttons */}
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 pl-2 py-1 shadow-sm rounded-lg border border-gray-100">
                        {!notif.is_read && (
                          <button
                            onClick={(e) => handleMarkAsRead(notif.id, e)}
                            className="p-1 px-1.5 hover:text-emerald-600 hover:bg-emerald-50 rounded text-gray-400 transition-colors"
                            title="Marcar como lida"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDelete(notif.id, e)}
                          className="p-1 px-1.5 hover:text-red-600 hover:bg-red-50 rounded text-gray-400 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Viewport Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 text-center text-[10px] font-bold uppercase tracking-widest text-[#004b829c]">
              <span>Portal Cidadão Maricá • GOVVIVA</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
