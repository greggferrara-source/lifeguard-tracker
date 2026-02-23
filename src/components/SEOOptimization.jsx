import { Helmet } from 'react-helmet';

// SEO optimization component for all pages
export const seoConfig = {
  siteName: "LifeGuard Tracker",
  siteUrl: "https://www.lifeguardtracker.com",
  
  pages: {
    home: {
      title: "LifeGuard Tracker - AI-Powered Lifeguard Scheduling & Pool Management Software",
      description: "Cloud-based lifeguard scheduling, incident management, IoT water quality monitoring, gamified training, and AI safety prediction for aquatic facilities, water parks, and recreation centers.",
      keywords: "lifeguard scheduling software, pool management system, facility scheduling, workforce management, IoT sensor monitoring, water quality, incident reporting, training gamification, safety prediction",
      canonical: "https://www.lifeguardtracker.com"
    },
    pricing: {
      title: "LifeGuard Tracker Pricing - Flat-Fee Plans for Pool Management",
      description: "Affordable flat-fee pricing starting at $29/month. No per-user charges. Starter, Pro, and Enterprise plans with AI analytics and IoT integration.",
      keywords: "lifeguard software pricing, pool management cost, scheduling software plans, aquatic facility management pricing",
      canonical: "https://www.lifeguardtracker.com/pricing"
    },
    features: {
      title: "LifeGuard Tracker Features - Complete Pool Management Solution",
      description: "Smart scheduling, compliance tracking, incident management, IoT analytics, gamified training, safety predictions, and AI advisor. Everything you need for aquatic facilities.",
      keywords: "pool management features, lifeguard scheduling features, incident reporting, water quality monitoring, training gamification, AI analytics",
      canonical: "https://www.lifeguardtracker.com/features"
    },
    docs: {
      title: "LifeGuard Tracker Documentation - Setup Guides & Tutorials",
      description: "Complete documentation for setup, scheduling, compliance, IoT monitoring, training, and advanced features.",
      keywords: "documentation, guides, tutorials, help center, how-to",
      canonical: "https://www.lifeguardtracker.com/docs"
    },
    iotAnalytics: {
      title: "IoT Analytics Dashboard - Water Quality Monitoring & Predictive Reports",
      description: "Real-time IoT sensor monitoring with historical trends, anomaly detection, and AI-powered predictive analytics for water quality management.",
      keywords: "water quality monitoring, IoT sensors, analytics dashboard, pH monitoring, chlorine levels, temperature monitoring, anomaly detection",
      canonical: "https://www.lifeguardtracker.com/iot-analytics"
    },
    trainingGamification: {
      title: "Training Gamification Hub - Earn Points, Badges & Leaderboards",
      description: "Boost staff engagement with gamified training. Earn points, unlock badges, compete on leaderboards, and track progress with visual rewards.",
      keywords: "training gamification, employee engagement, training modules, badges, leaderboards, staff development",
      canonical: "https://www.lifeguardtracker.com/training-gamification"
    }
  },

  structuredData: {
    organization: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "LifeGuard Tracker",
      "url": "https://www.lifeguardtracker.com",
      "logo": "https://www.lifeguardtracker.com/logo.png",
      "description": "AI-powered lifeguard scheduling and pool management software",
      "sameAs": [
        "https://www.facebook.com/lifeguardtracker",
        "https://www.twitter.com/lifeguardtrack",
        "https://www.linkedin.com/company/lifeguardtracker"
      ]
    },
    softwareApplication: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "LifeGuard Tracker",
      "description": "Lifeguard scheduling, incident management, and pool management software",
      "applicationCategory": "BusinessApplication",
      "offers": {
        "@type": "Offer",
        "price": "29",
        "priceCurrency": "USD"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5",
        "ratingCount": "500"
      }
    }
  }
};

export function SEOHead({ page = 'home', title, description, keywords }) {
  const pageConfig = seoConfig.pages[page] || seoConfig.pages.home;
  const finalTitle = title || pageConfig.title;
  const finalDescription = description || pageConfig.description;
  const finalKeywords = keywords || pageConfig.keywords;

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content="index, follow" />
      
      {/* Open Graph */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={pageConfig.canonical} />
      <meta property="og:image" content="https://www.lifeguardtracker.com/og-image.png" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content="https://www.lifeguardtracker.com/og-image.png" />
      
      {/* Canonical */}
      <link rel="canonical" href={pageConfig.canonical} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(seoConfig.structuredData.organization)}
      </script>
    </Helmet>
  );
}