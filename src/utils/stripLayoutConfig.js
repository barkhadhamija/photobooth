/**
 * stripLayoutConfig.js
 * SINGLE SOURCE OF TRUTH for photo strip layout.
 * FIXED: Export now matches preview exactly.
 */

export const STRIP_LAYOUT = {
  stripWidth: 280,
  innerPadding: 20,
  photoGap: 12,
  photoAspectRatio: 1.1,

  get photoWidth() {
    return this.stripWidth - (this.innerPadding * 2);
  },

  get photoHeight() {
    return this.photoWidth * this.photoAspectRatio;
  },

  calculateStripHeight(photoCount) {
    const totalGaps = (photoCount - 1) * this.photoGap;
    const totalPadding = this.innerPadding * 2;
    return totalPadding + (photoCount * this.photoHeight) + totalGaps;
  },

  getPhotoPosition(index) {
    return {
      left: this.innerPadding,
      top: this.innerPadding + (index * (this.photoHeight + this.photoGap)),
      width: this.photoWidth,
      height: this.photoHeight,
    };
  },
};

/**
 * GRID_LAYOUT — 2 columns × 3 rows for 6 photos.
 */
export const GRID_LAYOUT = {
  stripWidth: 280,
  innerPadding: 16,
  photoGap: 10,
  cols: 2,
  rows: 3,
  photoAspectRatio: 1.0,

  get colWidth() {
    const usable = this.stripWidth - (this.innerPadding * 2) - (this.photoGap * (this.cols - 1));
    return usable / this.cols;
  },

  get photoWidth() { return this.colWidth; },

  get photoHeight() { return this.colWidth * this.photoAspectRatio; },

  calculateStripHeight() {
    return (
      this.innerPadding * 2 +
      (this.rows * this.photoHeight) +
      ((this.rows - 1) * this.photoGap)
    );
  },

  getPhotoPosition(index) {
    const col = index % this.cols;
    const row = Math.floor(index / this.cols);
    return {
      left: this.innerPadding + col * (this.photoWidth + this.photoGap),
      top: this.innerPadding + row * (this.photoHeight + this.photoGap),
      width: this.photoWidth,
      height: this.photoHeight,
    };
  },
};


/**
 * Export photo strip - FIXED to match preview
 */
export function exportPhotoStrip(fabricCanvas, photos, backgroundColor, filterMode) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = STRIP_LAYOUT.stripWidth;
    canvas.height = STRIP_LAYOUT.calculateStripHeight(photos.length);

    const ctx = canvas.getContext('2d');

    // Draw background (EXACT same as preview)
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let loadedCount = 0;
    const totalPhotos = photos.length;

    photos.forEach((photoUrl, index) => {
      const img = new Image();
      img.onload = () => {
        const pos = STRIP_LAYOUT.getPhotoPosition(index);

        // Scale to cover (EXACT same as preview)
        const scaleX = pos.width / img.width;
        const scaleY = pos.height / img.height;
        const scale = Math.max(scaleX, scaleY);

        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        const offsetX = (scaledWidth - pos.width) / 2;
        const offsetY = (scaledHeight - pos.height) / 2;

        // Draw photo (EXACT same clipping as preview)
        ctx.save();
        ctx.rect(pos.left, pos.top, pos.width, pos.height);
        ctx.clip();
        ctx.drawImage(
          img,
          pos.left - offsetX,
          pos.top - offsetY,
          scaledWidth,
          scaledHeight
        );
        ctx.restore();

        loadedCount++;

        if (loadedCount === totalPhotos) {
          drawStickersOnExport(ctx, fabricCanvas);
          resolve(canvas.toDataURL('image/png'));
        }
      };
      img.src = photoUrl;
    });
  });
}

function drawStickersOnExport(ctx, fabricCanvas) {
  if (!fabricCanvas) return;

  const objects = fabricCanvas.getObjects();
  
  objects.forEach(obj => {
    if (obj.data && obj.data.type === 'sticker') {
      if (obj._element) {
        ctx.save();
        
        const centerX = obj.left;
        const centerY = obj.top;
        
        ctx.translate(centerX, centerY);
        ctx.rotate((obj.angle * Math.PI) / 180);
        ctx.scale(obj.scaleX, obj.scaleY);
        
        ctx.drawImage(
          obj._element,
          -obj.width / 2,
          -obj.height / 2,
          obj.width,
          obj.height
        );
        
        ctx.restore();
      }
    }
  });
}

export async function downloadPhotoStrip(fabricCanvas, photos, backgroundColor, filterMode, filename = 'photo-booth-strip.png') {
  const dataUrl = await exportPhotoStrip(fabricCanvas, photos, backgroundColor, filterMode);
  
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}