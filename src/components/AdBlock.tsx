import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface AdBlockProps {
  placement: string;
  className?: string;
}

export default function AdBlock({ placement, className }: AdBlockProps) {
  const [adCode, setAdCode] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isAdminPanel = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdminPanel) return;

    const fetchAd = async () => {
      const { data, error } = await supabase
        .from('ads')
        .select('code')
        .eq('id', placement)
        .single();
      
      if (!error && data) {
        setAdCode(data.code);
      } else {
        setAdCode(null);
      }
    };

    fetchAd();

    // Set up real-time subscription
    const channel = supabase
      .channel(`public:ads:${placement}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'ads',
        filter: `id=eq.${placement}`
      }, () => {
        fetchAd();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [placement, isAdminPanel]);

  useEffect(() => {
    if (!adCode || !containerRef.current || isAdminPanel) return;

    // Clear previous content
    containerRef.current.innerHTML = adCode;

    // Manually execute scripts
    const scripts = Array.from(containerRef.current.querySelectorAll('script'));
    scripts.forEach(oldScript => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });

    // Cleanup function to destroy GPT slots on unmount or adCode change
    return () => {
      const googletag = (window as any).googletag;
      if (googletag && googletag.apiReady) {
        googletag.cmd.push(() => {
          // Find and destroy slots that were defined in this container
          const slots = googletag.pubads().getSlots();
          const containerId = containerRef.current?.querySelector('[id^="div-gpt-ad"]')?.id;
          if (containerId) {
            const slotsToDestroy = slots.filter((slot: any) => slot.getSlotElementId() === containerId);
            if (slotsToDestroy.length > 0) {
              googletag.destroySlots(slotsToDestroy);
            }
          }
        });
      }
    };
  }, [adCode, isAdminPanel]);

  if (!adCode || isAdminPanel) return null;

  return (
    <div 
      ref={containerRef} 
      className={`ad-block-${placement} ${className || ''} min-h-[50px] flex items-center justify-center`} 
    />
  );
}
