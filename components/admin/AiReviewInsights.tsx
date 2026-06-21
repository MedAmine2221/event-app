/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, ThumbsUp, ThumbsDown, AlertTriangle, RefreshCw } from "lucide-react";

interface Insights {
  summary: string;
  sentiment: "positive" | "neutral" | "negative";
  positivePoints: string[];
  negativePoints: string[];
  alerts: string[];
}

const sentimentConfig = {
  positive: { label: "Positif", color: "#4CAF50" },
  neutral: { label: "Neutre", color: "#FF9800" },
  negative: { label: "Négatif", color: "#F44336" },
};

export const AiReviewInsights = ({ colors }: { colors: any }) => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [error, setError] = useState("");

    const fetchInsights = async () => {
    setLoading(true);
    setError("");
    try {
        const res = await fetch("/api/ai/analyze-reviews");
        const data = await res.json();

        if (!res.ok) {
        if (res.status === 429) {
            throw new Error(data.error || "Le service IA est temporairement surchargé. Réessayez dans quelques instants.");
        }
        throw new Error(data.error || "Erreur lors de l'analyse");
        }

        setInsights(data);
    } catch (err: any) {
        setError(err.message || "Une erreur est survenue");
    } finally {
        setLoading(false);
    }
    };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-sm"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium flex items-center gap-2" style={{ color: colors.textDark }}>
          <Sparkles size={18} style={{ color: colors.primary }} />
          Analyse IA des avis
        </h3>
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all hover:opacity-80 disabled:opacity-50"
          style={{ backgroundColor: colors.primary, color: "white" }}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          {insights ? "Réanalyser" : "Lancer l'analyse"}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm mb-3">{error}</div>
      )}

      {!insights && !loading && !error && (
        <p className="text-sm text-center py-8" style={{ color: colors.textLight }}>
          Cliquez sur &quot;Lancer l&apos;analyse&quot; pour obtenir un résumé intelligent des avis clients.
        </p>
      )}

      {loading && (
        <div className="flex flex-col items-center py-8 gap-2">
          <Loader2 size={28} className="animate-spin" style={{ color: colors.primary }} />
          <p className="text-xs" style={{ color: colors.textLight }}>Analyse en cours...</p>
        </div>
      )}

      {insights && !loading && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span
              className="text-xs px-2.5 py-1 rounded-full font-medium text-white"
              style={{ background: sentimentConfig[insights.sentiment].color }}
            >
              {sentimentConfig[insights.sentiment].label}
            </span>
          </div>

          <p className="text-sm" style={{ color: colors.textDark }}>{insights.summary}</p>

          {insights.alerts.length > 0 && (
            <div className="p-3 rounded-lg bg-red-50 space-y-1.5">
              {insights.alerts.map((alert, i) => (
                <p key={i} className="text-xs flex items-start gap-1.5 text-red-700">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  {alert}
                </p>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {insights.positivePoints.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-2 flex items-center gap-1.5" style={{ color: colors.textDark }}>
                  <ThumbsUp size={14} style={{ color: "#4CAF50" }} /> Points forts
                </p>
                <ul className="space-y-1">
                  {insights.positivePoints.map((p, i) => (
                    <li key={i} className="text-xs" style={{ color: colors.textLight }}>• {p}</li>
                  ))}
                </ul>
              </div>
            )}

            {insights.negativePoints.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-2 flex items-center gap-1.5" style={{ color: colors.textDark }}>
                  <ThumbsDown size={14} style={{ color: "#F44336" }} /> Points à améliorer
                </p>
                <ul className="space-y-1">
                  {insights.negativePoints.map((p, i) => (
                    <li key={i} className="text-xs" style={{ color: colors.textLight }}>• {p}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};