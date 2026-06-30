import { useEffect, useRef } from 'react';

export const useGestures = (containerRef, videoRef, handlers) => {
  const { togglePlay, onDoubleTapLeft, onDoubleTapRight } = handlers;
  const lastTapRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchEnd = (e) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTapRef.current;
      
      // Double tap threshold: 300ms
      if (tapLength < 300 && tapLength > 0) {
        const touch = e.changedTouches[0];
        const rect = container.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const width = rect.width;
        
        if (x < width / 3) {
          onDoubleTapLeft();
        } else if (x > (width * 2) / 3) {
          onDoubleTapRight();
        } else {
          togglePlay();
        }
        lastTapRef.current = 0; // Reset
      } else {
        lastTapRef.current = currentTime;
      }
    };

    container.addEventListener('touchend', handleTouchEnd);
    return () => container.removeEventListener('touchend', handleTouchEnd);
  }, [containerRef, togglePlay, onDoubleTapLeft, onDoubleTapRight]);
};
