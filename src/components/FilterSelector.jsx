'use client';
/**
 * FilterSelector.jsx (renamed to OverlaySelector)
 * Displays OVERLAY options for live camera preview.
 * Hearts, Sparkles, Blush only - NO color filters.
 */

import React from 'react';

export function OverlaySelector({ overlays, activeOverlay, onOverlayChange }) {
  return (
    <div className="filter-selector">
      <div className="filter-label">Overlay:</div>
      <div className="filter-options">
        {overlays.map((overlay) => (
          <button
            key={overlay.id}
            className={`filter-option ${activeOverlay?.id === overlay.id ? 'active' : ''}`}
            onClick={() => onOverlayChange(overlay)}
          >
            {overlay.name}
          </button>
        ))}
      </div>
    </div>
  );
}