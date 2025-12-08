/**
 * Currency utilities
 * @description Utilities for formatting and parsing currency values on input fields
 * @example
 * currencyUtils.formatCurrencyInput("100000") // "100.000"
 * currencyUtils.parseCurrencyInput("100.000") // 100000
 */
export const currencyUtils = {
  /**
   * Format currency input
   * @param value - The value to format
   * @returns Formatted currency string (e.g., "100.000")
   */
  formatCurrencyInput: (value: string): string => {
    const numericValue = value.replace(/\D/g, "");
    if (!numericValue) return "";

    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  },
  /**
   * Parse currency input
   * @param value - The value to parse
   * @returns Parsed currency number (e.g., 100000)
   */
  parseCurrencyInput: (value: string): number => {
    const numericValue = value.replace(/\D/g, "");
    return numericValue ? parseInt(numericValue, 10) : 0;
  },
};
