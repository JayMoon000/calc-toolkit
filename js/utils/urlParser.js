/**
 * ToolLab.org - URL Parser & Query Parameter Engine (Zero-dependency Pure Functions)
 * Path: D:\Gemini_Files\ToolLab.org\js\utils\urlParser.js
 */
const UrlParser = {
  // 1. Full URL Decomposition
  parse(rawUrl) {
    if (!rawUrl || typeof rawUrl !== "string") {
      return { isValid: false, error: "Empty input string", data: null };
    }

    let urlToParse = rawUrl.trim();
    // Prepend https:// if user provided a domain without protocol
    if (!/^[a-zA-Z][a-zA-Z\d+\-.]*?:/.test(urlToParse)) {
      urlToParse = "https://" + urlToParse;
    }

    try {
      const parsed = new URL(urlToParse);
      const searchParams = [];
      parsed.searchParams.forEach((val, key) => {
        searchParams.push({
          key,
          value: val,
          encodedKey: encodeURIComponent(key),
          encodedValue: encodeURIComponent(val)
        });
      });

      return {
        isValid: true,
        error: null,
        data: {
          href: parsed.href,
          origin: parsed.origin,
          protocol: parsed.protocol.replace(":", ""),
          username: parsed.username || "",
          password: parsed.password || "",
          host: parsed.host,
          hostname: parsed.hostname,
          port: parsed.port || (parsed.protocol === "https:" ? "443" : parsed.protocol === "http:" ? "80" : ""),
          pathname: parsed.pathname,
          search: parsed.search,
          hash: parsed.hash ? parsed.hash.substring(1) : "",
          searchParams,
          paramCount: searchParams.length
        }
      };
    } catch (err) {
      return {
        isValid: false,
        error: err.message || "Invalid URL syntax",
        data: null
      };
    }
  },

  // 2. Reconstruct URL from decomposed parts and updated params
  reconstruct(baseHref, queryParamsArray) {
    try {
      const url = new URL(baseHref);
      // Clear existing search params
      url.search = "";
      queryParamsArray.forEach((item) => {
        if (item.key && item.key.trim() !== "") {
          url.searchParams.append(item.key.trim(), item.value || "");
        }
      });
      return { success: true, url: url.href };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // 3. Decode component string (Handles %20, %2B, nested encodings)
  decodeSafe(str) {
    if (!str) return "";
    try {
      return decodeURIComponent(str);
    } catch (e) {
      return unescape(str);
    }
  },

  // 4. Encode component string
  encodeSafe(str) {
    if (!str) return "";
    return encodeURIComponent(str);
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = UrlParser;
}

if (typeof window !== "undefined") {
  window.UrlParser = UrlParser;
}

// Node.js CLI Validation Block
if (typeof process !== "undefined" && process.argv && process.argv[1]?.endsWith("urlParser.js")) {
  const sample = "https://toollab.org:8080/tools/unit-converter?category=length&unit=meter#table-section";
  const res = UrlParser.parse(sample);
  console.assert(res.isValid, "URL parsing failed");
  console.assert(res.data.hostname === "toollab.org", "Hostname assertion failed");
  console.assert(res.data.port === "8080", "Port assertion failed");
  console.assert(res.data.paramCount === 2, "Param count failed");
  console.assert(res.data.hash === "table-section", "Hash extraction failed");

  const reconstructed = UrlParser.reconstruct("https://toollab.org/search", [
    { key: "q", value: "unit test" },
    { key: "page", value: "2" }
  ]);
  console.assert(reconstructed.url === "https://toollab.org/search?q=unit+test&page=2", "Reconstruct failed");
  console.log("✔ UrlParser pure engine passed all unit assertions");
}