/* eslint-disable react-hooks/immutability */
// components/admin/AdminBookings.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar,
  User,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

interface Booking {
  id: string;
  venueId: string;
  venueName: string;
  date: string;
  period: 'morning' | 'evening';
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export const AdminBookings = ({ colors }: { colors: any }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'bookings'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const data: Booking[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Booking);
      });
      setBookings(data);
    } catch (error) {
      console.error('Erreur chargement réservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: 'confirmed' | 'cancelled') => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status,
        updatedAt: new Date().toISOString()
      });
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status } : b
      ));
    } catch (error) {
      console.error('Erreur mise à jour:', error);
    }
  };

  const getFilteredBookings = () => {
    if (filter === 'all') return bookings;
    return bookings.filter(b => b.status === filter);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return { label: 'En attente', color: '#FF9800', icon: Clock };
      case 'confirmed':
        return { label: 'Confirmé', color: '#4CAF50', icon: CheckCircle };
      case 'cancelled':
        return { label: 'Annulé', color: '#F44336', icon: XCircle };
      default:
        return { label: 'Inconnu', color: '#9E9E9E', icon: Clock };
    }
  };

  const getPeriodLabel = (period: string) => {
    return period === 'morning' ? 'Matin (8h-13h)' : 'Soir (18h-23h)';
  };

  if (loading) {
    return <div className="text-center py-10">Chargement des réservations...</div>;
  }

  const filteredBookings = getFilteredBookings();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-medium" style={{ color: colors.textDark }}>
          Gestion des Réservations
        </h1>
        <p className="text-sm mt-1" style={{ color: colors.textLight }}>
          Gérez les demandes de réservation de salles
        </p>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'all' ? 'text-white' : ''
          }`}
          style={{
            background: filter === 'all' ? colors.primary : 'transparent',
            color: filter === 'all' ? 'white' : colors.textLight,
            border: filter === 'all' ? 'none' : `1px solid ${colors.textLight}30`
          }}
        >
          Toutes ({bookings.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'pending' ? 'text-white' : ''
          }`}
          style={{
            background: filter === 'pending' ? '#FF9800' : 'transparent',
            color: filter === 'pending' ? 'white' : colors.textLight,
            border: filter === 'pending' ? 'none' : `1px solid ${colors.textLight}30`
          }}
        >
          En attente ({bookings.filter(b => b.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilter('confirmed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'confirmed' ? 'text-white' : ''
          }`}
          style={{
            background: filter === 'confirmed' ? '#4CAF50' : 'transparent',
            color: filter === 'confirmed' ? 'white' : colors.textLight,
            border: filter === 'confirmed' ? 'none' : `1px solid ${colors.textLight}30`
          }}
        >
          Confirmées ({bookings.filter(b => b.status === 'confirmed').length})
        </button>
        <button
          onClick={() => setFilter('cancelled')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'cancelled' ? 'text-white' : ''
          }`}
          style={{
            background: filter === 'cancelled' ? '#F44336' : 'transparent',
            color: filter === 'cancelled' ? 'white' : colors.textLight,
            border: filter === 'cancelled' ? 'none' : `1px solid ${colors.textLight}30`
          }}
        >
          Annulées ({bookings.filter(b => b.status === 'cancelled').length})
        </button>
      </div>

      {/* Liste des réservations */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12" style={{ color: colors.textLight }}>
            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
            <p>Aucune réservation {filter !== 'all' ? `(${filter})` : ''}</p>
          </div>
        ) : (
          filteredBookings.map((booking, idx) => {
            const statusInfo = getStatusBadge(booking.status);
            const StatusIcon = statusInfo.icon;

            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-all"
                style={{ borderColor: `${colors.textLight}20` }}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold" style={{ color: colors.textDark }}>
                        {booking.clientName}
                      </h3>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                        style={{
                          background: `${statusInfo.color}15`,
                          color: statusInfo.color
                        }}
                      >
                        <StatusIcon size={12} />
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm" style={{ color: colors.textLight }}>
                      <span className="flex items-center gap-2">
                        <Calendar size={14} />
                        {new Date(booking.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock size={14} />
                        {getPeriodLabel(booking.period)}
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin size={14} />
                        {booking.venueName}
                      </span>
                      <span className="flex items-center gap-2">
                        <Mail size={14} />
                        {booking.clientEmail}
                      </span>
                      <span className="flex items-center gap-2">
                        <Phone size={14} />
                        {booking.clientPhone}
                      </span>
                    </div>

                    {booking.message && (
                      <p className="text-sm mt-2 p-3 rounded-lg" style={{ 
                        background: `${colors.primary}05`,
                        color: colors.textLight 
                      }}>
                        {booking.message}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                          className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 flex items-center gap-2"
                          style={{ background: '#4CAF50' }}
                        >
                          <CheckCircle size={14} />
                          Confirmer
                        </button>
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                          className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 flex items-center gap-2"
                          style={{ background: '#F44336' }}
                        >
                          <XCircle size={14} />
                          Annuler
                        </button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                        className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 flex items-center gap-2"
                        style={{ background: '#F44336' }}
                      >
                        <XCircle size={14} />
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};