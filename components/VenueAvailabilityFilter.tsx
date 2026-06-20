/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
// components/VenueAvailabilityFilter.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Search, X, Filter, Users, DollarSign, Clock } from "lucide-react";

export interface VenueFilterValue {
  date: string;
  period: "morning" | "evening" | null;
  maxBudget: number | null;
  minGuests: number | null;
  maxGuests: number | null;
}

interface VenueAvailabilityFilterProps {
  colors: any;
  value: VenueFilterValue;
  onChange: (value: VenueFilterValue) => void;
  onSearch: () => void;
  onReset: () => void;
  isFiltering: boolean;
  resultsCount: number;
  loading: boolean;
}

export const VenueAvailabilityFilter = ({
  colors,
  value,
  onChange,
  onSearch,
  onReset,
  isFiltering,
  resultsCount,
  loading,
}: VenueAvailabilityFilterProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localGuestsMin, setLocalGuestsMin] = useState<string>("");
  const [localGuestsMax, setLocalGuestsMax] = useState<string>("");
  const [localBudget, setLocalBudget] = useState<string>("");

  // Synchroniser les valeurs locales avec le state parent
  useEffect(() => {
    setLocalGuestsMin(value.minGuests?.toString() || "");
    setLocalGuestsMax(value.maxGuests?.toString() || "");
    setLocalBudget(value.maxBudget?.toString() || "");
  }, [value]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, date: e.target.value });
  };

  const handlePeriodChange = (period: "morning" | "evening" | null) => {
    onChange({ ...value, period });
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value ? Number(e.target.value) : null;
    setLocalBudget(e.target.value);
    onChange({ ...value, maxBudget: val });
  };

  const handleMinGuestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value ? Number(e.target.value) : null;
    setLocalGuestsMin(e.target.value);
    onChange({ ...value, minGuests: val });
  };

  const handleMaxGuestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value ? Number(e.target.value) : null;
    setLocalGuestsMax(e.target.value);
    onChange({ ...value, maxGuests: val });
  };

  const isSearchDisabled = !value.date || !value.period;

  return (
    <div className="py-8 px-4 md:px-10 max-w-350 mx-auto">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ borderBottom: isExpanded ? `1px solid ${colors.primary}20` : "none" }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: `${colors.primary}15` }}>
              <Filter size={18} style={{ color: colors.primary }} />
            </div>
            <div>
              <h3 className="text-sm font-medium" style={{ color: colors.textDark }}>
                Filtrer les salles disponibles
              </h3>
              <p className="text-xs" style={{ color: colors.textLight }}>
                {isFiltering 
                  ? `${resultsCount} salle${resultsCount > 1 ? "s" : ""} disponible${resultsCount > 1 ? "s" : ""}`
                  : "Trouvez la salle parfaite pour votre événement"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isFiltering && (
              <span
                className="px-2 py-1 rounded-full text-[10px] font-medium"
                style={{ background: `${colors.primary}15`, color: colors.primary }}
              >
                {resultsCount} résultats
              </span>
            )}
            <motion.button
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="p-1.5 rounded-full hover:bg-gray-100"
            >
              <ChevronDown size={18} style={{ color: colors.textLight }} />
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="px-6 pb-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Date */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: colors.textDark }}>
                    <Calendar size={12} className="inline mr-1" />
                    {"Date de l'événement *"}
                  </label>
                  <input
                    type="date"
                    value={value.date}
                    onChange={handleDateChange}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: value.date ? colors.primary : `${colors.textLight}30` }}
                  />
                </div>

                {/* Créneau */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: colors.textDark }}>
                    <Clock size={12} className="inline mr-1" />
                    Créneau horaire *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handlePeriodChange("morning")}
                      className={`py-2 rounded-xl text-xs font-medium transition-all ${
                        value.period === "morning"
                          ? "text-white"
                          : "border-2 hover:border-gray-300"
                      }`}
                      style={{
                        background: value.period === "morning" ? colors.primary : "white",
                        borderColor: value.period === "morning" ? colors.primary : `${colors.textLight}20`,
                        color: value.period === "morning" ? "white" : colors.textDark,
                      }}
                    >
                      ☀️ Matin
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePeriodChange("evening")}
                      className={`py-2 rounded-xl text-xs font-medium transition-all ${
                        value.period === "evening"
                          ? "text-white"
                          : "border-2 hover:border-gray-300"
                      }`}
                      style={{
                        background: value.period === "evening" ? colors.primary : "white",
                        borderColor: value.period === "evening" ? colors.primary : `${colors.textLight}20`,
                        color: value.period === "evening" ? "white" : colors.textDark,
                      }}
                    >
                      🌙 Soirée
                    </button>
                  </div>
                </div>

                {/* Nombre d'invités */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: colors.textDark }}>
                    <Users size={12} className="inline mr-1" />
                    {"Nombre d'invités"}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="number"
                        value={localGuestsMin}
                        onChange={handleMinGuestsChange}
                        placeholder="Min"
                        min={1}
                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2"
                        style={{ borderColor: `${colors.textLight}30` }}
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={localGuestsMax}
                        onChange={handleMaxGuestsChange}
                        placeholder="Max"
                        min={1}
                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2"
                        style={{ borderColor: `${colors.textLight}30` }}
                      />
                    </div>
                  </div>
                  {value.minGuests && value.maxGuests && value.minGuests > value.maxGuests && (
                    <p className="text-[10px] text-red-500 mt-1">Le minimum doit être inférieur au maximum</p>
                  )}
                </div>

                {/* Budget max */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: colors.textDark }}>
                    <DollarSign size={12} className="inline mr-1" />
                    Budget max (TND)
                  </label>
                  <input
                    type="number"
                    value={localBudget}
                    onChange={handleBudgetChange}
                    placeholder="Ex: 10000"
                    min={0}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: `${colors.textLight}30` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 mt-4 pt-4" style={{ borderTop: `1px solid ${colors.primary}20` }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onSearch}
                  disabled={isSearchDisabled || loading}
                  className="px-6 py-2.5 rounded-xl text-white text-sm font-medium flex items-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: colors.primary }}
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Recherche...
                    </>
                  ) : (
                    <>
                      <Search size={16} />
                      Rechercher
                    </>
                  )}
                </motion.button>

                <button
                  onClick={onReset}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-gray-50 flex items-center gap-2"
                  style={{ border: `1px solid ${colors.textLight}30`, color: colors.textLight }}
                >
                  <X size={16} />
                  Réinitialiser
                </button>

                {(value.minGuests || value.maxGuests || value.maxBudget) && (
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-xs flex items-center gap-1" style={{ color: colors.textLight }}>
                      <Filter size={12} />
                      Filtres actifs:
                    </span>
                    {value.minGuests && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${colors.primary}15`, color: colors.primary }}>
                        {value.minGuests} invités min
                      </span>
                    )}
                    {value.maxGuests && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${colors.primary}15`, color: colors.primary }}>
                        {value.maxGuests} invités max
                      </span>
                    )}
                    {value.maxBudget && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${colors.primary}15`, color: colors.primary }}>
                        {value.maxBudget} TND max
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Composant ChevronDown manquant
const ChevronDown = ({ size = 18, style = {} }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);