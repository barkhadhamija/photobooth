/**
 * BackgroundColorPicker.jsx
 * Displays curated color palette for photo strip background.
 * Also provides a custom colour picker so users can choose any colour.
 * When colors array is empty, only the custom picker swatch is shown.
 * Emits selected color to parent.
 */

import React, { useRef } from 'react';

export function BackgroundColorPicker({ colors = [], selectedColor, onColorChange }) {
  const colorInputRef = useRef(null);

  const hasPresets = Array.isArray(colors) && colors.length > 0;

  return (
    <div className="background-color-picker">
      <div className="color-label">strip background</div>
      <div className="color-swatches">
        {/* Preset swatches — only when the occasion provides them */}
        {hasPresets && colors.map((color, index) => (
          <button
            key={index}
            className={`color-swatch ${selectedColor === color ? 'active' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => onColorChange(color)}
            aria-label={`Select color ${color}`}
          />
        ))}

        {/* Custom colour picker — always visible */}
        <div className="color-swatch color-swatch-custom" title="Pick any colour">
          <span className="custom-swatch-icon">+</span>
          <input
            ref={colorInputRef}
            type="color"
            className="custom-color-input"
            value={selectedColor?.startsWith('#') ? selectedColor.slice(0, 7) : '#ffffff'}
            onChange={(e) => onColorChange(e.target.value)}
            aria-label="Pick a custom colour"
          />
        </div>
      </div>
    </div>
  );
}