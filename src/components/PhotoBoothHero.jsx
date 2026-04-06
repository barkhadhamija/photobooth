'use client';
/**
 * PhotoBoothHero.jsx
 * Landing page inspired by cosmos.so — dark mosaic with scattered photos,
 * centered text that fades in after 1-2s, subtle parallax on hover.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';

const IMAGES = [
  '/assets/pic1.png',
  '/assets/pic2.png',
  '/assets/pic3.png',
  '/assets/pic4.png',
  '/assets/pic5.png',
  '/assets/pic6.png',
  '/assets/pic7.png',
  '/assets/pic8.png',
];

// Each photo tile: positioned absolutely with specific sizes/positions
// Designed to frame the center text, like cosmos.so
const TILES = [
  // Top-left area
  { img: 0, top: '3%',  left: '2%',   width: 180, height: 220, rotate: -3 },
  { img: 1, top: '8%',  left: '18%',  width: 150, height: 170, rotate: 2 },
  // Top-center-left
  { img: 2, top: '2%',  left: '35%',  width: 140, height: 160, rotate: -1 },
  // Top-center-right
  { img: 3, top: '5%',  left: '55%',  width: 160, height: 140, rotate: 3 },
  // Top-right area
  { img: 4, top: '3%',  left: '75%',  width: 170, height: 200, rotate: -2 },
  { img: 5, top: '12%', left: '88%',  width: 140, height: 170, rotate: 4 },
  // Left side middle
  { img: 6, left: '1%',  top: '38%',  width: 160, height: 190, rotate: 2 },
  { img: 7, left: '14%', top: '50%',  width: 140, height: 160, rotate: -4 },
  // Right side middle
  { img: 0, left: '82%', top: '35%',  width: 170, height: 180, rotate: -3 },
  { img: 1, left: '72%', top: '48%',  width: 150, height: 170, rotate: 5 },
  // Bottom-left
  { img: 2, left: '3%',  top: '72%',  width: 160, height: 180, rotate: 3 },
  { img: 3, left: '18%', top: '78%',  width: 140, height: 160, rotate: -2 },
  // Bottom-center-left
  { img: 4, left: '34%', top: '75%',  width: 150, height: 170, rotate: 1 },
  // Bottom-center-right
  { img: 5, left: '52%', top: '76%',  width: 160, height: 150, rotate: -3 },
  // Bottom-right
  { img: 6, left: '70%', top: '74%',  width: 150, height: 180, rotate: 2 },
  { img: 7, left: '85%', top: '70%',  width: 170, height: 200, rotate: -4 },
];

export default function PhotoBoothHero({ onGetStarted }) {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [textVisible, setTextVisible] = useState(false);
  const [subtextVisible, setSubtextVisible] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const rafRef = useRef(null);
  const targetPos = useRef({ x: 0.5, y: 0.5 });
  const currentPos = useRef({ x: 0.5, y: 0.5 });

  // Smoothly interpolate mouse position for buttery parallax
  const lerp = (a, b, t) => a + (b - a) * t;

  const animate = useCallback(() => {
    currentPos.current.x = lerp(currentPos.current.x, targetPos.current.x, 0.08);
    currentPos.current.y = lerp(currentPos.current.y, targetPos.current.y, 0.08);
    setMousePos({ x: currentPos.current.x, y: currentPos.current.y });
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  // Text animation delays
  useEffect(() => {
    const t1 = setTimeout(() => setTextVisible(true), 1200);
    const t2 = setTimeout(() => setSubtextVisible(true), 1800);
    const t3 = setTimeout(() => setHintVisible(true), 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    targetPos.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  };

  // Calculate very subtle parallax offset per tile (max ~6px movement)
  const getParallaxStyle = (index) => {
    const intensity = 6; // max pixels of movement — very subtle
    const offsetX = (mousePos.x - 0.5) * intensity * ((index % 3) - 1);
    const offsetY = (mousePos.y - 0.5) * intensity * ((index % 2 === 0) ? 1 : -1);
    return {
      transform: `translate(${offsetX}px, ${offsetY}px)`,
    };
  };

  return (
    <div
      ref={containerRef}
      className="hero-landing"
      onClick={onGetStarted}
      onMouseMove={handleMouseMove}
    >
      {/* Background photo tiles */}
      {TILES.map((tile, i) => (
        <div
          key={i}
          className="hero-tile"
          style={{
            top: tile.top,
            left: tile.left,
            width: tile.width,
            height: tile.height,
            '--rotate': `${tile.rotate}deg`,
            animationDelay: `${i * 0.08}s`,
          }}
        >
          <div className="hero-tile-inner" style={getParallaxStyle(i)}>
            <img
              src={IMAGES[tile.img]}
              alt=""
              draggable={false}
              loading="eager"
            />
          </div>
        </div>
      ))}

      {/* Center text overlay */}
      <div className="hero-center">
        <h1 className={`hero-title ${textVisible ? 'visible' : ''}`}>
          photobooth
        </h1>
        <p className={`hero-subtitle ${subtextVisible ? 'visible' : ''}`}>
          capture beautiful memories
        </p>
      </div>

      {/* Bottom hint */}
      <p className={`hero-hint ${hintVisible ? 'visible' : ''}`}>
        click anywhere to begin
      </p>
    </div>
  );
}