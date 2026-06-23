/* eslint-disable @typescript-eslint/no-explicit-any */
// components/BookingCalendar.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { getAvailableSlots, bookSlot } from '@/lib/booking-service';
import { TimeSlot } from '@/types/booking';

interface BookingCalendarProps {
  venueId: string;
  venueName: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    textDark: string;
    textLight: string;
  };
  onBookingSuccess?: () => void;
}

export const BookingCalendar = ({
  venueId,
  venueName,
  colors,
  onBookingSuccess
}: BookingCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'morning' | 'evening' | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    message: ''
  });

  // Charger les créneaux disponibles
  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true);
      try {
        const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        
        const startStr = startDate.toISOString().split('T')[0];
        const endStr = endDate.toISOString().split('T')[0];
        
        const slots = await getAvailableSlots(venueId, startStr, endStr);
        setAvailableSlots(slots);
      } catch (error) {
        console.error('Erreur chargement créneaux:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSlots();
  }, [currentMonth, venueId]);

  // Générer le calendrier
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    // Jours du mois précédent
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false
      });
    }
    
    // Jours du mois courant
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i)
      });
    }
    
    // Jours du mois suivant
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  // Vérifier si un jour a des créneaux disponibles
  const hasAvailableSlots = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return availableSlots.some(slot => slot.date === dateStr);
  };

  // Vérifier si un créneau est disponible
  const isSlotAvailable = (date: Date, period: 'morning' | 'evening') => {
    const dateStr = date.toISOString().split('T')[0];
    return availableSlots.some(slot => 
      slot.date === dateStr && slot.period === period
    );
  };

  // Gérer la sélection d'un créneau
  const handleSlotSelect = (date: Date, period: 'morning' | 'evening') => {
    const dateStr = date.toISOString().split('T')[0];
    if (!isSlotAvailable(date, period)) return;
    
    setSelectedDate(dateStr);
    setSelectedPeriod(period);
    setShowBookingForm(true);
  };

  // Gérer la soumission du formulaire
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');
    
    if (!selectedDate || !selectedPeriod) {
      setBookingError('Veuillez sélectionner un créneau');
      return;
    }
    
    if (!formData.clientName || !formData.clientEmail || !formData.clientPhone) {
      setBookingError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    setBookingLoading(true);
    
    try {
      // Trouver le slot correspondant
      const slot = availableSlots.find(s => 
        s.date === selectedDate && s.period === selectedPeriod
      );
      
      if (!slot) {
        throw new Error('Créneau non disponible');
      }
      
      // Créer la réservation
      const bookingData = {
        venueId,
        venueName,
        date: selectedDate,
        period: selectedPeriod,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        message: formData.message
      };
      
      await bookSlot(slot.id, bookingData);
      
      setBookingSuccess(true);
      setShowBookingForm(false);
      
      // Rafraîchir les créneaux
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
      if (onBookingSuccess) {
        onBookingSuccess();
      }
    } catch (error: any) {
      setBookingError(error.message || 'Erreur lors de la réservation');
    } finally {
      setBookingLoading(false);
    }
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  // Traduire la période
  const getPeriodLabel = (period: 'morning' | 'evening') => {
    return period === 'morning' ? 'Matin (8h-13h)' : 'Soir (18h-23h)';
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* En-tête */}
      <div className="p-6 border-b" style={{ borderColor: `${colors.textLight}20` }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-medium" style={{ color: colors.textDark }}>
              Disponibilités
            </h2>
            <p className="text-sm" style={{ color: colors.textLight }}>
              {venueName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const newDate = new Date(currentMonth);
                newDate.setMonth(newDate.getMonth() - 1);
                setCurrentMonth(newDate);
              }}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-medium min-w-30 text-center">
              {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={() => {
                const newDate = new Date(currentMonth);
                newDate.setMonth(newDate.getMonth() + 1);
                setCurrentMonth(newDate);
              }}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Calendrier */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin" style={{ color: colors.primary }} />
          </div>
        ) : (
          <>
            {/* Jours de la semaine */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium py-2"
                  style={{ color: colors.textLight }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Grille des jours */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const hasSlots = day.isCurrentMonth && day.date ? hasAvailableSlots(day.date) : false;
                const isToday = day.date?.toDateString() === new Date().toDateString();
                const isPast = day.date && day.date < new Date(new Date().setHours(0, 0, 0, 0));

                return (
                  <div
                    key={index}
                    className={`
                      aspect-square p-1 rounded-lg transition-all
                      ${!day.isCurrentMonth ? 'opacity-30' : ''}
                      ${hasSlots && !isPast ? 'cursor-pointer hover:shadow-md' : ''}
                      ${isPast ? 'opacity-40 cursor-not-allowed' : ''}
                    `}
                    style={{
                      background: hasSlots && !isPast ? `${colors.primary}10` : 'transparent',
                      border: isToday ? `2px solid ${colors.primary}` : '2px solid transparent'
                    }}
                  >
                    <div className="text-center">
                      <span className="text-sm font-medium" style={{ color: colors.textDark }}>
                        {day.day}
                      </span>
                    </div>
                    
                    {/* Indicateurs de créneaux */}
                    {day.isCurrentMonth && day.date && !isPast && (
                      <div className="flex justify-center gap-1 mt-1">
                        <div
                          className={`w-2 h-2 rounded-full cursor-pointer ${
                            isSlotAvailable(day.date, 'morning')
                              ? 'bg-green-500 hover:scale-125 transition-transform'
                              : 'bg-red-300'
                          }`}
                          onClick={() => {
                            if (isSlotAvailable(day.date, 'morning')) {
                              handleSlotSelect(day.date!, 'morning');
                            }
                          }}
                        />
                        <div
                          className={`w-2 h-2 rounded-full cursor-pointer ${
                            isSlotAvailable(day.date, 'evening')
                              ? 'bg-green-500 hover:scale-125 transition-transform'
                              : 'bg-red-300'
                          }`}
                          onClick={() => {
                            if (isSlotAvailable(day.date, 'evening')) {
                              handleSlotSelect(day.date!, 'evening');
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Légende */}
            <div className="flex items-center gap-6 mt-6 pt-4 border-t" style={{ borderColor: `${colors.textLight}20` }}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs" style={{ color: colors.textLight }}>Disponible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-300" />
                <span className="text-xs" style={{ color: colors.textLight }}>Indisponible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: `${colors.primary}20` }} />
                <span className="text-xs" style={{ color: colors.textLight }}>Cliquer pour réserver</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de réservation */}
      <AnimatePresence>
        {showBookingForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !bookingLoading && setShowBookingForm(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
            >
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-6 border-b" style={{ borderColor: `${colors.textLight}20` }}>
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-medium" style={{ color: colors.textDark }}>
                      Réserver un créneau
                    </h3>
                    <button
                      onClick={() => !bookingLoading && setShowBookingForm(false)}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  {selectedDate && selectedPeriod && (
                    <div className="flex items-center gap-4 mt-2 text-sm" style={{ color: colors.textLight }}>
                      <span className="flex items-center gap-1">
                        <CalendarIcon size={14} />
                        {new Date(selectedDate).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {getPeriodLabel(selectedPeriod)}
                      </span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleBookingSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.textDark }}>
                      Nom complet *
                    </label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: colors.textLight }} />
                      <input
                        type="text"
                        value={formData.clientName}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none"
                        style={{
                          borderColor: `${colors.textLight}30`,
                          background: colors.background
                        }}
                        placeholder="Votre nom"
                        required
                        disabled={bookingLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.textDark }}>
                      Email *
                    </label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: colors.textLight }} />
                      <input
                        type="email"
                        value={formData.clientEmail}
                        onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none"
                        style={{
                          borderColor: `${colors.textLight}30`,
                          background: colors.background
                        }}
                        placeholder="votre@email.com"
                        required
                        disabled={bookingLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.textDark }}>
                      Téléphone *
                    </label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: colors.textLight }} />
                      <input
                        type="tel"
                        value={formData.clientPhone}
                        onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none"
                        style={{
                          borderColor: `${colors.textLight}30`,
                          background: colors.background
                        }}
                        placeholder="Votre numéro"
                        required
                        disabled={bookingLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.textDark }}>
                      Message (optionnel)
                    </label>
                    <div className="relative">
                      <MessageSquare size={18} className="absolute left-3 top-3" style={{ color: colors.textLight }} />
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none resize-none"
                        style={{
                          borderColor: `${colors.textLight}30`,
                          background: colors.background
                        }}
                        placeholder="Informations supplémentaires..."
                        rows={3}
                        disabled={bookingLoading}
                      />
                    </div>
                  </div>

                  {bookingError && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
                      <AlertCircle size={18} />
                      {bookingError}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="flex-1 py-3 rounded-xl text-white font-medium transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                      style={{ background: colors.primary }}
                    >
                      {bookingLoading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Réservation en cours...
                        </>
                      ) : (
                        'Confirmer la réservation'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => !bookingLoading && setShowBookingForm(false)}
                      className="px-6 py-3 rounded-xl border transition-all hover:bg-gray-50"
                      style={{ borderColor: colors.primary, color: colors.primary }}
                      disabled={bookingLoading}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {bookingSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-sm w-full text-center"
            >
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-medium mb-2" style={{ color: colors.textDark }}>
                Réservation confirmée !
              </h3>
              <p className="text-sm" style={{ color: colors.textLight }}>
                Votre réservation a été envoyée avec succès. Nous vous contacterons pour confirmer.
              </p>
              <button
                onClick={() => setBookingSuccess(false)}
                className="mt-6 px-8 py-3 rounded-xl text-white font-medium transition-all hover:opacity-90"
                style={{ background: colors.primary }}
              >
                OK
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};