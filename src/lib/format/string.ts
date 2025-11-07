export const stringUtils = {
  toTitleCase: (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },
  formatRupiah: (amount: number, withPrefix = true) => {
    const formattedAmount = amount.toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    });
    return withPrefix
      ? formattedAmount
      : formattedAmount.replace("/^Rp\s?/", "");
  },
};
