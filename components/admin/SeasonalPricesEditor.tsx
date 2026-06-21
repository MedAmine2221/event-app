/* eslint-disable @typescript-eslint/no-explicit-any */
import { Season, SeasonalPrice, SEASONS } from "@/types/pack";
import { X } from "lucide-react";

interface SeasonalPricesEditorProps {
  seasonalPrices: SeasonalPrice[];
  onChange: (prices: SeasonalPrice[]) => void;
  colors: any;
  label?: string;
  description?: string;
}

export const SeasonalPricesEditor = ({
  seasonalPrices,
  onChange,
  colors,
  label = "🏷️ Tarifs saisonniers",
  description = "Si aucun prix saisonnier n'est défini, le prix par défaut sera utilisé.",
}: SeasonalPricesEditorProps) => {
  const updateSeasonalPrice = (season: Season, value: string) => {
    const numValue = parseFloat(value);
    const existing = seasonalPrices.find(sp => sp.season === season);
    let newPrices: SeasonalPrice[];
    
    if (existing) {
      newPrices = seasonalPrices.map(sp => 
        sp.season === season 
          ? { ...sp, price: value, priceNumber: isNaN(numValue) ? 0 : numValue }
          : sp
      );
    } else {
      newPrices = [
        ...seasonalPrices,
        { season, price: value, priceNumber: isNaN(numValue) ? 0 : numValue }
      ];
    }
    
    onChange(newPrices);
  };

  const removeSeasonalPrice = (season: Season) => {
    onChange(seasonalPrices.filter(sp => sp.season !== season));
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
        {label}
      </label>
      <p className="text-xs mb-3" style={{ color: colors.textLight }}>
        {description}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {SEASONS.map(({ value, label, emoji }) => {
          const current = seasonalPrices.find(sp => sp.season === value);
          const hasPrice = current && current.price && current.price !== "";
          return (
            <div key={value} className="flex items-center gap-2">
              <span className="text-sm">{emoji}</span>
              <input
                type="number"
                value={current?.price || ""}
                onChange={(e) => updateSeasonalPrice(value, e.target.value)}
                placeholder={label}
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none"
                style={{ 
                  borderColor: hasPrice ? colors.primary : `${colors.textLight}30`,
                  background: hasPrice ? `${colors.primary}05` : "transparent"
                }}
              />
              {hasPrice && (
                <button
                  type="button"
                  onClick={() => removeSeasonalPrice(value)}
                  className="p-1 rounded hover:bg-red-50"
                >
                  <X size={14} className="text-red-400" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};