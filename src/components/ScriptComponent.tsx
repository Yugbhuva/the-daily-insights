import React, { useEffect, useRef } from 'react';

interface ScriptComponentProps {
  children?: string;
  src?: string;
  [key: string]: any;
}

export default function ScriptComponent({ children, src, ...props }: ScriptComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear previous scripts if any
    containerRef.current.innerHTML = '';
    
    const script = document.createElement('script');
    if (src) {
      script.src = src;
      script.async = true;
    }
    if (children) {
      script.textContent = children;
    }
    
    // Copy all other attributes
    Object.keys(props).forEach(key => {
      if (key !== 'node' && key !== 'children') {
        script.setAttribute(key, props[key]);
      }
    });
    
    containerRef.current.appendChild(script);
  }, [src, children, JSON.stringify(props)]);

  return <div ref={containerRef} className="script-container" />;
}
