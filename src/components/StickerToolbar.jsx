'use client';
/**
 * StickerToolbar.jsx
 * Displays available stickers for selected occasion.
 * Click to add sticker to canvas.
 * Uses image previews instead of emoji.
 */

import React from 'react';

export function StickerToolbar({ stickers, onAddSticker }) {
  // Safety check
  if (!stickers || !Array.isArray(stickers) || stickers.length === 0) {
    return (
      <div className="sticker-toolbar">
        <div className="sticker-label">no stickers available</div>
      </div>
    );
  }

  return (
    <div className="sticker-toolbar">
      <div className="sticker-label">add stickers:</div>
      <div className="sticker-buttons">
        {stickers.map((sticker, index) => {
          // Safety check for each sticker
          if (!sticker || !sticker.url) {
            return null;
          }

          return (
            <button
              key={index}
              className="sticker-button"
              onClick={() => onAddSticker(sticker.url)}
              title={sticker.name || 'Sticker'}
            >
              <img 
                src={sticker.url} 
                alt={sticker.name || 'Sticker'} 
                className="sticker-preview"
                onError={(e) => {
                  console.error('Failed to load sticker image:', sticker.url);
                  e.target.style.display = 'none';
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}