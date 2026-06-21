/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/immutability */
// components/admin/AdminBookings.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Calendar,
    Clock,
    Mail,
    Phone,
    MapPin,
    CheckCircle,
    XCircle,
    Loader2,
    AlertCircle,
} from "lucide-react";
import { getAllBookings, updateBooking } from "@/lib/booking-service";
import { Booking } from "@/types/booking";

export const AdminBookings = ({ colors }: { colors: any }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllBookings();
      setBookings(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: "confirmed" | "cancelled") => {
    setActionLoading(id);
    try {
      await updateBooking(id, { status });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const getFiltered = () => {
    if (filter === "all") return bookings;
    return bookings.filter(b => b.status === filter);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "pending": return { label: "En attente", color: "#FF9800", icon: AlertCircle };
      case "confirmed": return { label: "Confirmé", color: "#4CAF50", icon: CheckCircle };
      case "cancelled": return { label: "Annulé", color: "#F44336", icon: XCircle };
      default: return { label: "Inconnu", color: "#9E9E9E", icon: AlertCircle };
    }
  };

  const getPeriodLabel = (period: string) => {
    return period === "morning" ? "Matinée" : "Soirée";
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
            Réservations de Salles
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.textLight }}>
            Gérez les demandes de réservation de salles
          </p>
        </div>
        <button
          onClick={fetchBookings}
          className="px-4 py-2 rounded-lg text-sm transition-all hover:opacity-80"
          style={{ backgroundColor: colors.primary, color: "white" }}
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
          { value: "all", label: `Toutes (${bookings.length})` },
          { value: "pending", label: `En attente (${bookings.filter(b => b.status === "pending").length})` },
          { value: "confirmed", label: `Confirmées (${bookings.filter(b => b.status === "confirmed").length})` },
          { value: "cancelled", label: `Annulées (${bookings.filter(b => b.status === "cancelled").length})` },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value as typeof filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f.value ? "text-white" : ""
            }`}
            style={{
              background: filter === f.value ? colors.primary : "transparent",
              color: filter === f.value ? "white" : colors.textLight,
              border: filter === f.value ? "none" : `1px solid ${colors.textLight}30`,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="text-center py-12" style={{ color: colors.textLight }}>
          <Calendar size={48} className="mx-auto mb-4 opacity-50" />
          <p>Aucune réservation de salle {filter !== "all" ? `(${filter})` : ""}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking, idx) => {
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
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold" style={{ color: colors.textDark }}>
                        {booking.clientName}
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
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm" style={{ color: colors.textLight }}>
                      <span className="flex items-center gap-2">
                        <Calendar size={14} />
                        {new Date(booking.date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
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
                    {booking.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(booking.id, "confirmed")}
                          disabled={actionLoading === booking.id}
                          className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 flex items-center gap-2 disabled:opacity-50"
                          style={{ background: "#4CAF50" }}
                        >
                          {actionLoading === booking.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                          Confirmer
                        </button>
                        <button
                          onClick={() => updateStatus(booking.id, "cancelled")}
                          disabled={actionLoading === booking.id}
                          className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 flex items-center gap-2 disabled:opacity-50"
                          style={{ background: "#F44336" }}
                        >
                          {actionLoading === booking.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                          Annuler
                        </button>
                      </>
                    )}
                    {booking.status === "confirmed" && (
                      <button
                        onClick={() => updateStatus(booking.id, "cancelled")}
                        disabled={actionLoading === booking.id}
                        className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 flex items-center gap-2 disabled:opacity-50"
                        style={{ background: "#F44336" }}
                      >
                        {actionLoading === booking.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
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