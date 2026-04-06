'use client';
/**
 * FinalPhotoStrip.jsx
 * Renders all confirmed photos.
 * Supports two layouts:
 *   - 'strip' (default): single vertical column
 *   - 'grid': 2-column, 3-row grid (for 6 photos)
 * Applies filter to each photo.
 */

import React, { useEffect, useRef } from 'react';

export function FinalPhotoStrip({ photos, filterMode, layout = 'strip' }) {
  const canvasRefs = useRef([]);

  useEffect(() => {
    photos.forEach((photo, index) => {
      const canvas = canvasRefs.current[index];
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        if (filterMode === 'blackAndWhite') {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg;
            data[i + 1] = avg;
            data[i + 2] = avg;
          }
          ctx.putImageData(imageData, 0, 0);
        } else if (filterMode === 'softGlow') {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * 1.2);
            data[i + 1] = Math.min(255, data[i + 1] * 1.1);
            data[i + 2] = Math.min(255, data[i + 2] * 1.1);
          }
          ctx.putImageData(imageData, 0, 0);
        }
      };

      img.src = photo;
    });
  }, [photos, filterMode]);

  if (photos.length === 0) return null;

  const isGrid = layout === 'grid';

  return (
    <div className={isGrid ? 'final-photo-strip-grid' : 'final-photo-strip'}>
      <div className={isGrid ? 'strip-photos-grid' : 'strip-photos'}>
        {photos.map((photo, index) => (
          <div key={index} className={isGrid ? 'strip-photo-grid' : 'strip-photo'}>
            <canvas ref={el => canvasRefs.current[index] = el} />
          </div>
        ))}
      </div>
    </div>
  );
}