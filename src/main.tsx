import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

// Initialize googletag and adsbygoogle globally for ad scripts
(window as any).googletag = (window as any).googletag || { cmd: [] };
(window as any).adsbygoogle = (window as any).adsbygoogle || [];

// Safe-guard googletag.defineSlot to prevent crashes in dynamic environments
(window as any).googletag.cmd.push(() => {
  const googletag = (window as any).googletag;
  const originalDefineSlot = googletag.defineSlot;
  if (originalDefineSlot) {
    googletag.defineSlot = function() {
      const slot = originalDefineSlot.apply(this, arguments);
      if (!slot) {
        console.warn('GPT defineSlot returned null. Returning dummy object to prevent errors.');
        // Return a dummy object that implements the most common GPT methods
        const dummy = {
          addService: () => dummy,
          setTargeting: () => dummy,
          setCollapseEmptyDiv: () => dummy,
          setCategoryExclusion: () => dummy,
          setClickUrl: () => dummy,
          setForceSafeFrame: () => dummy,
          setSafeFrameConfig: () => dummy,
          getSlotElementId: () => arguments[2] || '',
        };
        return dummy;
      }
      return slot;
    };
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </HelmetProvider>
  </StrictMode>,
);
