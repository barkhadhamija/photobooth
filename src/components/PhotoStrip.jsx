'use client';
/**
 * PhotoStrip.jsx
 * Displays thumbnails of all captured photos.
 * Highlights the currently active photo.
 * Allows clicking to select a photo.
 * No editing logic allowed here.
 */

import React from 'react';

export function PhotoStrip({ photos, activeIndex, onSelectPhoto }) {
  if (photos.length === 0) {
    return null;
  }

  return (
    <div className="photo-strip">
      {photos.map((photo, index) => (
        <div
          key={index}
          className={`photo-thumbnail ${index === activeIndex ? 'active' : ''}`}
          onClick={() => onSelectPhoto(index)}
        >
          <img src={photo} alt={`Photo ${index + 1}`} />
        </div>
      ))}
    </div>
  );
}