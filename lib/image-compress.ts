// Client-only image compression. We do this before upload so donors on slow
// rural connections aren't pushing 5MB phone screenshots through the server
// action body limit, and so Supabase Storage doesn't fill up with unnecessary
// pixels. Target: longest edge 1080px, JPEG quality 0.85 — payment screenshots
// (mostly text) routinely end up under 200KB after this.

const MAX_DIMENSION = 1080;
const JPEG_QUALITY = 0.85;

export interface CompressedImage {
  blob: Blob;
  width: number;
  height: number;
  sizeBytes: number;
}

export async function compressImage(file: File): Promise<CompressedImage> {
  if (!file.type.startsWith("image/")) {
    throw new Error(`Not an image file: ${file.type}`);
  }

  const bitmap = await loadBitmap(file);
  try {
    const { width, height } = scaledDimensions(
      bitmap.width,
      bitmap.height,
      MAX_DIMENSION,
    );

    const canvas =
      typeof OffscreenCanvas !== "undefined"
        ? new OffscreenCanvas(width, height)
        : Object.assign(document.createElement("canvas"), { width, height });
    const ctx = (canvas as HTMLCanvasElement | OffscreenCanvas).getContext("2d");
    if (!ctx) throw new Error("Could not get 2D canvas context");
    (ctx as CanvasRenderingContext2D).drawImage(bitmap, 0, 0, width, height);

    const blob = await canvasToJpegBlob(canvas, JPEG_QUALITY);
    return { blob, width, height, sizeBytes: blob.size };
  } finally {
    if ("close" in bitmap && typeof bitmap.close === "function") bitmap.close();
  }
}

async function loadBitmap(
  file: File,
): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(file);
  }
  // Safari fallback — load via <img> + object URL.
  return await new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image"));
    };
    img.src = url;
  });
}

function scaledDimensions(w: number, h: number, max: number) {
  if (w <= max && h <= max) return { width: w, height: h };
  if (w >= h) return { width: max, height: Math.round((h / w) * max) };
  return { width: Math.round((w / h) * max), height: max };
}

async function canvasToJpegBlob(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  quality: number,
): Promise<Blob> {
  if ("convertToBlob" in canvas) {
    return canvas.convertToBlob({ type: "image/jpeg", quality });
  }
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) =>
        b ? resolve(b) : reject(new Error("Canvas → blob conversion failed")),
      "image/jpeg",
      quality,
    );
  });
}
