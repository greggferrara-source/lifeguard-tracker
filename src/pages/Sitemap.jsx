import React from 'react';

export default function Sitemap() {
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://lifeguardtracker.app</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://lifeguardtracker.app/pricing</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://lifeguardtracker.app/features</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://lifeguardtracker.app/docs</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://lifeguardtracker.app/tutorials</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://lifeguardtracker.app/blog</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://lifeguardtracker.app/contact</loc>
    <changefreq>yearly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://lifeguardtracker.app/privacy</loc>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://lifeguardtracker.app/terms</loc>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;

  React.useEffect(() => {
    // Serve XML on /sitemap.xml
    if (window.location.pathname === '/sitemap.xml') {
      document.open();
      document.write(sitemapContent);
      document.close();
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Sitemap</h1>
      <p className="text-gray-600 mb-6">
        This page contains the XML sitemap for LifeGuard Tracker. Search engines use this to discover and index content.
      </p>
      <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
        {sitemapContent}
      </pre>
    </div>
  );
}