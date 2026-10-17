/**
 * ToolLab.org - Client-Side Favicon Generator Engine (Zero-dependency Pure Functions)
 * Path: D:\Gemini_Files\ToolLab.org\js\utils\faviconGenerator.js
 */
const FaviconGenerator = {
  // Standard web & mobile platform icon specifications
  SIZES: [
    { name: "favicon-16x16.png", size: 16, rel: "icon", type: "image/png" },
    { name: "favicon-32x32.png", size: 32, rel: "icon", type: "image/png" },
    { name: "apple-touch-icon.png", size: 180, rel: "apple-touch-icon", type: "image/png" },
    { name: "android-chrome-192x192.png", size: 192, rel: "manifest", type: "image/png" },
    { name: "android-chrome-512x512.png", size: 512, rel: "manifest", type: "image/png" }
  ],

  // 1. Render image bitmap to specific dimensions on canvas
  async renderSquareIcon(sourceImage, size) {
    let canvas;
    if (typeof OffscreenCanvas !== "undefined") {
      canvas = new OffscreenCanvas(size, size);
    } else {
      canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
    }

    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Center crop to 1:1 square ratio
    const srcWidth = sourceImage.width;
    const srcHeight = sourceImage.height;
    const minDim = Math.min(srcWidth, srcHeight);
    const startX = (srcWidth - minDim) / 2;
    const startY = (srcHeight - minDim) / 2;

    ctx.drawImage(sourceImage, startX, startY, minDim, minDim, 0, 0, size, size);

    if (canvas.convertToBlob) {
      return await canvas.convertToBlob({ type: "image/png" });
    } else {
      return await new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/png");
      });
    }
  },

  // 2. Generate standard web manifest JSON payload
  generateManifest(appName = "ToolLab App") {
    const manifest = {
      name: appName,
      short_name: appName,
      icons: [
        { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" }
      ],
      theme_color: "#020617",
      background_color: "#020617",
      display: "standalone"
    };
    return JSON.stringify(manifest, null, 2);
  },

  // 3. Generate HTML code snippet for document <head>
  generateHtmlSnippet() {
    return [
      '<!-- ToolLab Favicon Package -->',
      '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">',
      '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">',
      '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">',
      '<link rel="manifest" href="/site.webmanifest">'
    ].join("\n");
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = FaviconGenerator;
}

if (typeof window !== "undefined") {
  window.FaviconGenerator = FaviconGenerator;
}