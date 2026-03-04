/**
 * filters.js
 * Simplified filter system.
 * Capture overlays (hearts, sparkles, blush) - decorative only
 * Post-capture filters (vintage, B&W, soft glow) - color grading only
 */

// CAPTURE OVERLAYS ONLY (no color filters during capture)
export const captureOverlays = [
  {
    id: 'none',
    name: 'None',
    overlay: null,
  },
  {
    id: 'hearts',
    name: 'Hearts',
    overlay: 'hearts',
  },
  {
    id: 'sparkles',
    name: 'Sparkles',
    overlay: 'sparkles',
  },
  {
    id: 'blush',
    name: 'Blush',
    overlay: 'blush',
  },
];

// POST-CAPTURE FILTERS ONLY (applied after capture)
export const postCaptureFilters = {
  normal: 'none',
  vintage: 'vintage',
  blackAndWhite: 'blackAndWhite',
  softGlow: 'softGlow',
};

// Canvas filter processing (POST-CAPTURE ONLY)
export function applyCanvasFilters(ctx, canvas, filterType) {
  if (!filterType || filterType === 'none') return;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  if (filterType === 'blackAndWhite') {
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg;
      data[i + 1] = avg;
      data[i + 2] = avg;
    }
  } else if (filterType === 'softGlow') {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * 1.2);
      data[i + 1] = Math.min(255, data[i + 1] * 1.1);
      data[i + 2] = Math.min(255, data[i + 2] * 1.1);
    }
  } else if (filterType === 'vintage') {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      data[i] = Math.min(255, r * 1.2 + g * 0.4 + b * 0.3);
      data[i + 1] = Math.min(255, r * 0.3 + g * 1.0 + b * 0.2);
      data[i + 2] = Math.min(255, r * 0.2 + g * 0.25 + b * 0.7);

      data[i] = Math.min(255, data[i] + 15);
      data[i + 1] = Math.min(255, data[i + 1] + 15);
      data[i + 2] = Math.min(255, data[i + 2] + 15);
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

// Overlay drawing functions (CAPTURE ONLY)
export function drawOverlay(ctx, width, height, overlayType) {
  if (!overlayType) return;

  if (overlayType === 'hearts') {
    drawHearts(ctx, width, height);
  } else if (overlayType === 'sparkles') {
    drawSparkles(ctx, width, height);
  } else if (overlayType === 'blush') {
    drawBlush(ctx, width, height);
  }
}

function drawHearts(ctx, width, height) {
  const positions = [
    { x: width * 0.3, y: height * 0.2, size: 30, rotation: -15 },
    { x: width * 0.7, y: height * 0.25, size: 25, rotation: 15 },
    { x: width * 0.5, y: height * 0.15, size: 35, rotation: 0 },
  ];

  positions.forEach(pos => {
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate((pos.rotation * Math.PI) / 180);

    ctx.fillStyle = 'rgba(255, 105, 180, 0.7)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;

    const size = pos.size;
    ctx.beginPath();
    ctx.moveTo(0, size * 0.3);
    ctx.bezierCurveTo(-size * 0.5, -size * 0.3, -size, size * 0.1, 0, size);
    ctx.bezierCurveTo(size, size * 0.1, size * 0.5, -size * 0.3, 0, size * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  });
}

function drawSparkles(ctx, width, height) {
  const positions = [
    { x: width * 0.25, y: height * 0.3, size: 20 },
    { x: width * 0.75, y: height * 0.3, size: 20 },
    { x: width * 0.5, y: height * 0.2, size: 25 },
    { x: width * 0.35, y: height * 0.25, size: 15 },
    { x: width * 0.65, y: height * 0.28, size: 15 },
  ];

  positions.forEach(pos => {
    drawStar(ctx, pos.x, pos.y, pos.size);
  });
}

function drawStar(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 2;

  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const radius = i % 2 === 0 ? size : size * 0.4;
    const angle = (i * Math.PI) / 4;
    const px = Math.cos(angle) * radius;
    const py = Math.sin(angle) * radius;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawBlush(ctx, width, height) {
  const cheekLeft = { x: width * 0.35, y: height * 0.5 };
  const cheekRight = { x: width * 0.65, y: height * 0.5 };

  [cheekLeft, cheekRight].forEach(cheek => {
    const gradient = ctx.createRadialGradient(
      cheek.x, cheek.y, 0,
      cheek.x, cheek.y, 40
    );
    gradient.addColorStop(0, 'rgba(239, 114, 137, 0.6)');
    gradient.addColorStop(1, 'rgba(255, 150, 170, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cheek.x, cheek.y, 40, 0, Math.PI * 2);
    ctx.fill();
  });
}