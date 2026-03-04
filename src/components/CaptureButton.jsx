/**
 * CaptureButton.jsx
 * Renders a single "Capture" button.
 * Emits a callback when clicked.
 * No camera or canvas logic allowed here.
 */

import React from 'react';

export function CaptureButton({ onCapture, disabled }) {
  return (
    <button
      className="capture-button"
      onClick={onCapture}
      disabled={disabled}
    >
      Capture
    </button>
  );
}