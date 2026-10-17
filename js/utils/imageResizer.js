/**
 * ToolLab.org - Client-Side Image Resizing Engine (Zero-dependency Pure Functions)
 * Path: D:\Gemini_Files\ToolLab.org\js\utils\imageResizer.js
 */
const ImageResizer = {
  // 1. Calculate Target Dimensions
  calculateDimensions(origWidth, origHeight, options = {}) {
    const {
      mode = "dimensions", // "dimensions" | "percentage"
      targetWidth,
      targetHeight,
      percentage = 50,
      keepAspectRatio = true
    } = options;

    if (mode === "percentage") {
      const scale = Math.max(1, Math.min(500, percentage)) / 100;
      return {
        width: Math.round(origWidth * scale),
        height: Math.round(origHeight * scale)
      };
    }

    let w = parseInt(targetWidth, 10);
    let h = parseInt(targetHeight, 10);

    if (keepAspectRatio) {
      const ratio = origWidth / origHeight;
      if (w && !h) {
        h = Math.round(w / ratio);
      } else if (!w && h) {
        w = Math.round(h * ratio);
      } else if (w && h) {
        // Fit within bounding box while preserving ratio
        const widthScale = w / origWidth;
        const heightScale = h / origHeight;
        const bestScale = Math.min(widthScale, heightScale);
        w = Math.round(origWidth * bestScale);
        h = Math.round(origHeight * bestScale);
      } else {
        w = origWidth;
        h = origHeight;
      }
    } else {
      w = w || origWidth;
      h = h || origHeight;
    }

    return {
      width: Math.max(1, w),
      height: Math.max(1, h)
    };
  },

  // 2. Resize Single Image File (Returns Blob and Metadata)
  async resizeFile(file, options = {}) {
    if (!file || !file.type.startsWith("image/")) {
      throw new Error("Invalid file format. Image file expected.");
    }

    const {
      outputFormat = file.type || "image/jpeg",
      quality = 0.9
    } = options;

    const bitmap = await createImageBitmap(file);
    const { width: targetWidth, height: targetHeight } = this.calculateDimensions(
      bitmap.width,
      bitmap.height,
      options
    );

    let canvas;
    if (typeof OffscreenCanvas !== "undefined") {
      canvas = new OffscreenCanvas(targetWidth, targetHeight);
    } else {
      canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }

    const ctx = canvas.getContext("2d");
    // High-quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

    let resizedBlob;
    if (canvas.convertToBlob) {
      resizedBlob = await canvas.convertToBlob({ type: outputFormat, quality });
    } else {
      resizedBlob = await new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), outputFormat, quality);
      });
    }

    return {
      originalName: file.name,
      originalSize: file.size,
      resizedSize: resizedBlob.size,
      originalWidth: bitmap.width,
      originalHeight: bitmap.height,
      targetWidth,
      targetHeight,
      blob: resizedBlob,
      outputFormat
    };
  },

  formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = ImageResizer;
}

if (typeof window !== "undefined") {
  window.ImageResizer = ImageResizer;
}