const assert = require("node:assert/strict");
const { isWebUrl, normalizeWebUrl } = require("../utils/links");

const validUrls = [
  ["https://youtu.be/dQw4w9WgXcQ", "https://youtu.be/dQw4w9WgXcQ"],
  [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  ],
  [
    "www.youtube.com/shorts/dQw4w9WgXcQ",
    "https://www.youtube.com/shorts/dQw4w9WgXcQ",
  ],
  [
    "youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtube.com/watch?v=dQw4w9WgXcQ",
  ],
  [
    "URL: https://youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtube.com/watch?v=dQw4w9WgXcQ",
  ],
  [
    "\u200Bhttps://youtube.com/watch?v=dQw4w9WgXcQ\uFEFF",
    "https://youtube.com/watch?v=dQw4w9WgXcQ",
  ],
];

for (const [input, expected] of validUrls) {
  assert.equal(normalizeWebUrl(input), expected);
  assert.equal(isWebUrl(input), true);
}

for (const input of ["", "plain text", "youtube://dQw4w9WgXcQ", "javascript:alert(1)"]) {
  assert.equal(normalizeWebUrl(input), null);
  assert.equal(isWebUrl(input), false);
}

console.log("URL normalization tests passed");
