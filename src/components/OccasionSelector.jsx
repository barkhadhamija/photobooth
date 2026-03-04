/**
 * OccasionSelector.jsx
 * Displays occasion options as buttons.
 * Emits selected occasion to parent.
 */

import React from 'react';
import { occasions } from '../utils/occasions';

export function OccasionSelector({ onSelectOccasion }) {
  const occasionList = Object.values(occasions);

  const handleShowAllStickers = () => {
    // Generate a unique list of background colors from all occasions (excluding graduation)
    const combinedColors = Array.from(
      new Set(
        occasionList
          .filter(o => o.id !== 'graduation')
          .flatMap(o => o.backgroundColors)
      )
    );
    // Combine all stickers (excluding graduation)
    const combinedStickers = occasionList
      .filter(o => o.id !== 'graduation')
      .flatMap(o => o.stickers);

    onSelectOccasion({
      id: 'all',
      name: 'All Stickers',
      defaultFilter: 'normal',
      backgroundColors: [],  // no presets — just the custom picker
      stickers: combinedStickers,
    });
  };

  return (
    <div className="occasion-selector">
      <h2 className="occasion-title">choose an occasion</h2>
      <div className="occasion-buttons">
        {occasionList.map((occasion) => (
          <button
            key={occasion.id}
            className="occasion-button"
            onClick={() => onSelectOccasion(occasion)}
          >
            {occasion.name.toLowerCase()}
          </button>
        ))}
      </div>
      <button 
        className="occasion-button occasion-button-all"
        onClick={handleShowAllStickers}
      >
        show all stickers
      </button>
    </div>
  );
}