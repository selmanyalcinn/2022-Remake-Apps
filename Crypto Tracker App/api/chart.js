const {
  handleOptions,
  rejectUnsupportedMethod,
  requestCoinGecko,
  sendError,
  setCacheHeaders,
  setCommonHeaders,
} = require("../server/coingecko");

const ALLOWED_CURRENCIES = new Set(["usd", "eur", "try"]);
const ALLOWED_DAYS = new Set(["1", "7", "30", "90", "365"]);
const COIN_ID_PATTERN = /^[a-z0-9._-]{1,100}$/;

module.exports = async function chartHandler(request, response) {
  setCommonHeaders(response);
  if (handleOptions(request, response)) return;
  if (rejectUnsupportedMethod(request, response)) return;

  const coinId = String(request.query.coinId || "").toLowerCase();
  const days = String(request.query.days || "7");
  const currency = String(request.query.currency || "usd").toLowerCase();

  if (!COIN_ID_PATTERN.test(coinId)) {
    response.setHeader("Cache-Control", "private, no-store");
    return response.status(400).json({ error: "Geçersiz coin kimliği" });
  }
  if (!ALLOWED_DAYS.has(days)) {
    response.setHeader("Cache-Control", "private, no-store");
    return response.status(400).json({ error: "Geçersiz grafik süresi" });
  }
  if (!ALLOWED_CURRENCIES.has(currency)) {
    response.setHeader("Cache-Control", "private, no-store");
    return response.status(400).json({ error: "Geçersiz para birimi" });
  }

  try {
    const data = await requestCoinGecko(
      `/coins/${encodeURIComponent(coinId)}/market_chart`,
      { vs_currency: currency, days }
    );

    const cacheSeconds = days === "1" ? 60 : days === "7" ? 300 : 900;
    setCacheHeaders(response, cacheSeconds, cacheSeconds * 2);
    return response.status(200).json(data);
  } catch (error) {
    return sendError(response, error);
  }
};
