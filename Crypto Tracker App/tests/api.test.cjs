const assert = require("node:assert/strict");
const test = require("node:test");

const marketHandler = require("../api/market");
const chartHandler = require("../api/chart");

function createResponse() {
  return {
    body: null,
    headers: {},
    statusCode: null,
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
    end() {
      return this;
    },
  };
}

test.beforeEach(() => {
  process.env.COINGECKO_API_KEY = "test-secret-key";
});

test.afterEach(() => {
  delete process.env.COINGECKO_API_KEY;
  delete global.fetch;
});

test("market proxy anahtarı sunucuda tutar ve CDN cache başlığı döndürür", async () => {
  let upstreamRequest;
  global.fetch = async (url, options) => {
    upstreamRequest = { url, options };
    return {
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: async () => [{ id: "bitcoin" }],
    };
  };

  const response = createResponse();
  await marketHandler({ method: "GET", query: { currency: "usd" } }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body[0].id, "bitcoin");
  assert.match(
    upstreamRequest.url,
    /^https:\/\/api\.coingecko\.com\/api\/v3\/coins\/markets\?/
  );
  assert.match(upstreamRequest.url, /sparkline=false/);
  assert.equal(
    upstreamRequest.options.headers["x-cg-demo-api-key"],
    "test-secret-key"
  );
  assert.match(response.headers["vercel-cdn-cache-control"], /s-maxage=60/);
  assert.doesNotMatch(JSON.stringify(response.body), /test-secret-key/);
});

test("chart proxy geçersiz parametreleri upstream'e göndermeden reddeder", async () => {
  let callCount = 0;
  global.fetch = async () => {
    callCount += 1;
  };

  const response = createResponse();
  await chartHandler(
    {
      method: "GET",
      query: { coinId: "../../secret", days: "999", currency: "gbp" },
    },
    response
  );

  assert.equal(response.statusCode, 400);
  assert.equal(callCount, 0);
  assert.equal(response.headers["cache-control"], "private, no-store");
});

test("proxy yapılandırılmamış anahtarı güvenli 503 yanıtına çevirir", async () => {
  delete process.env.COINGECKO_API_KEY;
  global.fetch = async () => {
    throw new Error("çağrılmamalı");
  };

  const response = createResponse();
  await marketHandler({ method: "GET", query: { currency: "try" } }, response);

  assert.equal(response.statusCode, 503);
  assert.equal(response.headers["cache-control"], "private, no-store");
  assert.deepEqual(response.body, { error: "API servisi henüz yapılandırılmamış" });
});
