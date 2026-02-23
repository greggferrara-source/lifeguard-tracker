import React, { useEffect } from 'react';

export function SEOHead({
  title = 'LifeGuard Tracker - Lifeguard Scheduling & Pool Management Software',
  description = 'Enterprise lifeguard scheduling, pool management, and workforce management software for aquatic facilities, water parks, and recreation centers. OSHA and MAHC compliant.',
  keywords = 'lifeguard scheduling, pool management, facility scheduling, workforce management, aquatic software',
  image = 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1200&h=630&fit=crop',
  url = typeof window !== 'undefined' ? window.location.href : 'https://lifeguardtracker.app',
  type = 'website'
}) {
  useEffect(() => {
    // Update meta tags dynamically
    document.title = title;
    
    updateMeta('description', description);
    updateMeta('keywords', keywords);
    updateMeta('og:title', title);
    updateMeta('og:description', description);
    updateMeta('og:image', image);
    updateMeta('og:url', url);
    updateMeta('og:type', type);
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', image);
    updateMeta('twitter:card', 'summary_large_image');
  }, [title, description, image, url]);

  return null;
}

function updateMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  
  if (!el) {
    el = document.createElement('meta');
    const isProperty = name.startsWith('og:') || name.startsWith('twitter:');
    el.setAttribute(isProperty ? 'property' : 'name', name);
    document.head.appendChild(el);
  }
  
  el.setAttribute('content', content);
}

export function JSONSchema({ schema }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => document.head.removeChild(script);
  }, [schema]);

  return null;
}

export default SEOHead;