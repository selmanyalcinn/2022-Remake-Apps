/**
 * Fiyat değişimine göre renk döndürür.
 * @param {number} value
 * @returns {string} Hex renk
 */
export const getChangeColor = (value, neutralColor = "#64748B") => {
  if (!Number.isFinite(value) || value === 0) return neutralColor;
  return value > 0 ? "#16A34A" : "#DC2626";
};

export const formatPrice = (value, symbol = "") => {
  if (!Number.isFinite(value)) return "N/A";

  const absolute = Math.abs(value);
  const maximumFractionDigits =
    absolute >= 1 ? 2 : absolute >= 0.01 ? 4 : 8;

  return `${symbol}${value.toLocaleString("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  })}`;
};

/**
 * Büyük sayıları okunabilir formata çevirir.
 * @param {number | null} num
 * @param {string} symbol - Para birimi sembolü (varsayılan: "$")
 * @returns {string}  Örn: "$1.23B", "€45.6M"
 */
export const formatLargeNumber = (num, symbol = "") => {
  if (!Number.isFinite(num)) return "N/A";

  const absolute = Math.abs(num);
  if (absolute >= 1000000000000)
    return `${symbol}${(num / 1000000000000).toFixed(2)}T`;
  if (absolute >= 1000000000)
    return `${symbol}${(num / 1000000000).toFixed(2)}B`;
  if (absolute >= 1000000)
    return `${symbol}${(num / 1000000).toFixed(2)}M`;
  return `${symbol}${num.toLocaleString("tr-TR", {
    maximumFractionDigits: 2,
  })}`;
};
