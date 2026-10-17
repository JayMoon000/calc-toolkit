/**
 * ToolLab.org - JSON Formatter & Validator Engine (Pure Functions)
 * Path: D:\Gemini_Files\ToolLab.org\js\utils\jsonFormatter.js
 */
const JsonFormatter = {
  // 1. Validate & Parse with line/column error extraction
  validate(rawJson) {
    if (!rawJson || typeof rawJson !== "string") {
      return { isValid: false, error: "Input is empty", parsed: null, line: null, column: null };
    }
    try {
      const parsed = JSON.parse(rawJson);
      return { isValid: true, error: null, parsed, line: null, column: null };
    } catch (err) {
      const message = err.message;
      let line = null;
      let column = null;

      // Extract line and column info from browser error syntax
      const lineColMatch = message.match(/line (\d+) column (\d+)/i);
      const posMatch = message.match(/position (\d+)/i);

      if (lineColMatch) {
        line = parseInt(lineColMatch[1], 10);
        column = parseInt(lineColMatch[2], 10);
      } else if (posMatch) {
        const pos = parseInt(posMatch[1], 10);
        const prefix = rawJson.substring(0, pos);
        const lines = prefix.split("\n");
        line = lines.length;
        column = lines[lines.length - 1].length + 1;
      }

      return { isValid: false, error: message, parsed: null, line, column };
    }
  },

  // 2. Format / Beautify (2 spaces, 4 spaces, or tab)
  beautify(rawJson, indent = 2) {
    const check = this.validate(rawJson);
    if (!check.isValid) return { success: false, error: check.error, result: rawJson };
    const indentSpace = indent === "tab" ? "\t" : parseInt(indent, 10);
    return { success: true, error: null, result: JSON.stringify(check.parsed, null, indentSpace) };
  },

  // 3. Minify / Compact single line
  minify(rawJson) {
    const check = this.validate(rawJson);
    if (!check.isValid) return { success: false, error: check.error, result: rawJson };
    return { success: true, error: null, result: JSON.stringify(check.parsed) };
  },

  // 4. Calculate Structural Payload Statistics
  getStats(rawJson) {
    const check = this.validate(rawJson);
    const byteSize = new Blob([rawJson]).size;
    if (!check.isValid) {
      return { isValid: false, byteSize, keyCount: 0, depth: 0, type: "Invalid" };
    }

    const val = check.parsed;
    let keyCount = 0;
    let maxDepth = 0;

    function traverse(node, currentDepth) {
      if (currentDepth > maxDepth) maxDepth = currentDepth;
      if (node && typeof node === "object") {
        if (Array.isArray(node)) {
          node.forEach(item => traverse(item, currentDepth + 1));
        } else {
          const keys = Object.keys(node);
          keyCount += keys.length;
          keys.forEach(k => traverse(node[k], currentDepth + 1));
        }
      }
    }

    traverse(val, 1);
    const rootType = Array.isArray(val) ? "Array" : typeof val === "object" && val !== null ? "Object" : "Primitive";

    return { isValid: true, byteSize, keyCount, depth: maxDepth, type: rootType };
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = JsonFormatter;
}

if (typeof window !== "undefined") {
  window.JsonFormatter = JsonFormatter;
}

// Node.js CLI Validation
if (typeof process !== "undefined" && process.argv && process.argv[1]?.endsWith("jsonFormatter.js")) {
  const sample = '{"name":"ToolLab","tags":["fast","free"],"nested":{"ok":true}}';
  const beat = JsonFormatter.beautify(sample, 2);
  console.assert(beat.success && beat.result.includes("\n"), "Beautify assertion failed");

  const min = JsonFormatter.minify(beat.result);
  console.assert(min.success && !min.result.includes("\n"), "Minify assertion failed");

  const stats = JsonFormatter.getStats(sample);
  console.assert(stats.isValid && stats.keyCount === 3 && stats.depth === 3, "Stats assertion failed");
  console.log("✔ JsonFormatter pure engine passed all unit tests");
}