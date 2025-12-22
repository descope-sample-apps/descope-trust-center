import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DocumentsPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="text-lg text-muted-foreground">
          Access security documentation, whitepapers, and technical resources.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documentation Library</CardTitle>
          <CardDescription>
            Security guides and technical documentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Document library coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function InfrastructurePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Infrastructure</h1>
        <p className="text-lg text-muted-foreground">
          Overview of our technical infrastructure and reliability measures.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            Current infrastructure status and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Infrastructure details coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Privacy</h1>
        <p className="text-lg text-muted-foreground">
          How we handle and protect your personal data and privacy.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Privacy Policy</CardTitle>
          <CardDescription>
            Our commitment to data protection and privacy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Privacy information coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function ContactPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Contact</h1>
        <p className="text-lg text-muted-foreground">
          Get in touch with our security and trust team.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Security Contacts</CardTitle>
          <CardDescription>
            How to reach our security and compliance teams
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Contact information coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}