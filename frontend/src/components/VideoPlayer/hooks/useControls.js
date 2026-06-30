import { useState, useEffect, useCallback, useRef } from 'react';

export const useControls = (timeout = 3000, forceShow = false) => {
  const [showControls, setShowControls] = useState(true);
  const timeoutRef = useRef(null);

  const startTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (forceShow) {
      setShowControls(true);
      return;
    }
    setShowControls(true);
    timeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, timeout);
  }, [timeout, forceShow]);

  const keepAlive = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowControls(true);
    if (!forceShow) {
      timeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, timeout);
    }
  }, [timeout, forceShow]);

  const hideNow = useCallback(() => {
    if (forceShow) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowControls(false);
  }, [forceShow]);

  useEffect(() => {
    if (forceShow) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setShowControls(true);
    } else {
      startTimer();
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [startTimer, forceShow]);

  return { showControls, startTimer, keepAlive, hideNow };
};
