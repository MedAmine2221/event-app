/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY non définie — le module IA ne fonctionnera pas.");
}

export const genAI = new GoogleGenerativeAI(apiKey || "");

export const getGeminiModel = () =>
  genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Erreur typée pour propager un message clair jusqu'au frontend
export class GeminiQuotaError extends Error {
  constructor(message = "Le service IA est temporairement indisponible (quota dépassé). Merci de réessayer dans quelques instants.") {
    super(message);
    this.name = "GeminiQuotaError";
  }
}

interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Exécute generateContent avec retry + backoff exponentiel sur erreurs 429.
 * Si toutes les tentatives échouent à cause du quota, lève une GeminiQuotaError
 * avec un message clair plutôt que l'erreur brute de l'API.
 */
export async function generateContentWithRetry(
  model: ReturnType<typeof getGeminiModel>,
  prompt: string,
  options: RetryOptions = {}
) {
  const { maxRetries = 3, baseDelayMs = 1000 } = options;

  let lastError: any = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result;
    } catch (error: any) {
      lastError = error;

      const status = error?.status || error?.response?.status;
      const isQuotaError = status === 429;
      const isRetryable = isQuotaError || status === 503;

      // Pas une erreur retryable (ex: mauvais prompt, clé invalide) → on arrête tout de suite
      if (!isRetryable) {
        throw error;
      }

      // Dernière tentative épuisée
      if (attempt === maxRetries) {
        break;
      }

      // Essayer de récupérer le délai suggéré par l'API, sinon backoff exponentiel
      const suggestedDelay = error?.errorDetails?.find(
        (d: any) => d["@type"]?.includes("RetryInfo")
      )?.retryDelay;

      let delayMs = baseDelayMs * Math.pow(2, attempt);
      if (suggestedDelay) {
        const parsedSeconds = parseFloat(String(suggestedDelay).replace("s", ""));
        if (!Number.isNaN(parsedSeconds)) {
          delayMs = Math.max(delayMs, parsedSeconds * 1000);
        }
      }

      console.warn(
        `Gemini quota/rate-limit hit (tentative ${attempt + 1}/${maxRetries + 1}), retry dans ${Math.round(delayMs)}ms...`
      );
      await sleep(delayMs);
    }
  }

  // Toutes les tentatives ont échoué à cause du quota
  const status = lastError?.status || lastError?.response?.status;
  if (status === 429) {
    throw new GeminiQuotaError();
  }

  throw lastError;
}
// Add this after your GeminiQuotaError definition
export class GeminiQuotaZeroError extends Error {
  constructor(message = "Le quota IA est à zéro. Veuillez contacter l'administrateur.") {
    super(message);
    this.name = "GeminiQuotaZeroError";
  }
}