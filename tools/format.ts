export const formatCurrency = (amount: number, currency: string = "KES") => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatPercent = (value: number) => {
  return new Intl.NumberFormat("en-KE", {
    style: "percent",
    minimumFractionDigits: 1,
  }).format(value);
};

export const formatNumber = (amount: number) => {
  return new Intl.NumberFormat("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
