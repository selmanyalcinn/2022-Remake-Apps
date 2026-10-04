const {
  handleOptions,
  rejectUnsupportedMethod,
  requestCoinGecko,
  sendError,
  setCacheHeaders,
  setCommonHeaders,
} = require("../server/coingecko");

const ALLOWED_CURRENCIES = new Set(["usd", "eur", "try"]);

module.exports = async function marketHandler(request, response) {
  setCommonHeaders(response);
  if (handleOptions(request, response)) return;
  if (rejectUnsupportedMethod(request, response)) return;

  const currency = String(request.query.currency || "usd").toLowerCase();
  if (!ALLOWED_CURRENCIES.has(currency)) {
    response.setHeader("Cache-Control", "private, no-store");
    return response.status(400).json({ error: "Geçersiz para birimi" });
  }

  try {
    const data = await requestCoinGecko("/coins/markets", {
      vs_currency: currency,
      order: "market_cap_desc",
      per_page: "100",
      page: "1",
      sparkline: "false",
      price_change_percentage: "1h,7d,14d,30d,1y",
    });

    setCacheHeaders(response, 60, 300);
    return response.status(200).json(data);
  } catch (error) {
    return sendError(response, error);
  }
};
