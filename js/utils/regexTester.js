/**
 * ToolLab.org - Regular Expression Engine & Text Replacer (Pure Functions)
 * Path: D:\Gemini_Files\ToolLab.org\js\utils\regexTester.js
 */
const RegexTester = {
  // 1. Validate pattern syntax
  validatePattern(patternStr, flags = "g") {
    if (typeof patternStr !== "string") {
      return { isValid: false, error: "Pattern must be a string", regex: null };
    }
    try {
      const regex = new RegExp(patternStr, flags);
      return { isValid: true, error: null, regex };
    } catch (err) {
      return { isValid: false, error: err.message, regex: null };
    }
  },

  // 2. Execute matching with indices and capture groups
  testMatches(patternStr, flags, testText) {
    if (!testText || typeof testText !== "string") {
      return { success: true, count: 0, matches: [] };
    }

    const check = this.validatePattern(patternStr, flags);
    if (!check.isValid) {
      return { success: false, error: check.error, count: 0, matches: [] };
    }

    const regex = check.regex;
    const matches = [];

    // Ensure global flag to prevent infinite loops with regex.exec
    const isGlobal = flags.includes("g");
    const activeRegex = isGlobal ? regex : new RegExp(patternStr, flags + "g");

    let match;
    let iterations = 0;
    const MAX_ITERATIONS = 5000; // Protection against catastrophic backtracking/infinite loops

    while ((match = activeRegex.exec(testText)) !== null && iterations < MAX_ITERATIONS) {
      iterations++;
      matches.push({
        index: match.index,
        matchText: match[0],
        groups: match.slice(1),
        length: match[0].length
      });

      // Avoid infinite loop on zero-length matches
      if (match.index === activeRegex.lastIndex) {
        activeRegex.lastIndex++;
      }

      if (!isGlobal) break;
    }

    return {
      success: true,
      error: null,
      count: matches.length,
      matches
    };
  },

  // 3. Highlight matched tokens in text safely for DOM rendering
  generateHighlightHtml(patternStr, flags, testText) {
    if (!testText) return "";
    const res = this.testMatches(patternStr, flags, testText);
    if (!res.success || res.matches.length === 0) {
      return this.escapeHtml(testText);
    }

    let lastIndex = 0;
    let resultHtml = "";

    res.matches.forEach((m) => {
      // Unmatched prefix
      resultHtml += this.escapeHtml(testText.slice(lastIndex, m.index));
      // Highlighted match
      resultHtml += `<mark class="bg-blue-500/30 text-blue-300 rounded px-0.5 border border-blue-500/50">${this.escapeHtml(m.matchText)}</mark>`;
      lastIndex = m.index + m.length;
    });

    resultHtml += this.escapeHtml(testText.slice(lastIndex));
    return resultHtml;
  },

  // 4. Find & Replace utility
  replace(patternStr, flags, testText, replaceValue = "") {
    const check = this.validatePattern(patternStr, flags);
    if (!check.isValid) {
      return { success: false, error: check.error, result: testText };
    }
    try {
      const result = testText.replace(check.regex, replaceValue);
      return { success: true, error: null, result };
    } catch (err) {
      return { success: false, error: err.message, result: testText };
    }
  },

  // 5. Utility HTML sanitizer
  escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = RegexTester;
}

if (typeof window !== "undefined") {
  window.RegexTester = RegexTester;
}

// Node.js CLI Validation
if (typeof process !== "undefined" && process.argv && process.argv[1]?.endsWith("regexTester.js")) {
  const sample = "Contact us at support@toollab.org or admin@toollab.org";
  const emailPattern = "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}";
  const res = RegexTester.testMatches(emailPattern, "g", sample);
  console.assert(res.count === 2, "Email extraction assertion failed");

  const rep = RegexTester.replace(emailPattern, "g", sample, "[REDACTED]");
  console.assert(rep.result.includes("[REDACTED]"), "Replacement assertion failed");
  console.log("✔ RegexTester pure engine passed all unit tests");
}