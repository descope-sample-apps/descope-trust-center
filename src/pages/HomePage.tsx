import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function HomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Trust Center</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your centralized hub for security, compliance, and trust information. 
          Access documentation, compliance reports, and security resources.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle>Compliance</CardTitle>
            <CardDescription>
              View our compliance certifications and regulatory adherence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              SOC 2, ISO 27001, GDPR, HIPAA, and more
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Learn about our security practices and infrastructure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Security measures, incident response, and best practices
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>
              Access security documentation and technical resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Whitepapers, security guides, and technical documentation
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle>Infrastructure</CardTitle>
            <CardDescription>
              Overview of our technical infrastructure and reliability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              System status, uptime, and performance metrics
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle>Privacy</CardTitle>
            <CardDescription>
              How we handle and protect your data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Data protection policies and privacy practices
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle>Contact</CardTitle>
            <CardDescription>
              Get in touch with our security and trust team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Security contacts and support channels
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}