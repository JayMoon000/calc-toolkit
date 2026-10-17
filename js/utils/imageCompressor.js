/**
 * ToolLab.org - Client-Side Image Compression Engine (Zero-dependency Pure Functions)
 * Path: D:\Gemini_Files\ToolLab.org\js\utils\imageCompressor.js
 */
const ImageCompressor = {
  // 1. Core Canvas Compression (Blob to Compressed Blob)
  async compressFile(file, options = {}) {
    const {
      quality = 0.8,
      maxWidth = 1920,
      maxHeight = 1080,
      outputFormat = "image/webp" // Default to modern WebP
    } = options;

    if (!file || !file.type.startsWith("image/")) {
      throw new Error("Invalid file type. Please provide an image file.");
    }

    const bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;

    // Calculate aspect ratio scaling
    if (width > maxWidth || height > maxHeight) {
      const widthRatio = maxWidth / width;
      const heightRatio = maxHeight / height;
      const bestRatio = Math.min(widthRatio, heightRatio);

      width = Math.round(width * bestRatio);
      height = Math.round(height * bestRatio);
    }

    // OffscreenCanvas for maximum performance, fallback to standard canvas
    let canvas;
    if (typeof OffscreenCanvas !== "undefined") {
      canvas = new OffscreenCanvas(width, height);
    } else {
      canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
    }

    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, width, height);

    let compressedBlob;
    if (canvas.convertToBlob) {
      compressedBlob = await canvas.convertToBlob({ type: outputFormat, quality });
    } else {
      compressedBlob = await new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), outputFormat, quality);
      });
    }

    return {
      originalSize: file.size,
      compressedSize: compressedBlob.size,
      savedBytes: Math.max(0, file.size - compressedBlob.size),
      savedRatio: Number(Math.max(0, ((file.size - compressedBlob.size) / file.size) * 100).toFixed(1)),
      blob: compressedBlob,
      width,
      height,
      outputFormat
    };
  },

  // 2. Format Byte Display Helper
  formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = ImageCompressor;
}

if (typeof window !== "undefined") {
  window.ImageCompressor = ImageCompressor;
}