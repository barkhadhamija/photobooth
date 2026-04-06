'use client';
/**
 * PhotoCanvas.jsx
 * Renders <canvas> element.
 * Draws captured frame.
 * Applies filters via canvas manipulation.
 * Re-renders image when mode changes.
 * No UI buttons allowed here.
 */

import React, { useRef, useEffect } from 'react';

export function PhotoCanvas({ imageData, mode }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!imageData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Create image from data URL
    const img = new Image();
    img.onload = () => {
      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image first
      ctx.drawImage(img, 0, 0);

      // Apply filter based on mode using pixel manipulation
      if (mode === 'blackAndWhite') {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = avg;     // Red
          data[i + 1] = avg; // Green
          data[i + 2] = avg; // Blue
        }

        ctx.putImageData(imageData, 0, 0);
      } else if (mode === 'softGlow') {
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

    img.onerror = () => {
      console.error('Failed to load image for canvas');
    };

    img.src = imageData;
  }, [imageData, mode]);

  if (!imageData) {
    return null;
  }

  return (
    <div className="canvas-container">
      <canvas ref={canvasRef} className="photo-canvas" />
    </div>
  );
}