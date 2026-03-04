/**
 * App.jsx
 * Camera initializes ONLY after landing page is dismissed
 */

import React, { useState, useRef } from 'react';
import { CameraView } from './components/CameraView';
import { CaptureButton } from './components/CaptureButton';
import { ModeSelector } from './components/ModeSelector';
import { PhotoCanvas } from './components/PhotoCanvas';
import { PhotoStrip } from './components/PhotoStrip';
import { FinalPhotoStrip } from './components/FinalPhotoStrip';
import { OccasionSelector } from './components/OccasionSelector';
import { StripEditor } from './components/StripEditor';
import { PhotoCountSelector } from './components/PhotoCountSelector';
import { LayoutPicker } from './components/LayoutPicker';
import { OverlaySelector } from './components/FilterSelector';
import PhotoBoothHero from './components/PhotoBoothHero';
import { captureOverlays, drawOverlay } from './utils/filters';
// ✅ Grainient import removed from here — it is now used inside PhotoBoothHero

function App() {  
  // Landing page state
  const [hasEntered, setHasEntered] = useState(false);
  const [cameraInitialized, setCameraInitialized] = useState(false);

  // Camera refs and state
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [streamStatus, setStreamStatus] = useState('idle');

  const [photos, setPhotos] = useState([]);
  const [pendingPhoto, setPendingPhoto] = useState(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [selectedMode, setSelectedMode] = useState('normal');
  const [currentPhase, setCurrentPhase] = useState('photo-count-selection');
  const [stripFilterMode, setStripFilterMode] = useState('normal');
  const [selectedOccasion, setSelectedOccasion] = useState(null);
  const [photoCount, setPhotoCount] = useState(4);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(null);
  const [activeOverlay, setActiveOverlay] = useState(captureOverlays[0]);
  const [stripLayout, setStripLayout] = useState('strip'); // 'strip' | 'grid'
  const countdownTimerRef = useRef(null);

  // Initialize camera ONLY after landing page dismissed
  React.useEffect(() => {
    if (!cameraInitialized) return;

    async function startCamera() {
      setStreamStatus('loading');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: false,
        });

        streamRef.current = stream;
        setStreamStatus('active');
      } catch (error) {
        console.error('Camera access error:', error);
        setStreamStatus('error');
      }
    }

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraInitialized]);

  // Connect stream to video element when ready
  React.useEffect(() => {
    if (videoRef.current && streamRef.current && streamStatus === 'active') {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(err => {
        console.error('Video play error:', err);
      });
    }
  }, [streamStatus]);

  const handleGetStarted = () => {
    setHasEntered(true);
    setCameraInitialized(true);
  };

  const handleCapture = () => {
    if (isCountingDown) return;
    if (!videoRef.current) return;
    if (photos.length >= photoCount) return;

    setIsCountingDown(true);
    setCountdownValue(3);

    let currentCount = 3;
    countdownTimerRef.current = setInterval(() => {
      currentCount -= 1;
      
      if (currentCount === 0) {
        clearInterval(countdownTimerRef.current);
        setCountdownValue(null);
        performCapture();
        setIsCountingDown(false);
      } else {
        setCountdownValue(currentCount);
      }
    }, 1000);
  };

  const performCapture = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    if (activeOverlay.overlay) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      drawOverlay(ctx, canvas.width, canvas.height, activeOverlay.overlay);
    }

    const imageData = canvas.toDataURL('image/png');
    setPendingPhoto(imageData);
  };

  const handleConfirm = () => {
    if (!pendingPhoto) return;

    const newPhotos = [...photos, pendingPhoto];
    setPhotos(newPhotos);
    setActivePhotoIndex(newPhotos.length - 1);
    setPendingPhoto(null);
    
    if (newPhotos.length >= photoCount) {
      // Always go to filter first, then layout picker (if 6 photos) after
      setCurrentPhase('filter-selection');
    }
  };

  const handleRetakePending = () => {
    setPendingPhoto(null);
  };

  const handleApplyFilter = () => {
    setStripFilterMode(selectedMode);
    // For 6 photos, show layout picker next; otherwise go straight to strip-display
    if (photoCount === 6) {
      setCurrentPhase('layout-selection');
    } else {
      setCurrentPhase('strip-display');
    }
  };

  const handleSelectLayout = (layout) => {
    setStripLayout(layout);
    setCurrentPhase('strip-display');
  };

  const handleContinueToOccasion = () => {
    setCurrentPhase('occasion-selection');
  };

  const handleSelectOccasion = (occasion) => {
    setSelectedOccasion(occasion);
    setStripFilterMode(occasion.defaultFilter);
    setCurrentPhase('strip-editing');
  };

  const handleStartCapture = () => {
    setCurrentPhase('capture');
  };

  React.useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  // Show landing page (with Grainient background built in)
  if (!hasEntered) {
    return <PhotoBoothHero onGetStarted={handleGetStarted} />;
  }

  const showPhotoCountSelection = currentPhase === 'photo-count-selection';
  const showCamera = currentPhase === 'capture' && !pendingPhoto && photos.length < photoCount;
  const showPendingConfirmation = currentPhase === 'capture' && pendingPhoto !== null;
  const showLayoutSelection = currentPhase === 'layout-selection';
  const showFilterSelection = currentPhase === 'filter-selection';
  const showStripDisplay = currentPhase === 'strip-display';
  const showOccasionSelection = currentPhase === 'occasion-selection';
  const showStripEditing = currentPhase === 'strip-editing';

  return (
    <div className="app">
      <h1 className="app-title">photobooth</h1>

      <div className="main-content">
        {showPhotoCountSelection && (
          <PhotoCountSelector
            selectedCount={photoCount}
            onSelectCount={setPhotoCount}
            onStart={handleStartCapture}
          />
        )}

        {showCamera && (
          <>
            <CameraView 
              videoRef={videoRef} 
              streamRef={streamRef} 
              streamStatus={streamStatus}
              countdownValue={countdownValue}
              activeOverlay={activeOverlay}
            />
            <OverlaySelector
              overlays={captureOverlays}
              activeOverlay={activeOverlay}
              onOverlayChange={setActiveOverlay}
            />
            <div className="photo-counter">
              Photo {photos.length + 1} / {photoCount}
            </div>
            <CaptureButton
              onCapture={handleCapture}
              disabled={streamStatus !== 'active' || isCountingDown}
            />
            
            {photos.length > 0 && (
              <PhotoStrip 
                photos={photos}
                activeIndex={activePhotoIndex}
                onSelectPhoto={() => {}}
              />
            )}
          </>
        )}

        {showPendingConfirmation && (
          <>
            <PhotoCanvas imageData={pendingPhoto} mode="normal" />
            <div className="photo-counter">
              Photo {photos.length + 1} / {photoCount}
            </div>
            <div className="confirmation-buttons">
              <button className="retake-button" onClick={handleRetakePending}>
                Retake
              </button>
              <button className="capture-button" onClick={handleConfirm}>
                Confirm
              </button>
            </div>
            
            {photos.length > 0 && (
              <PhotoStrip 
                photos={photos}
                activeIndex={activePhotoIndex}
                onSelectPhoto={() => {}}
              />
            )}
          </>
        )}

        {showLayoutSelection && (
          <LayoutPicker
            photos={photos}
            onSelectLayout={handleSelectLayout}
          />
        )}

        {showFilterSelection && (
          <>
            <PhotoCanvas imageData={photos[0]} mode={selectedMode} />
            <ModeSelector
              selectedMode={selectedMode}
              onModeChange={setSelectedMode}
            />
            <button className="capture-button" onClick={handleApplyFilter}>
              Apply Filter
            </button>
          </>
        )}

        {showStripDisplay && (
          <>
            <FinalPhotoStrip photos={photos} filterMode={stripFilterMode} layout={stripLayout} />
            <button className="capture-button" onClick={handleContinueToOccasion}>
              Continue
            </button>
          </>
        )}

        {showOccasionSelection && (
          <OccasionSelector onSelectOccasion={handleSelectOccasion} />
        )}

        {showStripEditing && selectedOccasion && photos.length > 0 && (
          <StripEditor 
            photos={photos}
            filterMode={stripFilterMode}
            occasion={selectedOccasion}
            layout={stripLayout}
            onBack={() => setCurrentPhase('occasion-selection')}
          />
        )}
      </div>
    </div>
  );
}

export default App;