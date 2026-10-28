import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Automatically resets scroll position to top (0, 0)
 * whenever the route pathname or search parameters change.
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Disable native browser scroll restoration fighting router transitions
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const resetScroll = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const main = document.querySelector('main');
      if (main) {
        main.scrollTop = 0;
      }
    };

    // Immediate reset
    resetScroll();

    // Deferred reset to catch render passes & async DOM mounts
    const frameId = requestAnimationFrame(resetScroll);
    const timerId = setTimeout(resetScroll, 20);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timerId);
    };
  }, [pathname, search]);

  return null;
}

