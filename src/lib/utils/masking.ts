/**
 * Masks Courtside API key showing only the last 4 characters.
 * Example: "sk_live_abc123xyz" → "••••••••xyz"
 *
 * @param apiKey - The API key to mask, can be null or undefined
 * @returns The masked API key, or null if input is null/undefined
 *
 * Behavior:
 * - null/undefined → null
 * - Empty string → empty string
 * - Length < 4 → returns original string (nothing to mask)
 * - Length >= 4 → masks all but last 4 characters with bullets (max 8 bullets)
 */
export function maskApiKey(apiKey: string | null | undefined): string | null {
  if (apiKey === null || apiKey === undefined) {
    return null;
  }

  if (apiKey.length < 4) {
    return apiKey;
  }

  const visiblePart = apiKey.slice(-4);
  const maskedLength = Math.min(apiKey.length - 4, 8);
  const maskedPart = "•".repeat(maskedLength);

  return maskedPart + visiblePart;
}
