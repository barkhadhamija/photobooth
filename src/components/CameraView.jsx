/**
 * CameraView.jsx
 * ORIGINAL WORKING VERSION - RESTORED
 * Renders the <video> element with live filter preview.
 * Displays countdown overlay and filter overlays.
 */

import React, { useEffect, useRef } from 'react';
import { drawOverlay } from '../utils/filters';

export function CameraView({ videoRef, streamRef, streamStatus, countdownValue, activeOverlay }) {
  const overlayCanvasRef = useRef(null);

  // Connect stream to video element
  useEffect(() => {
    if (videoRef.current && streamRef.current && streamStatus === 'active') {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(err => {
        console.error('Video play error:', err);
      });
    }
  }, [videoRef, streamRef, streamStatus]);

  // Draw overlay effects on canvas
  useEffect(() => {
    if (!overlayCanvasRef.current || streamStatus !== 'active') return;
    if (!activeOverlay?.overlay) {
      const ctx = overlayCanvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
      return;
    }

    const canvas = overlayCanvasRef.current;
    const ctx = canvas.getContext('2d');

    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    let animationId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawOverlay(ctx, canvas.width, canvas.height, activeOverlay.overlay);
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [activeOverlay, streamStatus]);

  return (
    <div className="camera-container">
      {streamStatus === 'loading' && (
        <p className="status-text">Loading camera...</p>
      )}
      {streamStatus === 'error' && (
        <p className="status-text">Camera unavailable</p>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="camera-video"
        style={{ 
          display: streamStatus === 'active' ? 'block' : 'none',
          transform: 'scaleX(-1)',
        }}
      />
      
      {streamStatus === 'active' && (
        <canvas ref={overlayCanvasRef} className="overlay-canvas" />
      )}
      
      {countdownValue !== null && (
        <div className="countdown-overlay">
          <div className="countdown-number">{countdownValue}</div>
        </div>
      )}
    </div>
  );
}