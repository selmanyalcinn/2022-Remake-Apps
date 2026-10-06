const HTTP_PROTOCOL_PATTERN = /^https?:\/\//i;
const DOMAIN_PATTERN = /^(?:www\.)?(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}(?::\d{1,5})?(?:[/?#].*)?$/i;

function cleanScannedText(value) {
  if (typeof value !== "string") return "";

  return value
    .trim()
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/^url:\s*/i, "")
    .trim();
}

function normalizeWebUrl(value) {
  const candidate = cleanScannedText(value);
  if (!candidate || /\s/.test(candidate)) return null;

  if (HTTP_PROTOCOL_PATTERN.test(candidate)) {
    return candidate;
  }

  if (DOMAIN_PATTERN.test(candidate)) {
    return `https://${candidate}`;
  }

  return null;
}

function isWebUrl(value) {
  return normalizeWebUrl(value) !== null;
}

module.exports = {
  isWebUrl,
  normalizeWebUrl,
};
