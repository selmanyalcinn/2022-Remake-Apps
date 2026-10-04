const DEMO_API_URL = "https://api.coingecko.com/api/v3";
const DEMO_API_KEY_HEADER = "x-cg-demo-api-key";
const UPSTREAM_TIMEOUT_MS = 10000;

function getCoinGeckoConfig() {
  const apiKey = process.env.COINGECKO_API_KEY;

  if (!apiKey) {
    const error = new Error("COINGECKO_API_KEY yapılandırılmamış");
    error.status = 503;
    throw error;
  }

  return {
    apiKey,
    baseUrl: DEMO_API_URL,
    keyHeader: DEMO_API_KEY_HEADER,
  };
}

async function requestCoinGecko(path, searchParams) {
  const { apiKey, baseUrl, keyHeader } = getCoinGeckoConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  const query = new URLSearchParams(searchParams);

  try {
    const response = await fetch(`${baseUrl}${path}?${query}`, {
      headers: {
        Accept: "application/json",
        [keyHeader]: apiKey,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = new Error(`CoinGecko upstream hatası (${response.status})`);
      error.status = response.status;
      error.retryAfter = response.headers.get("retry-after");
      throw error;
    }

    return await response.json();
  } catch (error) {
    if (error?.name === "AbortError") {
      const timeoutError = new Error("CoinGecko isteği zaman aşımına uğradı");
      timeoutError.status = 504;
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function setCommonHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("X-Content-Type-Options", "nosniff");
}

function setCacheHeaders(response, maxAge, staleWhileRevalidate) {
  response.setHeader(
    "Cache-Control",
    `public, max-age=30, stale-while-revalidate=${staleWhileRevalidate}`
  );
  response.setHeader(
    "Vercel-CDN-Cache-Control",
    `public, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`
  );
}

function sendError(response, error) {
  const upstreamStatus = Number(error?.status);
  const status = upstreamStatus === 429 ? 429 : upstreamStatus >= 500 ? upstreamStatus : 502;

  response.setHeader("Cache-Control", "private, no-store");
  if (error?.retryAfter) response.setHeader("Retry-After", error.retryAfter);

  return response.status(status).json({
    error:
      status === 429
        ? "Piyasa veri sağlayıcısının istek limiti aşıldı"
        : status === 503
          ? "API servisi henüz yapılandırılmamış"
          : "Piyasa verisi geçici olarak alınamıyor",
  });
}

function handleOptions(request, response) {
  if (request.method !== "OPTIONS") return false;
  response.status(204).end();
  return true;
}

function rejectUnsupportedMethod(request, response) {
  if (request.method === "GET") return false;
  response.setHeader("Allow", "GET, OPTIONS");
  response.setHeader("Cache-Control", "private, no-store");
  response.status(405).json({ error: "Yalnızca GET istekleri desteklenir" });
  return true;
}

module.exports = {
  handleOptions,
  rejectUnsupportedMethod,
  requestCoinGecko,
  sendError,
  setCacheHeaders,
  setCommonHeaders,
};
