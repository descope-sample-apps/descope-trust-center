import type { Metadata } from 'next'

const baseUrl = 'https://trust.descope.com'

export const siteConfig = {
  name: 'Descope Trust Center',
  description: 'Comprehensive security and compliance information for Descope. View our SOC 2 Type II, ISO 27001, GDPR, and HIPAA compliance status, security policies, and audit reports.',
  url: baseUrl,
  ogImage: '/og-image.jpg',
  twitterImage: '/twitter-image.jpg',
  links: {
    twitter: 'https://twitter.com/descope',
    github: 'https://github.com/descopeio',
    linkedin: 'https://www.linkedin.com/company/descope/',
  },
  author: 'Descope',
  keywords: [
    'Descope',
    'Trust Center',
    'Security',
    'Compliance',
    'SOC 2',
    'ISO 27001',
    'GDPR',
    'HIPAA',
    'Security Audit',
    'Privacy Policy',
    'Data Protection',
    'Enterprise Security'
  ],
}

export const baseMetadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  publisher: siteConfig.author,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: `${siteConfig.name} | Security & Compliance`,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - Security & Compliance`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} | Security & Compliance`,
    description: siteConfig.description,
    images: [siteConfig.twitterImage],
    creator: '@descope',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export function generateStructuredData(): string {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Descope",
    "url": "https://www.descope.com",
    "logo": "https://www.descope.com/logo.png",
    "description": "Modern authentication and authorization platform",
    "sameAs": Object.values(siteConfig.links),
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-650-123-4567",
      "contactType": "customer service",
      "availableLanguage": ["English"]
    }
  }

  const webPageData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": siteConfig.name,
    "description": siteConfig.description,
    "url": siteConfig.url,
    "isPartOf": {
      "@type": "WebSite",
      "name": "Descope",
      "url": "https://www.descope.com"
    },
    "about": [
      {
        "@type": "Thing",
        "name": "Security Compliance"
      },
      {
        "@type": "Thing", 
        "name": "SOC 2 Type II"
      },
      {
        "@type": "Thing",
        "name": "ISO 27001"
      },
      {
        "@type": "Thing",
        "name": "GDPR Compliance"
      },
      {
        "@type": "Thing",
        "name": "HIPAA Compliance"
      }
    ],
    "mainEntity": {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What compliance standards does Descope meet?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Descope maintains compliance with multiple industry standards including SOC 2 Type II, ISO 27001, GDPR, and is currently working toward HIPAA compliance. We undergo regular third-party audits to validate our security controls and compliance posture."
          }
        },
        {
          "@type": "Question",
          "name": "How is customer data protected?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We implement comprehensive security measures including end-to-end encryption for data in transit and at rest, regular security monitoring, access controls, and follow the principle of least privilege. All data is encrypted using AES-256 encryption standards."
          }
        },
        {
          "@type": "Question",
          "name": "Can I request a copy of your security audit reports?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, qualified customers and prospects can request access to our SOC 2 Type II reports, ISO 27001 certificates, and other compliance documentation. Please use the 'Request Audit Report' button or contact our security team directly."
          }
        },
        {
          "@type": "Question",
          "name": "How often do you conduct security assessments?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We conduct continuous security monitoring and perform formal assessments on a regular basis. This includes annual SOC 2 Type II audits, quarterly penetration testing, monthly vulnerability scans, and regular internal security reviews."
          }
        }
      ]
    }
  }

  return JSON.stringify([organizationData, webPageData])
}