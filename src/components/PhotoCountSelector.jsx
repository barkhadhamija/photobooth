/**
 * PhotoCountSelector.jsx
 * Allows user to choose number of photos for the strip.
 * Options: 3, 4 (default), or 6 photos.
 * Appears before camera capture begins.
 */

import React from 'react';

export function PhotoCountSelector({ selectedCount, onSelectCount, onStart }) {
  const counts = [3, 4, 6];

  return (
    <div className="photo-count-selector">
      <h2 className="selector-title">choose number of photos</h2>
      <div className="count-options">
        {counts.map((count) => (
          <button
            key={count}
            className={`count-button ${selectedCount === count ? 'active' : ''}`}
            onClick={() => onSelectCount(count)}
          >
            {count}
          </button>
        ))}
      </div>
      <button className="capture-button" onClick={onStart}>
        start
      </button>
    </div>
  );
}