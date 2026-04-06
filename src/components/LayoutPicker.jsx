'use client';
/**
 * LayoutPicker.jsx
 * Shown after 6 photos are captured.
 * Lets the user choose between:
 *   - strip: single vertical column (6×1)
 *   - grid:  2-column layout (3 rows × 2 cols)
 * Shows live previews using the actual captured photos.
 * Cosmos dark theme.
 */

import React from 'react';

export function LayoutPicker({ photos, onSelectLayout }) {
  return (
    <div className="layout-picker">
      <h2 className="layout-picker-title">choose your layout</h2>
      <p className="layout-picker-sub">pick how you'd like your strip arranged</p>

      <div className="layout-options">
        {/* ── Strip layout ── */}
        <button
          className="layout-option"
          onClick={() => onSelectLayout('strip')}
          aria-label="Single strip layout"
        >
          <div className="layout-preview layout-preview-strip">
            {photos.map((photo, i) => (
              <div key={i} className="lp-cell lp-cell-strip">
                <img src={photo} alt={`photo ${i + 1}`} className="lp-img" />
              </div>
            ))}
          </div>
          <span className="layout-label">single strip</span>
        </button>

        {/* ── Grid layout ── */}
        <button
          className="layout-option"
          onClick={() => onSelectLayout('grid')}
          aria-label="2-column grid layout"
        >
          <div className="layout-preview layout-preview-grid">
            {photos.map((photo, i) => (
              <div key={i} className="lp-cell lp-cell-grid">
                <img src={photo} alt={`photo ${i + 1}`} className="lp-img" />
              </div>
            ))}
          </div>
          <span className="layout-label">2-column grid</span>
        </button>
      </div>
    </div>
  );
}
