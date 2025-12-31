import { useState, useEffect } from 'react';

// This hook checks if the primary input mechanism of the device supports hover.
// It helps in conditionally applying hover-specific effects to avoid them on touch-only devices.
export const useHover = () => {
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    // window.matchMedia is not available during server-side rendering.
    // We check for its existence and then evaluate the media query.
    if (typeof window.matchMedia === 'function') {
      const mediaQuery = window.matchMedia('(hover: hover)');
      setCanHover(mediaQuery.matches);

      // Optional: Listen for changes, though this is rare.
      const listener = (e) => setCanHover(e.matches);
      mediaQuery.addEventListener('change', listener);

      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  return canHover;
};
