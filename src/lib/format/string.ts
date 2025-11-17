const toTitleCase = (str: string) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const stringUtils = {
  toTitleCase,
  getRoleDisplay: (role: string) => {
    if (!role) return "";
    return role.split("_").filter(Boolean).map(toTitleCase).join(" ");
  },
  formatRupiah: (amount: number, withPrefix = true) => {
    const formattedAmount = amount.toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    });
    return withPrefix ? formattedAmount : formattedAmount.replace(/^Rp\s?/, "");
  },
};
