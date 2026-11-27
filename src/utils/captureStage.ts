export type CaptureAspectRatio = '16:9';

export type CaptureOutcome =
  | { status: 'saved'; filename: string; aspectRatio: CaptureAspectRatio }
  | { status: 'cancelled' }
  | { status: 'unsupported'; reason: string }
  | { status: 'error'; reason: string };

interface CaptureStageOptions {
  aspectRatio: CaptureAspectRatio;
  sceneLabel: string;
  transparentBackground?: boolean;
  backdropEdgeColor?: string;
  contentBounds?: {
    widthRatio: number;
    heightRatio: number;
  } | null;
  onHideChrome: () => void;
  onRestoreChrome: () => void;
}

const METADATA_TIMEOUT_MS = 6000;

function waitAnimationFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

function waitMs(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function formatTimestamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${yyyy}${mm}${dd}-${hh}${min}${ss}`;
}

function applyExteriorTransparentKey(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const total = width * height;

  const cornerOffsets = [
    0,
    (width - 1) * 4,
    (height - 1) * width * 4,
    ((height - 1) * width + (width - 1)) * 4,
  ];
  let keyR = 255;
  let keyG = 0;
  let keyB = 255;
  for (const offset of cornerOffsets) {
    const cr = data[offset];
    const cg = data[offset + 1];
    const cb = data[offset + 2];
    if (cr >= 175 && cb >= 175 && Math.min(cr, cb) - cg >= 100) {
      keyR = cr;
      keyG = cg;
      keyB = cb;
      break;
    }
  }
  const keyMagentaSpan = Math.max(120, Math.min(keyR, keyB) - keyG);

  const state = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;

  const isKeyPixel = (idx: number): boolean => {
    const p = idx * 4;
    const r = data[p];
    const g = data[p + 1];
    const b = data[p + 2];
    const dr = Math.abs(r - keyR);
    const dg = Math.abs(g - keyG);
    const db = Math.abs(b - keyB);
    return dr <= 42 && db <= 42 && dg <= 42 && Math.min(r, b) - g >= keyMagentaSpan * 0.65;
  };

  const enqueueIfKey = (idx: number) => {
    if (state[idx] !== 0) return;
    if (isKeyPixel(idx)) {
      state[idx] = 1;
      queue[tail++] = idx;
    }
  };

  for (let x = 0; x < width; x++) {
    enqueueIfKey(x);
    enqueueIfKey((height - 1) * width + x);
  }
  for (let y = 1; y < height - 1; y++) {
    enqueueIfKey(y * width);
    enqueueIfKey(y * width + (width - 1));
  }

  while (head < tail) {
    const idx = queue[head++];
    const x = idx % width;
    const y = (idx - x) / width;

    const p = idx * 4;
    data[p] = 0;
    data[p + 1] = 0;
    data[p + 2] = 0;
    data[p + 3] = 0;

    if (x > 0) {
      const left = idx - 1;
      if (state[left] === 0) {
        if (isKeyPixel(left)) {
          state[left] = 1;
          queue[tail++] = left;
        } else {
          state[left] = 2;
        }
      }
    }
    if (x < width - 1) {
      const right = idx + 1;
      if (state[right] === 0) {
        if (isKeyPixel(right)) {
          state[right] = 1;
          queue[tail++] = right;
        } else {
          state[right] = 2;
        }
      }
    }
    if (y > 0) {
      const up = idx - width;
      if (state[up] === 0) {
        if (isKeyPixel(up)) {
          state[up] = 1;
          queue[tail++] = up;
        } else {
          state[up] = 2;
        }
      }
    }
    if (y < height - 1) {
      const down = idx + width;
      if (state[down] === 0) {
        if (isKeyPixel(down)) {
          state[down] = 1;
          queue[tail++] = down;
        } else {
          state[down] = 2;
        }
      }
    }
  }

  const decontaminate = (idx: number) => {
    const p = idx * 4;
    const r = data[p];
    const g = data[p + 1];
    const b = data[p + 2];
    const magentaExcess = Math.min(r, b) - g;
    if (magentaExcess <= 10) return;

    const bgFraction = Math.min(1, magentaExcess / keyMagentaSpan);
    const alpha = 1 - bgFraction;
    if (alpha <= 0.04) {
      data[p] = 0;
      data[p + 1] = 0;
      data[p + 2] = 0;
      data[p + 3] = 0;
      return;
    }

    const outR = Math.max(0, Math.min(255, Math.round((r - keyR * bgFraction) / alpha)));
    const outG = Math.max(0, Math.min(255, Math.round((g - keyG * bgFraction) / alpha)));
    const outB = Math.max(0, Math.min(255, Math.round((b - keyB * bgFraction) / alpha)));
    data[p] = outR;
    data[p + 1] = outG;
    data[p + 2] = outB;
    data[p + 3] = Math.max(0, Math.min(255, Math.round(alpha * 255)));
  };

  for (let i = 0; i < total; i++) {
    if (state[i] === 2) {
      decontaminate(i);
      const x = i % width;
      const y = (i - x) / width;
      if (x > 0 && state[i - 1] === 0) decontaminate(i - 1);
      if (x < width - 1 && state[i + 1] === 0) decontaminate(i + 1);
      if (y > 0 && state[i - width] === 0) decontaminate(i - width);
      if (y < height - 1 && state[i + width] === 0) decontaminate(i + width);
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function frameCanvasToAspectRatio(
  sourceCanvas: HTMLCanvasElement,
  transparentBackground: boolean,
  backdropEdgeColor: string,
  contentBounds?: { widthRatio: number; heightRatio: number } | null
): HTMLCanvasElement {
  const srcW = sourceCanvas.width;
  const srcH = sourceCanvas.height;
  if (srcW <= 0 || srcH <= 0 || !Number.isFinite(srcW) || !Number.isFinite(srcH)) {
    return sourceCanvas;
  }
  const targetRatio = 16 / 9;
  const srcRatio = srcW / srcH;

  if (Math.abs(srcRatio - targetRatio) < 0.002) {
    return sourceCanvas;
  }

  const contentW = contentBounds ? srcW * contentBounds.widthRatio : srcW * 0.78;
  const contentH = contentBounds ? srcH * contentBounds.heightRatio : srcH * 0.78;
  const safePad = Math.round(Math.min(srcW, srcH) * 0.04);

  let outW: number;
  let outH: number;

  if (srcRatio > targetRatio) {
    const croppedW = Math.round(srcH * targetRatio);
    if (croppedW >= contentW + safePad * 2) {
      outW = croppedW;
      outH = srcH;
    } else {
      outW = srcW;
      outH = Math.round(srcW / targetRatio);
    }
  } else {
    const croppedH = Math.round(srcW / targetRatio);
    if (croppedH >= contentH + safePad * 2) {
      outW = srcW;
      outH = croppedH;
    } else {
      outH = srcH;
      outW = Math.round(srcH * targetRatio);
    }
  }

  const output = document.createElement('canvas');
  output.width = outW;
  output.height = outH;

  const outCtx = output.getContext('2d');
  if (!outCtx) return sourceCanvas;

  if (!transparentBackground) {
    outCtx.fillStyle = backdropEdgeColor;
    outCtx.fillRect(0, 0, outW, outH);
  }

  const dx = Math.round((outW - srcW) / 2);
  const dy = Math.round((outH - srcH) / 2);
  outCtx.drawImage(sourceCanvas, dx, dy);

  return output;
}

function exportCanvasAsPng(canvas: HTMLCanvasElement, filename: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof canvas.toBlob === 'function') {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to encode PNG screenshot.'));
          return;
        }
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
        resolve();
      }, 'image/png');
      return;
    }

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    resolve();
  });
}

export async function captureCleanShowcase({
  aspectRatio,
  sceneLabel,
  transparentBackground = false,
  backdropEdgeColor = '#070707',
  contentBounds = null,
  onHideChrome,
  onRestoreChrome,
}: CaptureStageOptions): Promise<CaptureOutcome> {
  if (
    typeof navigator === 'undefined' ||
    !navigator.mediaDevices ||
    typeof navigator.mediaDevices.getDisplayMedia !== 'function'
  ) {
    return {
      status: 'unsupported',
      reason: 'Screen capture is not supported in this browser. Use your OS screenshot shortcut.',
    };
  }

  let stream: MediaStream | null = null;
  let videoEl: HTMLVideoElement | null = null;
  let rawCanvas: HTMLCanvasElement | null = null;
  let finalCanvas: HTMLCanvasElement | null = null;
  let chromeHidden = false;

  const safeRestore = () => {
    if (chromeHidden) {
      chromeHidden = false;
      onRestoreChrome();
    }
  };

  const releaseMedia = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      stream = null;
    }
    if (videoEl) {
      videoEl.pause();
      videoEl.srcObject = null;
      videoEl = null;
    }
  };

  const releaseCanvases = () => {
    if (finalCanvas && finalCanvas !== rawCanvas) {
      finalCanvas.width = 0;
      finalCanvas.height = 0;
    }
    if (rawCanvas) {
      rawCanvas.width = 0;
      rawCanvas.height = 0;
    }
    finalCanvas = null;
    rawCanvas = null;
  };

  try {
    const constraints = {
      video: {
        displaySurface: 'browser',
        cursor: 'never',
      },
      audio: false,
      preferCurrentTab: true,
      selfBrowserSurface: 'include',
    } as DisplayMediaStreamOptions;

    stream = await navigator.mediaDevices.getDisplayMedia(constraints);

    chromeHidden = true;
    onHideChrome();

    await waitAnimationFrame();
    await waitAnimationFrame();
    await waitMs(180);

    videoEl = document.createElement('video');
    videoEl.muted = true;
    videoEl.playsInline = true;

    const activeTrack = stream.getVideoTracks()[0];
    const targetVideo = videoEl;
    const activeStream = stream;

    await new Promise<void>((resolve, reject) => {
      let settled = false;
      const cleanup = () => {
        window.clearTimeout(timeoutId);
        targetVideo.onloadedmetadata = null;
        targetVideo.onerror = null;
        activeTrack?.removeEventListener('ended', handleEnded);
      };

      const finish = (err?: Error) => {
        if (settled) return;
        settled = true;
        cleanup();
        if (err) reject(err);
        else resolve();
      };

      const handleEnded = () => finish(new Error('Screen capture stream ended unexpectedly.'));
      const timeoutId = window.setTimeout(
        () => finish(new Error('Timed out waiting for screen capture frame.')),
        METADATA_TIMEOUT_MS
      );

      activeTrack?.addEventListener('ended', handleEnded, { once: true });
      targetVideo.onloadedmetadata = () => finish();
      targetVideo.onerror = () => finish(new Error('Failed to read captured stream'));

      targetVideo.srcObject = activeStream;
      if (targetVideo.readyState >= 1 && targetVideo.videoWidth > 0) {
        finish();
      }
    });

    await videoEl.play();

    await waitAnimationFrame();
    await waitMs(50);

    const width = videoEl.videoWidth;
    const height = videoEl.videoHeight;

    if (!width || !height) {
      throw new Error('Captured frame returned empty dimensions.');
    }

    rawCanvas = document.createElement('canvas');
    rawCanvas.width = width;
    rawCanvas.height = height;

    const ctx = rawCanvas.getContext('2d', { willReadFrequently: transparentBackground });
    if (!ctx) {
      throw new Error('Canvas 2D context unavailable.');
    }

    ctx.drawImage(videoEl, 0, 0, width, height);

    releaseMedia();
    safeRestore();

    if (transparentBackground) {
      applyExteriorTransparentKey(ctx, width, height);
    }

    finalCanvas = frameCanvasToAspectRatio(
      rawCanvas,
      transparentBackground,
      backdropEdgeColor,
      contentBounds
    );

    const alphaTag = transparentBackground ? '-transparent' : '';
    const filename = `showcase-${sceneLabel.toLowerCase()}-16x9${alphaTag}-${formatTimestamp(new Date())}.png`;

    await exportCanvasAsPng(finalCanvas, filename);

    return { status: 'saved', filename, aspectRatio };
  } catch (err: unknown) {
    if (err instanceof DOMException) {
      if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
        return { status: 'cancelled' };
      }
      if (err.name === 'NotSupportedError' || err.name === 'SecurityError') {
        return {
          status: 'unsupported',
          reason:
            'Browser tab capture was blocked here. Try opening in a top-level tab or using your OS screenshot tool.',
        };
      }
    }

    return {
      status: 'error',
      reason: 'Could not capture the screen. Please try again or use your OS screenshot tool.',
    };
  } finally {
    releaseMedia();
    releaseCanvases();
    safeRestore();
  }
}
