/**
 * Security Overview section highlighting Descope's security practices.
 * Displays a grid of security practice cards covering encryption, access controls,
 * infrastructure, incident response, data privacy, and vulnerability management.
 *
 * @remarks
 * This is a Server Component with hardcoded curated content.
 * Responsive grid: 1 col mobile, 2 cols tablet, 3 cols desktop.
 */

interface SecurityPractice {
  /** Icon displayed at the top of the card */
  icon: React.ReactNode;
  /** Title of the security practice */
  title: string;
  /** Brief description of the practice */
  description: string;
  /** Key highlights/features as bullet points */
  highlights: string[];
}

const securityPractices: SecurityPractice[] = [
  {
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
    title: "Encryption at Rest & Transit",
    description:
      "All data is protected with industry-leading encryption standards.",
    highlights: [
      "AES-256 encryption at rest",
      "TLS 1.3 encryption in transit",
      "Encrypted backups with separate keys",
    ],
  },
  {
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
    title: "Access Controls",
    description:
      "Enterprise-grade authentication and authorization mechanisms.",
    highlights: [
      "Role-based access control (RBAC)",
      "Multi-factor authentication (MFA)",
      "Least privilege principle enforced",
      "Comprehensive audit logging",
    ],
  },
  {
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
        />
      </svg>
    ),
    title: "Infrastructure Security",
    description: "Built on SOC 2 certified cloud infrastructure with redundancy.",
    highlights: [
      "SOC 2 Type II certified cloud",
      "Multi-region deployment (US, EU)",
      "99.99% uptime SLA",
      "Automatic failover & replication",
    ],
  },
  {
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: "Incident Response",
    description: "Rapid detection and response to security incidents 24/7.",
    highlights: [
      "24/7 security monitoring",
      "< 1 hour initial response SLA",
      "Immediate customer notification",
      "Root cause analysis & remediation",
    ],
  },
  {
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
        />
      </svg>
    ),
    title: "Data Privacy",
    description: "Committed to protecting personal data and privacy rights.",
    highlights: [
      "GDPR compliant",
      "CCPA compliant",
      "Data retention controls",
      "Right to deletion support",
    ],
  },
  {
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    ),
    title: "Vulnerability Management",
    description:
      "Continuous security testing and proactive vulnerability remediation.",
    highlights: [
      "Annual third-party pentests",
      "Bug bounty program",
      "100% critical findings remediated",
      "Continuous security scanning",
    ],
  },
];

/**
 * Card component for displaying a single security practice.
 */
function SecurityPracticeCard({ practice }: { practice: SecurityPractice }) {
  return (
    <article className="rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        {practice.icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">
        {practice.title}
      </h3>
      <p className="mb-4 text-sm text-muted-foreground">
        {practice.description}
      </p>
      <ul className="space-y-2" aria-label={`${practice.title} highlights`}>
        {practice.highlights.map((highlight) => (
          <li
            key={highlight}
            className="flex items-start gap-2 text-sm text-foreground"
          >
            <svg
              className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>{highlight}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

/**
 * Security Overview section component.
 * Displays a responsive grid of security practice cards.
 */
export function SecurityOverview() {
  return (
    <section aria-labelledby="security-overview-heading" className="py-12">
      <div className="container">
        <header className="mb-10 text-center">
          <h2
            id="security-overview-heading"
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Our Security Practices
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Security is at the core of everything we do. Learn how Descope
            protects your data and maintains the highest standards of security.
          </p>
        </header>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {securityPractices.map((practice) => (
            <SecurityPracticeCard key={practice.title} practice={practice} />
          ))}
        </div>
      </div>
    </section>
  );
}
