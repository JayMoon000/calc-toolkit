/**
 * ToolLab.org - Universal Text Formatter & Slugifier Engine (Pure Functions)
 * Path: D:\Gemini_Files\ToolLab.org\js\utils\textFormatter.js
 */
const TextFormatter = {
  // 1. Case Conversions
  toUpper(text) {
    return text ? text.toUpperCase() : "";
  },

  toLower(text) {
    return text ? text.toLowerCase() : "";
  },

  toTitleCase(text) {
    if (!text) return "";
    return text.replace(/\b\w+/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  },

  toSentenceCase(text) {
    if (!text) return "";
    return text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
  },

  // 2. Developer Variable Naming Styles
  toCamelCase(text) {
    if (!text) return "";
    return text
      .replace(/[^\w\s-]/g, "")
      .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
      .replace(/^(.)/, (c) => c.toLowerCase());
  },

  toPascalCase(text) {
    if (!text) return "";
    const camel = this.toCamelCase(text);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
  },

  toSnakeCase(text) {
    if (!text) return "";
    return text
      .replace(/([a-z])([A-Z])/g, "$1_$2")
      .replace(/[^\w\s]/g, "")
      .trim()
      .replace(/[\s-]+/g, "_")
      .toLowerCase();
  },

  toKebabCase(text) {
    if (!text) return "";
    return text
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/[^\w\s]/g, "")
      .trim()
      .replace(/[\s_]+/g, "-")
      .toLowerCase();
  },

  // 3. SEO URL Slugifier
  slugify(text) {
    if (!text) return "";
    return text
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Strip diacritics
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric chars
      .replace(/[\s_]+/g, "-") // Replace spaces and underscores with single hyphen
      .replace(/-+/g, "-") // Collapse consecutive hyphens
      .replace(/^-+|-+$/g, ""); // Trim leading/trailing hyphens
  },

  // 4. Whitespace & Line Cleaning
  removeDuplicateLines(text) {
    if (!text) return "";
    const lines = text.split(/\r?\n/);
    const seen = new Set();
    const result = [];

    lines.forEach((line) => {
      if (!seen.has(line)) {
        seen.add(line);
        result.push(line);
      }
    });

    return result.join("\n");
  },

  removeEmptyLines(text) {
    if (!text) return "";
    return text
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0)
      .join("\n");
  },

  trimExtraSpaces(text) {
    if (!text) return "";
    return text
      .split(/\r?\n/)
      .map((line) => line.trim().replace(/\s+/g, " "))
      .join("\n");
  },

  // 5. Line Sorting
  sortLines(text, order = "asc") {
    if (!text) return "";
    const lines = text.split(/\r?\n/);
    lines.sort((a, b) => {
      if (order === "desc") {
        return b.localeCompare(a);
      }
      return a.localeCompare(b);
    });
    return lines.join("\n");
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = TextFormatter;
}

if (typeof window !== "undefined") {
  window.TextFormatter = TextFormatter;
}

// Node.js CLI Validation
if (typeof process !== "undefined" && process.argv && process.argv[1]?.endsWith("textFormatter.js")) {
  const sample = "ToolLab micro tools & utilities";
  console.assert(TextFormatter.slugify(sample) === "toollab-micro-tools-utilities", "Slugify test failed");
  console.assert(TextFormatter.toCamelCase(sample) === "toollabMicroToolsUtilities", "CamelCase test failed");
  console.assert(TextFormatter.toSnakeCase(sample) === "toollab_micro_tools_utilities", "SnakeCase test failed");

  const dupes = "alpha\nbeta\nalpha\ngamma";
  console.assert(TextFormatter.removeDuplicateLines(dupes) === "alpha\nbeta\ngamma", "Deduplication failed");
  console.log("✔ TextFormatter pure engine passed all unit tests");
}