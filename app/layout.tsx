import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { baseMetadata, generateStructuredData } from '@/lib/metadata'
import { SkipLink } from './components/ui/skip-link'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = baseMetadata

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
<head>
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: generateStructuredData()
          }}
        />

        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for common external resources */}
        <link rel="dns-prefetch" href="//www.descope.com" />
        <link rel="dns-prefetch" href="//twitter.com" />
        
        {/* Additional meta tags */}
        <meta name="theme-color" content="#0891b2" />
        <meta name="msapplication-TileColor" content="#0891b2" />
        <meta name="application-name" content="Descope Trust Center" />
        <meta name="apple-mobile-web-app-title" content="Descope Trust Center" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#0891b2" />
      </head>
      <body className={inter.className}>
        <SkipLink href="#main-content">
          Skip to main content
        </SkipLink>
        <div id="main-content">
          {children}
        </div>
      </body>
    </html>
  )
}