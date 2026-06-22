// components/admin/AdminPackReservations.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, User, Mail, Phone, MapPin,
  CheckCircle, XCircle, Loader2, AlertCircle,
  Package, Coffee, Palette
} from 'lucide-react';

interface PackReservation {
  id: string;
  packId: string;
  packName: string;
  venueId: string;
  venueName: string;
  date: string;
  period: 'morning' | 'evening';
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  message?: string;
  decorChoice?: {
    label: string;
    color: string;
    nappeColor: string;
    chairCoverColor: string;
  };
  juiceChoice?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export const AdminPackReservations = ({ colors }: { colors: any }) => {
  const [reservations, setReservations] = useState<PackReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/pack-reservations');
      if (!res.ok) throw new Error('Erreur lors du chargement');
      const data = await res.json();
      setReservations(data.reservations);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
    setActionLoading(id);
    try {
      const res = await fetch('/api/admin/pack-reservations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error('Erreur lors de la mise à jour');
      
      setReservations(prev => prev.map(r => 
        r.id === id ? { ...r, status } : r
      ));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const getFiltered = () => {
    if (filter === 'all') return reservations;
    return reservations.filter(r => r.status === filter);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending': return { label: 'En attente', color: '#FF9800', icon: AlertCircle };
      case 'confirmed': return { label: 'Confirmé', color: '#4CAF50', icon: CheckCircle };
      case 'cancelled': return { label: 'Annulé', color: '#F44336', icon: XCircle };
      default: return { label: 'Inconnu', color: '#9E9E9E', icon: AlertCircle };
    }
  };

  const getPeriodLabel = (period: string) => {
    return period === 'morning' ? 'Jour (16h-20h)' : 'Soir (21h-00h)';
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <Loader2 size={32} className="animate-spin mx-auto" style={{ color: colors.primary }} />
        <p className="mt-4 text-sm" style={{ color: colors.textLight }}>Chargement des réservations...</p>
      </div>
    );
  }

  const filtered = getFiltered();

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-medium" style={{ color: colors.textDark }}>
            Réservations de Packs
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.textLight }}>
            Gérez les demandes de réservation de packs (Salle + Décor / Confort / Prestige)
          </p>
        </div>
        <button
          onClick={fetchReservations}
          className="px-4 py-2 rounded-lg text-sm transition-all hover:opacity-80"
          style={{ backgroundColor: colors.primary, color: 'white' }}
        >
          🔄 Rafraîchir
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
          ❌ {error}
        </div>
      )}

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { value: 'all', label: `Toutes (${reservations.length})` },
          { value: 'pending', label: `En attente (${reservations.filter(r => r.status === 'pending').length})` },
          { value: 'confirmed', label: `Confirmées (${reservations.filter(r => r.status === 'confirmed').length})` },
          { value: 'cancelled', label: `Annulées (${reservations.filter(r => r.status === 'cancelled').length})` },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value as typeof filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f.value ? 'text-white' : ''
            }`}
            style={{
              background: filter === f.value ? colors.primary : 'transparent',
              color: filter === f.value ? 'white' : colors.textLight,
              border: filter === f.value ? 'none' : `1px solid ${colors.textLight}30`,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="text-center py-12" style={{ color: colors.textLight }}>
          <Package size={48} className="mx-auto mb-4 opacity-50" />
          <p>Aucune réservation de pack {filter !== "all" ? `(${filter === "pending" ? "En Attente" : filter === "confirmed" ? "Confirmées":"Annulées"})` : ""}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((res, idx) => {
            const statusInfo = getStatusBadge(res.status);
            const StatusIcon = statusInfo.icon;

            return (
              <motion.div
                key={res.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-all"
                style={{ borderColor: `${colors.textLight}20` }}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold" style={{ color: colors.textDark }}>
                        {res.clientName}
                      </h3>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                        style={{
                          background: `${statusInfo.color}15`,
                          color: statusInfo.color,
                        }}
                      >
                        <StatusIcon size={12} />
                        {statusInfo.label}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                        style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}
                      >
                        {res.packName}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm" style={{ color: colors.textLight }}>
                      <span className="flex items-center gap-2">
                        <Calendar size={14} />
                        {new Date(res.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock size={14} />
                        {getPeriodLabel(res.period)}
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin size={14} />
                        {res.venueName}
                      </span>
                      <span className="flex items-center gap-2">
                        <Mail size={14} />
                        {res.clientEmail}
                      </span>
                      <span className="flex items-center gap-2">
                        <Phone size={14} />
                        {res.clientPhone}
                      </span>
                    </div>

                    {/* Détails du pack */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {res.packId === 'pack1' && res.decorChoice && (
                        <span className="text-xs flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: `${colors.primary}10`, color: colors.primary }}>
                          <Palette size={12} />
                          Décor: {res.decorChoice.label}
                        </span>
                      )}
                      {res.packId === 'pack3' && res.juiceChoice && (
                        <span className="text-xs flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: `${colors.primary}10`, color: colors.primary }}>
                          <Coffee size={12} />
                          Jus: {res.juiceChoice}
                        </span>
                      )}
                    </div>

                    {res.message && (
                      <p className="text-sm mt-2 p-3 rounded-lg" style={{ 
                        background: `${colors.primary}05`,
                        color: colors.textLight 
                      }}>
                        {res.message}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {res.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(res.id, 'confirmed')}
                          disabled={actionLoading === res.id}
                          className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 flex items-center gap-2 disabled:opacity-50"
                          style={{ background: '#4CAF50' }}
                        >
                          {actionLoading === res.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                          Confirmer
                        </button>
                        <button
                          onClick={() => updateStatus(res.id, 'cancelled')}
                          disabled={actionLoading === res.id}
                          className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 flex items-center gap-2 disabled:opacity-50"
                          style={{ background: '#F44336' }}
                        >
                          {actionLoading === res.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                          Annuler
                        </button>
                      </>
                    )}
                    {res.status === 'confirmed' && (
                      <button
                        onClick={() => updateStatus(res.id, 'cancelled')}
                        disabled={actionLoading === res.id}
                        className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 flex items-center gap-2 disabled:opacity-50"
                        style={{ background: '#F44336' }}
                      >
                        {actionLoading === res.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};