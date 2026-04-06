'use client';
/**
 * ModeSelector.jsx
 * Renders three buttons: Normal, Black & White, Soft Glow.
 * Manages selected mode state.
 * Notifies parent of mode change.
 * No canvas logic allowed here.
 */

import React from 'react';

export function ModeSelector({ selectedMode, onModeChange }) {
  const modes = [
    { id: 'normal', label: 'Normal' },
    { id: 'blackAndWhite', label: 'Black & White' },
    { id: 'softGlow', label: 'Soft Glow' },
  ];

  return (
    <div className="mode-selector">
      {modes.map((mode) => (
        <button
          key={mode.id}
          className={`mode-button ${selectedMode === mode.id ? 'active' : ''}`}
          onClick={() => onModeChange(mode.id)}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}