const CONFIGURED_API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_BASE_URL || ""
).replace(/\/+$/, "");
const WEB_ORIGIN =
  typeof window !== "undefined" && typeof window.location?.origin === "string"
    ? window.location.origin
    : "";
const API_BASE_URL =
  CONFIGURED_API_BASE_URL || (WEB_ORIGIN ? `${WEB_ORIGIN}/api` : "");
const REQUEST_TIMEOUT_MS = 12000;
const MARKET_CACHE_TTL = 2 * 60 * 1000;
const CHART_CACHE_TTL = 5 * 60 * 1000;
const MAX_CHART_CACHE_ENTRIES = 30;
const MAX_RETRIES = 1;

const marketCache = new Map();
const chartCache = new Map();
const pendingMarketRequests = new Map();
const pendingChartRequests = new Map();

const normalizeCurrency = (currency) => String(currency || "usd").toLowerCase();

const readFreshCache = (cache, key, ttl) => {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.timestamp >= ttl) {
    cache.delete(key);
    return null;
  }

  return entry.data;
};

const wait = (duration) =>
  new Promise((resolve) => setTimeout(resolve, duration));

const fetchJson = async (path) => {
  if (!API_BASE_URL) {
    throw new Error("API adresi yapılandırılmamış");
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });

      if (response.ok) return await response.json();

      const canRetry = response.status === 429 || response.status >= 500;
      if (canRetry && attempt < MAX_RETRIES) {
        const retryAfterHeader = response.headers.get("retry-after");
        const retryAfterSeconds = retryAfterHeader
          ? Number(retryAfterHeader)
          : Number.NaN;
        const delay = Number.isFinite(retryAfterSeconds)
          ? Math.min(retryAfterSeconds * 1000, 5000)
          : 1000 * 2 ** attempt;
        await wait(delay);
        continue;
      }

      const error = new Error(`CoinGecko isteği başarısız (${response.status})`);
      error.status = response.status;
      throw error;
    } catch (error) {
      if (error?.name === "AbortError") {
        throw new Error("İstek zaman aşımına uğradı");
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error("CoinGecko isteği tamamlanamadı");
};

export const getCachedMarketData = (currency = "usd") =>
  readFreshCache(marketCache, normalizeCurrency(currency), MARKET_CACHE_TTL);

/**
 * İlk 100 coinin piyasa verisini getirir. Aynı para birimi için eş zamanlı
 * istekler birleştirilir ve kısa süreli bellek önbelleği kullanılır.
 */
export const getMarketData = async (currency = "usd", { force = false } = {}) => {
  const code = normalizeCurrency(currency);

  if (!force) {
    const cached = getCachedMarketData(code);
    if (cached) return cached;
  }

  if (pendingMarketRequests.has(code)) {
    return pendingMarketRequests.get(code);
  }

  const request = fetchJson(`/market?currency=${encodeURIComponent(code)}`)
    .then((data) => {
      if (!Array.isArray(data)) throw new Error("Piyasa verisi geçersiz döndü");
      if (!data.length) throw new Error("Piyasa verisi boş döndü");
      marketCache.set(code, { data, timestamp: Date.now() });
      return data;
    })
    .finally(() => pendingMarketRequests.delete(code));

  pendingMarketRequests.set(code, request);
  return request;
};

const getChartKey = (coinId, days, currency) =>
  `${coinId}_${days}_${normalizeCurrency(currency)}`;

/** Grafik verisini her zaman [{ x, y }] biçiminde döndürür. */
export const getCachedChart = (coinId, days, currency = "usd") =>
  readFreshCache(
    chartCache,
    getChartKey(coinId, days, currency),
    CHART_CACHE_TTL
  );

export const setCachedChart = (coinId, days, currency = "usd", data) => {
  if (!Array.isArray(data) || !data.length) return;

  const key = getChartKey(coinId, days, currency);
  chartCache.delete(key);
  chartCache.set(key, { data, timestamp: Date.now() });

  if (chartCache.size > MAX_CHART_CACHE_ENTRIES) {
    chartCache.delete(chartCache.keys().next().value);
  }
};

/** Belirli bir coin için geçmiş fiyat grafiğini getirir. */
export const getCoinChart = async (coinId, days, currency = "usd") => {
  const code = normalizeCurrency(currency);
  const key = getChartKey(coinId, days, code);
  const cached = getCachedChart(coinId, days, code);
  if (cached) return cached;

  if (pendingChartRequests.has(key)) {
    return pendingChartRequests.get(key);
  }

  const request = fetchJson(
    `/chart?coinId=${encodeURIComponent(coinId)}` +
      `&currency=${encodeURIComponent(code)}&days=${encodeURIComponent(days)}`
  )
    .then((response) => {
      const formatted = Array.isArray(response?.prices)
        ? response.prices
            .filter(
              (point) =>
                Array.isArray(point) &&
                Number.isFinite(point[0]) &&
                Number.isFinite(point[1])
            )
            .map(([timestamp, price]) => ({ x: timestamp / 1000, y: price }))
        : [];

      if (!formatted.length) throw new Error("Grafik verisi boş döndü");
      setCachedChart(coinId, days, code, formatted);
      return formatted;
    })
    .finally(() => pendingChartRequests.delete(key));

  pendingChartRequests.set(key, request);
  return request;
};
