import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface AdBlockProps {
  placement: string;
  className?: string;
}

/**
 * Injects an external script tag only once per page load.
 * If a script with the same `src` already exists in <head>, it is skipped.
 */
function injectExternalScript(src: string): void {
  if (!src) return;
  // Normalise the URL so https://... and //... both match
  const normalised = src.replace(/^https?:/, '');
  const already = Array.from(document.querySelectorAll('script[src]')).some(
    (s) => (s as HTMLScriptElement).src.replace(/^https?:/, '') === normalised
  );
  if (already) return; // GPT / AdSense already on the page — don't re-add

  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  document.head.appendChild(script);
}

export default function AdBlock({ placement, className }: AdBlockProps) {
  const [adCode, setAdCode] = useState<string | null>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isAdminPanel = location.pathname.startsWith('/admin');

  // ── Fetch ad code for this placement ──────────────────────────
  useEffect(() => {
    if (isAdminPanel) return;

    const fetchAd = async () => {
      const { data, error } = await supabase
        .from('ads')
        .select('code')
        .eq('id', placement)
        .maybeSingle();

      if (error) {
        console.error(`AdBlock [${placement}] fetch error:`, error.message);
        setAdCode(null);
        return;
      }
      setAdCode(data?.code ?? null);
    };

    fetchAd();
  }, [placement, isAdminPanel]);

  // ── Inject ad HTML + scripts safely ───────────────────────────
  useEffect(() => {
    if (!adCode || !innerRef.current || isAdminPanel) return;

    const container = innerRef.current;
    container.innerHTML = adCode;

    // Re-create <script> tags so they actually execute (innerHTML doesn't run them)
    const scripts = Array.from(container.querySelectorAll('script'));
    scripts.forEach((oldScript) => {
      const src = oldScript.getAttribute('src');

      if (src) {
        // External script (e.g. gpt.js, adsbygoogle.js):
        // inject once into <head> so it is never loaded twice from cache
        injectExternalScript(src);
        oldScript.remove(); // remove the duplicate from the ad container
      } else {
        // Inline script: always re-create so it executes
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach((attr) =>
          newScript.setAttribute(attr.name, attr.value)
        );
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      }
    });

    // Cleanup: destroy GPT ad slots on unmount to prevent ghost slots
    return () => {
      const googletag = (window as any).googletag;
      if (googletag?.apiReady) {
        googletag.cmd.push(() => {
          const containerId = container.querySelector('[id^="div-gpt-ad"]')?.id;
          if (containerId) {
            const slots = googletag.pubads().getSlots();
            const toDestroy = slots.filter(
              (s: any) => s.getSlotElementId() === containerId
            );
            if (toDestroy.length > 0) googletag.destroySlots(toDestroy);
          }
        });
      }
      container.innerHTML = '';
    };
  }, [adCode, isAdminPanel]);

  if (!adCode || isAdminPanel) return null;

  return (
    <div className={`ad-block-${placement} flex justify-center items-center w-full overflow-hidden ${className || ''}`}
      style={{ textAlign: 'center' }}
    >
      <div ref={innerRef} style={{ display: 'inline-block', textAlign: 'center' }} />
    </div>
  );
}
