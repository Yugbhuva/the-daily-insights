import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface AdBlockProps {
  placement: string;
  className?: string;
}

export default function AdBlock({ placement, className }: AdBlockProps) {
  const [adCode, setAdCode] = useState<string | null>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isAdminPanel = location.pathname.startsWith('/admin');

  // Fetch the ad code for this placement
  useEffect(() => {
    if (isAdminPanel) return;

    const fetchAd = async () => {
      const { data, error } = await supabase
        .from('ads')
        .select('code')
        .eq('id', placement)
        .maybeSingle(); // maybeSingle: returns null (not an error) if no row found

      if (error) {
        console.error(`AdBlock [${placement}] fetch error:`, error.message);
        setAdCode(null);
        return;
      }
      setAdCode(data?.code ?? null);
    };

    fetchAd();
  }, [placement, isAdminPanel]);

  // Inject ad HTML/scripts into the inner div (NOT the root element)
  // Using a separate inner div prevents React from losing the root node reference
  useEffect(() => {
    if (!adCode || !innerRef.current || isAdminPanel) return;

    const container = innerRef.current;
    container.innerHTML = adCode;

    // innerHTML does not execute <script> tags — re-create them so they run
    const scripts = Array.from(container.querySelectorAll('script'));
    scripts.forEach(oldScript => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });

    // Cleanup: destroy GPT slots on unmount to prevent duplicates
    return () => {
      const googletag = (window as any).googletag;
      if (googletag?.apiReady) {
        googletag.cmd.push(() => {
          const containerId = container.querySelector('[id^="div-gpt-ad"]')?.id;
          if (containerId) {
            const slots = googletag.pubads().getSlots();
            const toDestroy = slots.filter((s: any) => s.getSlotElementId() === containerId);
            if (toDestroy.length > 0) googletag.destroySlots(toDestroy);
          }
        });
      }
      container.innerHTML = '';
    };
  }, [adCode, isAdminPanel]);

  if (!adCode || isAdminPanel) return null;

  return (
    <div className={`ad-block-${placement} ${className || ''}`}>
      <div ref={innerRef} />
    </div>
  );
}
