/**
 * useCamera.js
 * ORIGINAL WORKING VERSION - RESTORED
 * Handles camera permission, stream start/stop.
 * Exposes videoRef and streamStatus.
 */

import { useRef, useEffect, useState } from 'react';

export function useCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [streamStatus, setStreamStatus] = useState('idle');

  useEffect(() => {
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
  }, []);

  return { videoRef, streamRef, streamStatus };
}