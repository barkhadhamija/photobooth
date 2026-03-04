/**
 * StripEditor.jsx
 * Wraps fabric.js canvas for photo strip editing.
 * Uses STRIP_LAYOUT config for exact dimensions.
 */

import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { StickerToolbar } from './StickerToolbar';
import { BackgroundColorPicker } from './BackgroundColorPicker';
import { STRIP_LAYOUT, GRID_LAYOUT, downloadPhotoStrip } from '../utils/stripLayoutConfig';

export function StripEditor({ photos, filterMode, occasion, layout = 'strip', onBack }) {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [selectedBgColor, setSelectedBgColor] = useState(
    occasion?.backgroundColors?.length > 0 ? occasion.backgroundColors[0] : '#FFFFFF'
  );

  // Pick the layout config based on the layout prop
  const LAYOUT = layout === 'grid' ? GRID_LAYOUT : STRIP_LAYOUT;

  const photoCount = photos.length;
  const stripHeight = layout === 'grid'
    ? GRID_LAYOUT.calculateStripHeight()
    : STRIP_LAYOUT.calculateStripHeight(photoCount);

  // Initialize canvas ONCE on mount
  useEffect(() => {
    if (!canvasRef.current || !occasion) return;
    if (fabricCanvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: LAYOUT.stripWidth,
      height: stripHeight,
      backgroundColor: selectedBgColor,
      selectionBorderColor: '#333333',
      selectionLineWidth: 1,
      selectionDashArray: [],
    });

    fabricCanvasRef.current = canvas;

    // Set up keyboard deletion
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.data?.type === 'sticker') {
          canvas.remove(activeObject);
          canvas.renderAll();
          e.preventDefault();
        }
      }
    };

    canvas.on('selection:created', () => {
      document.addEventListener('keydown', handleKeyDown);
    });

    canvas.on('selection:updated', () => {
      document.addEventListener('keydown', handleKeyDown);
    });

    canvas.on('selection:cleared', () => {
      document.removeEventListener('keydown', handleKeyDown);
    });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [stripHeight, occasion]);

  // Update background color separately
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setBackgroundColor(
        selectedBgColor,
        fabricCanvasRef.current.renderAll.bind(fabricCanvasRef.current)
      );
    }
  }, [selectedBgColor]);

  // Load photos onto canvas with STRIP_LAYOUT positioning
  useEffect(() => {
    if (!fabricCanvasRef.current || !photos || photos.length === 0) return;

    const canvas = fabricCanvasRef.current;

    // Clear existing photos (but not stickers)
    const objects = canvas.getObjects();
    objects.forEach(obj => {
      if (obj.data && obj.data.type === 'photo') {
        canvas.remove(obj);
      }
    });

    // Load photos using LAYOUT positions
    photos.forEach((photo, index) => {
      fabric.Image.fromURL(photo, (img) => {
        if (!img) return;

        const pos = LAYOUT.getPhotoPosition(index);

        // Calculate scale to cover (object-fit: cover)
        const scaleX = pos.width / img.width;
        const scaleY = pos.height / img.height;
        const scale = Math.max(scaleX, scaleY);

        img.set({
          scaleX: scale,
          scaleY: scale,
        });

        // Center the image in the photo area
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        
        const offsetX = (scaledWidth - pos.width) / 2;
        const offsetY = (scaledHeight - pos.height) / 2;

        img.set({
          left: pos.left - offsetX,
          top: pos.top - offsetY,
          selectable: false,
          evented: false,
          data: { type: 'photo' },
          clipPath: new fabric.Rect({
            left: pos.left,
            top: pos.top,
            width: pos.width,
            height: pos.height,
            absolutePositioned: true,
          }),
        });

        canvas.add(img);
        canvas.sendToBack(img);
        canvas.renderAll();
      }, { crossOrigin: 'anonymous' });
    });
  }, [photos]);

  const handleAddSticker = (stickerUrl) => {
    if (!fabricCanvasRef.current) return;

    fabric.Image.fromURL(stickerUrl, (img) => {
      if (!img) {
        console.error('Failed to load sticker:', stickerUrl);
        return;
      }

      img.set({
        left: fabricCanvasRef.current.width / 2,
        top: fabricCanvasRef.current.height / 2,
        originX: 'center',
        originY: 'center',
        scaleX: 0.3,
        scaleY: 0.3,
        data: { type: 'sticker' },
        hasControls: true,
        hasBorders: true,
        lockScalingFlip: true,
        cornerStyle: 'circle',
        cornerSize: 10,
        cornerColor: 'white',
        cornerStrokeColor: '#333333',
        borderColor: '#333333',
        borderScaleFactor: 2,
        transparentCorners: false,
        hasRotatingPoint: true,
      });

      img.setControlsVisibility({
        mt: false,
        mb: false,
        ml: false,
        mr: false,
      });

      fabricCanvasRef.current.add(img);
      fabricCanvasRef.current.setActiveObject(img);
      fabricCanvasRef.current.renderAll();
    });
  };

  const handleColorChange = (color) => {
    setSelectedBgColor(color);
  };

  const handleDownload = async () => {
    if (!fabricCanvasRef.current) return;
    
    try {
      await downloadPhotoStrip(
        fabricCanvasRef.current,
        photos,
        selectedBgColor,
        'photo-booth-strip.png'
      );
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  // Safety checks
  if (!occasion) {
    return <div>Loading occasion...</div>;
  }

  if (!photos || photos.length === 0) {
    return <div>No photos available</div>;
  }

  // Allow empty backgroundColors — BackgroundColorPicker handles it (shows only custom picker)

  if (!occasion.stickers || !Array.isArray(occasion.stickers)) {
    return <div>No stickers available for this occasion</div>;
  }

  return (
    <div className="strip-editor">
      <canvas ref={canvasRef} />
      <div className="editor-hint">
        click stickers to move, resize, or rotate. press delete to remove.
      </div>
      <BackgroundColorPicker
        colors={occasion.backgroundColors}
        selectedColor={selectedBgColor}
        onColorChange={handleColorChange}
      />
      <StickerToolbar 
        stickers={occasion.stickers} 
        onAddSticker={handleAddSticker}
      />
      <div className="confirmation-buttons">
        <button className="retake-button" onClick={onBack}>
          Back to Occasions
        </button>
        <button className="capture-button download-button" onClick={handleDownload}>
          Download Strip
        </button>
      </div>
    </div>
  );
}