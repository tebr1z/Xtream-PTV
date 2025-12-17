import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const StructuredData = () => {
  const location = useLocation();
  const params = useParams<{ lang?: string }>();
  const { t, i18n, ready } = useTranslation();
  const currentLang = params.lang || i18n.language?.split('-')[0] || 'tr';
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    if (!ready) return;
    // Organization Schema
    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'StreamHub',
      url: baseUrl,
      logo: `${baseUrl}/logo.png`,
      description: t('seo.homeDescription'),
      sameAs: [
        // Add social media links here if available
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        availableLanguage: ['Turkish', 'English', 'Russian', 'Azerbaijani'],
      },
    };

    // WebSite Schema
    const websiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'StreamHub',
      url: baseUrl,
      description: t('seo.homeDescription'),
      inLanguage: currentLang,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${baseUrl}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    };

    // SoftwareApplication Schema
    const softwareSchema = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'StreamHub',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '1000',
      },
    };

    // BreadcrumbList Schema (for navigation)
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: t('common.home'),
          item: baseUrl,
        },
        ...(location.pathname !== '/' ? [
          {
            '@type': 'ListItem',
            position: 2,
            name: location.pathname.split('/').pop() || '',
            item: `${baseUrl}${location.pathname}`,
          },
        ] : []),
      ],
    };

    // Remove existing structured data
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => script.remove());

    // Add new structured data
    [organizationSchema, websiteSchema, softwareSchema, breadcrumbSchema].forEach((schema) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    return () => {
      // Cleanup on unmount
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(script => script.remove());
    };
  }, [location.pathname, currentLang, baseUrl, t, ready]);

  return null;
};

export default StructuredData;

