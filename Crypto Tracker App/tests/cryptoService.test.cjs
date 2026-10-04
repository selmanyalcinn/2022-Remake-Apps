const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const babel = require("@babel/core");

function loadService(mockFetch) {
  const filename = path.join(__dirname, "..", "Services", "cryptoService.js");
  const source = fs.readFileSync(filename, "utf8");
  const { code } = babel.transformSync(source, {
    filename,
    presets: ["babel-preset-expo"],
  });
  const module = { exports: {} };

  vm.runInNewContext(code, {
    AbortController,
    clearTimeout,
    console,
    exports: module.exports,
    fetch: mockFetch,
    module,
    require: (id) =>
      id === "expo/virtual/env"
        ? { env: { EXPO_PUBLIC_API_BASE_URL: "https://api.example.com/api/" } }
        : require(id),
    setTimeout,
  });

  return module.exports;
}

function response({ data, status = 200, headers = {} }) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (name) => headers[name.toLowerCase()] ?? null,
    },
    json: async () => data,
  };
}

test("piyasa isteklerini birleştirir ve sonucu önbelleğe alır", async () => {
  let callCount = 0;
  let requestedUrl = "";
  const service = loadService(async (url) => {
    callCount += 1;
    requestedUrl = url;
    await new Promise((resolve) => setTimeout(resolve, 5));
    return response({ data: [{ id: "bitcoin" }] });
  });

  const [first, second] = await Promise.all([
    service.getMarketData("usd"),
    service.getMarketData("usd"),
  ]);
  const cached = await service.getMarketData("usd");

  assert.equal(callCount, 1);
  assert.equal(first[0].id, "bitcoin");
  assert.equal(second[0].id, "bitcoin");
  assert.equal(cached[0].id, "bitcoin");
  assert.equal(requestedUrl, "https://api.example.com/api/market?currency=usd");
});

test("grafik verisini tek biçimde dönüştürüp önbelleğe alır", async () => {
  let callCount = 0;
  const service = loadService(async () => {
    callCount += 1;
    return response({ data: { prices: [[1000, 12.5], [2000, 13]] } });
  });

  const first = await service.getCoinChart("bitcoin", 7, "usd");
  const second = await service.getCoinChart("bitcoin", 7, "usd");

  assert.equal(callCount, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(first)), [
    { x: 1, y: 12.5 },
    { x: 2, y: 13 },
  ]);
  assert.deepEqual(JSON.parse(JSON.stringify(second)), [
    { x: 1, y: 12.5 },
    { x: 2, y: 13 },
  ]);
});

test("429 yanıtını bir kez yeniden dener ve durum kodunu korur", async () => {
  let callCount = 0;
  const service = loadService(async () => {
    callCount += 1;
    return response({ status: 429, headers: { "retry-after": "0" } });
  });

  await assert.rejects(
    service.getMarketData("usd", { force: true }),
    (error) => error.status === 429
  );
  assert.equal(callCount, 2);
});
