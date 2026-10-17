/**
 * ToolLab.org - Client-Side QR Code Engine (Pure Functions & SVG/Canvas Renderer)
 * Path: D:\Gemini_Files\ToolLab.org\js\utils\qrGenerator.js
 */
const QrGenerator = {
  // 1. Data Payloads Formatter
  formatPayload(type, data = {}) {
    switch (type) {
      case "url":
        let url = (data.url || "").trim();
        if (url && !/^[a-zA-Z][a-zA-Z\d+\-.]*?:/.test(url)) {
          url = "https://" + url;
        }
        return url;

      case "wifi":
        // Format: WIFI:S:<SSID>;T:<WPA|WEP|nopass>;P:<PASSWORD>;H:<true|false>;;
        const ssid = (data.ssid || "").replace(/([\\;,:"])/g, "\\$1");
        const pass = (data.password || "").replace(/([\\;,:"])/g, "\\$1");
        const auth = data.auth || "WPA";
        const hidden = data.hidden ? "true" : "false";
        return `WIFI:S:${ssid};T:${auth};P:${pass};H:${hidden};;`;

      case "vcard":
        // Standard vCard 3.0
        return [
          "BEGIN:VCARD",
          "VERSION:3.0",
          `N:${data.lastName || ""};${data.firstName || ""};;;`,
          `FN:${data.firstName || ""} ${data.lastName || ""}`.trim(),
          data.org ? `ORG:${data.org}` : "",
          data.title ? `TITLE:${data.title}` : "",
          data.phone ? `TEL;TYPE=CELL:${data.phone}` : "",
          data.email ? `EMAIL:${data.email}` : "",
          data.url ? `URL:${data.url}` : "",
          "END:VCARD"
        ].filter(Boolean).join("\n");

      case "email":
        const subject = encodeURIComponent(data.subject || "");
        const body = encodeURIComponent(data.body || "");
        return `mailto:${(data.email || "").trim()}?subject=${subject}&body=${body}`;

      case "text":
      default:
        return data.text || "";
    }
  },

  // 2. High-Resolution PNG Export from Canvas
  downloadPng(canvas, filename = "qrcode.png") {
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  },

  // 3. SVG Vector Export
  downloadSvg(svgElement, filename = "qrcode.svg") {
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgElement);
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const link = document.createElement("a");
    link.download = filename;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = QrGenerator;
}

if (typeof window !== "undefined") {
  window.QrGenerator = QrGenerator;
}