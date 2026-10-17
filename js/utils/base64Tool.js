/**
 * ToolLab.org - Base64 Encoding & Decoding Engine (Zero-dependency Pure Functions)
 * Path: D:\Gemini_Files\ToolLab.org\js\utils\base64Tool.js
 */
const Base64Tool = {
  // 1. UTF-8 Safe Text Encoding to Base64
  encodeText(plainText, urlSafe = false) {
    if (!plainText) return "";
    try {
      // Handle multi-byte Unicode strings via TextEncoder
      const bytes = new TextEncoder().encode(plainText);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      let base64 = btoa(binary);
      if (urlSafe) {
        base64 = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      }
      return base64;
    } catch (err) {
      throw new Error(`Encoding failed: ${err.message}`);
    }
  },

  // 2. Base64 Decoding to UTF-8 Plain Text
  decodeText(base64Str) {
    if (!base64Str) return "";
    try {
      // Revert URL-safe replacements and padding if present
      let normalized = base64Str.trim().replace(/-/g, "+").replace(/_/g, "/");
      while (normalized.length % 4 !== 0) {
        normalized += "=";
      }

      const binary = atob(normalized);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return new TextDecoder().decode(bytes);
    } catch (err) {
      throw new Error("Invalid Base64 string format");
    }
  },

  // 3. Format Base64 as Data URI
  toDataUri(base64Str, mimeType = "text/plain") {
    if (!base64Str) return "";
    return `data:${mimeType};base64,${base64Str.trim()}`;
  },

  // 4. Calculate Size Ratios (Payload expansion inspection)
  getMetrics(rawStr, base64Str) {
    const rawBytes = rawStr ? new Blob([rawStr]).size : 0;
    const b64Bytes = base64Str ? new Blob([base64Str]).size : 0;
    const ratio = rawBytes > 0 ? ((b64Bytes - rawBytes) / rawBytes) * 100 : 0;

    return {
      rawBytes,
      b64Bytes,
      overheadRatio: Number(ratio.toFixed(1))
    };
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = Base64Tool;
}

if (typeof window !== "undefined") {
  window.Base64Tool = Base64Tool;
}

// Node.js CLI Validation
if (typeof process !== "undefined" && process.argv && process.argv[1]?.endsWith("base64Tool.js")) {
  const sample = "ToolLab 🚀 유틸리티 플랫폼";
  const encoded = Base64Tool.encodeText(sample, false);
  const decoded = Base64Tool.decodeText(encoded);
  console.assert(decoded === sample, "Unicode encoding/decoding assertion failed");

  const urlSafe = Base64Tool.encodeText("hello?world+test/123", true);
  console.assert(!urlSafe.includes("+") && !urlSafe.includes("/") && !urlSafe.includes("="), "URL-safe format failed");
  console.log("✔ Base64Tool pure engine passed all unit assertions");
}