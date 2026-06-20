"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Sun, Moon, Wallet, Search, X, RotateCcw } from "lucide-react";

export type Period = "morning" | "evening";

export interface VenueFilterValue {
  date: string; // YYYY-MM-DD
  period: Period | null;
  maxBudget: number | null;
}

interface VenueAvailabilityFilterProps {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    textDark: string;
    textLight: string;
  };
  value: VenueFilterValue;
  onChange: (value: VenueFilterValue) => void;
  onSearch: () => void;
  onReset: () => void;
  isFiltering: boolean;
  resultsCount?: number;
  loading?: boolean;
}

const PERIOD_OPTIONS: { value: Period; label: string; hours: string; icon: typeof Sun }[] = [
  { value: "morning", label: "Matinée", hours: "16h - 20h", icon: Sun },
  { value: "evening", label: "Soirée", hours: "21h - 00h", icon: Moon },
];

const BUDGET_PRESETS = [3000, 5000, 8000, 12000];

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
  const [budgetInput, setBudgetInput] = useState(value.maxBudget ? String(value.maxBudget) : "");

  const today = new Date().toISOString().split("T")[0];

  const handleBudgetChange = (raw: string) => {
    setBudgetInput(raw);
    const parsed = raw.trim() === "" ? null : Number(raw);
    onChange({ ...value, maxBudget: parsed && !Number.isNaN(parsed) ? parsed : null });
  };

  const canSearch = !!value.date && !!value.period;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
      className="rounded-3xl shadow-xl px-6 py-7 md:px-10 md:py-9 -mt-16 md:-mt-20 relative z-20 mx-4 md:mx-auto max-w-280"
      style={{ background: "white" }}
    >
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div>
          <span className="text-[11px] tracking-[3px] uppercase" style={{ color: colors.primary }}>
            Trouvez votre salle
          </span>
          <h3 className="text-xl md:text-2xl font-medium mt-1" style={{ color: colors.textDark }}>
            Disponibilité &amp; budget
          </h3>
        </div>
        {isFiltering && (
          <button
            onClick={onReset}
            className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors hover:bg-black/5"
            style={{ color: colors.textLight }}
          >
            <RotateCcw size={12} />
            Réinitialiser
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.4fr_1fr_auto] gap-4 items-end">
        {/* Date */}
        <div>
          <label
            className="text-xs font-medium mb-2 flex items-center gap-1.5"
            style={{ color: colors.textDark }}
          >
            <Calendar size={14} style={{ color: colors.primary }} />
            Date de l&apos;événement
          </label>
          <input
            type="date"
            min={today}
            value={value.date}
            onChange={(e) => onChange({ ...value, date: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors"
            style={{ borderColor: `${colors.textLight}30`, color: colors.textDark }}
            onFocus={(e) => (e.currentTarget.style.borderColor = colors.primary)}
            onBlur={(e) => (e.currentTarget.style.borderColor = `${colors.textLight}30`)}
          />
        </div>

        {/* Période */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: colors.textDark }}>
            Créneau souhaité
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PERIOD_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const selected = value.period === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange({ ...value, period: opt.value })}
                  className="flex items-center gap-2 px-3 py-3 rounded-xl border-2 transition-all text-left"
                  style={{
                    borderColor: selected ? colors.primary : `${colors.textLight}25`,
                    background: selected ? `${colors.primary}10` : "transparent",
                  }}
                >
                  <Icon size={16} style={{ color: selected ? colors.primary : colors.textLight }} />
                  <span className="leading-tight">
                    <span
                      className="block text-xs font-medium"
                      style={{ color: selected ? colors.primary : colors.textDark }}
                    >
                      {opt.label}
                    </span>
                    <span className="block text-[10px]" style={{ color: colors.textLight }}>
                      {opt.hours}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Budget */}
        <div>
          <label
            className="text-xs font-medium mb-2 flex items-center gap-1.5"
            style={{ color: colors.textDark }}
          >
            <Wallet size={14} style={{ color: colors.primary }} />
            Budget max (TND)
          </label>
          <input
            type="number"
            min={0}
            placeholder="Ex: 6000"
            value={budgetInput}
            onChange={(e) => handleBudgetChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors"
            style={{ borderColor: `${colors.textLight}30`, color: colors.textDark }}
            onFocus={(e) => (e.currentTarget.style.borderColor = colors.primary)}
            onBlur={(e) => (e.currentTarget.style.borderColor = `${colors.textLight}30`)}
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {BUDGET_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleBudgetChange(String(preset))}
                className="text-[10px] px-2 py-1 rounded-full transition-colors"
                style={{
                  background: value.maxBudget === preset ? colors.primary : `${colors.textLight}10`,
                  color: value.maxBudget === preset ? "white" : colors.textLight,
                }}
              >
                ≤ {preset.toLocaleString("fr-FR")}
              </button>
            ))}
          </div>
        </div>

        {/* Bouton recherche */}
        <motion.button
          whileHover={{ scale: canSearch ? 1.03 : 1 }}
          whileTap={{ scale: canSearch ? 0.97 : 1 }}
          onClick={onSearch}
          disabled={!canSearch || loading}
          className="px-6 py-3.5 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed disabled:opacity-50 h-fit"
          style={{ background: colors.primary }}
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <Search size={16} />
          )}
          Rechercher
        </motion.button>
      </div>

      {!canSearch && (
        <p className="text-xs mt-3" style={{ color: colors.textLight }}>
          Choisissez une date et un créneau pour lancer la recherche de disponibilité.
        </p>
      )}

      <AnimatePresence>
        {isFiltering && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="mt-5 pt-4 border-t flex items-center justify-between flex-wrap gap-2"
              style={{ borderColor: `${colors.textLight}15` }}
            >
              <p className="text-sm" style={{ color: colors.textDark }}>
                {loading ? (
                  "Recherche des disponibilités..."
                ) : (
                  <>
                    <span className="font-semibold" style={{ color: colors.primary }}>
                      {resultsCount ?? 0}
                    </span>{" "}
                    salle{(resultsCount ?? 0) > 1 ? "s" : ""} disponible
                    {(resultsCount ?? 0) > 1 ? "s" : ""} le{" "}
                    {value.date &&
                      new Date(value.date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}{" "}
                    —{" "}
                    {value.period === "morning" ? "Matinée (16h-20h)" : "Soirée (21h-00h)"}
                    {value.maxBudget ? ` · budget ≤ ${value.maxBudget.toLocaleString("fr-FR")} TND` : ""}
                  </>
                )}
              </p>
              <button
                onClick={onReset}
                className="text-xs flex items-center gap-1 px-2 py-1 rounded-full hover:bg-black/5 transition-colors"
                style={{ color: colors.textLight }}
              >
                <X size={12} />
                Effacer les filtres
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};