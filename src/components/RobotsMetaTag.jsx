import React, { useEffect } from 'react';

export function RobotsMetaTag() {
  useEffect(() => {
    // Add robots meta tag for SEO
    let el = document.querySelector('meta[name="robots"]');
    if (!el) {
      el = document.createElement('meta');
      el.name = 'robots';
      document.head.appendChild(el);
    }
    el.content = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

    // Add Google Site Verification
    let googleEl = document.querySelector('meta[name="google-site-verification"]');
    if (!googleEl) {
      googleEl = document.createElement('meta');
      googleEl.name = 'google-site-verification';
      googleEl.content = 'add-your-verification-code-here';
      document.head.appendChild(googleEl);
    }

    // Add viewport meta tag
    let viewportEl = document.querySelector('meta[name="viewport"]');
    if (!viewportEl) {
      viewportEl = document.createElement('meta');
      viewportEl.name = 'viewport';
      viewportEl.content = 'width=device-width, initial-scale=1, maximum-scale=5';
      document.head.appendChild(viewportEl);
    }

    // Add charset
    let charsetEl = document.querySelector('meta[charset]');
    if (!charsetEl) {
      charsetEl = document.createElement('meta');
      charsetEl.charset = 'UTF-8';
      document.head.insertBefore(charsetEl, document.head.firstChild);
    }
  }, []);

  return null;
}