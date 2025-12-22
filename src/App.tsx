import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SecurityOverviewDashboard } from "./components/SecurityOverviewDashboard";
import { Shield, FileText, Download } from "lucide-react";
import "./index.css";

export function App() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Descope Trust Center</h1>
            </div>
            <Button variant="outline">Contact Security</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Security & Compliance You Can Trust</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Learn about Descope's commitment to security, privacy, and compliance standards.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* Compliance Status */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Compliance Status
              </CardTitle>
              <CardDescription>
                Our current compliance certifications and standards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { name: "SOC 2 Type II", status: "Certified", date: "2024" },
                  { name: "ISO 27001", status: "Certified", date: "2024" },
                  { name: "GDPR", status: "Compliant", date: "Ongoing" },
                  { name: "CCPA", status: "Compliant", date: "Ongoing" },
                  { name: "HIPAA", status: "Compliant", date: "2024" },
                  { name: "PCI DSS", status: "Level 1", date: "2024" },
                ].map((cert) => (
                  <div key={cert.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{cert.name}</p>
                      <p className="text-sm text-muted-foreground">{cert.date}</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                      {cert.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-600" />
                Security Overview
              </CardTitle>
              <CardDescription>
                Key security measures and practices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  "End-to-end encryption",
                  "Multi-factor authentication",
                  "24/7 security monitoring",
                  "Regular penetration testing",
                  "Zero-trust architecture",
                  "Data loss prevention",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Document Access */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Security Documents
              </CardTitle>
              <CardDescription>
                Access our security documentation and reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { name: "SOC 2 Report", type: "PDF", restricted: true },
                  { name: "Security Whitepaper", type: "PDF", restricted: false },
                  { name: "Privacy Policy", type: "PDF", restricted: false },
                  { name: "Terms of Service", type: "PDF", restricted: false },
                  { name: "Data Processing Agreement", type: "PDF", restricted: true },
                  { name: "Vulnerability Disclosure Policy", type: "PDF", restricted: false },
                ].map((doc) => (
                  <div key={doc.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.restricted && (
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                      )}
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        {doc.restricted ? "Request" : "Download"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security Metrics */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Security Metrics</CardTitle>
              <CardDescription>
                Real-time security performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-4">
                {[
                  { label: "Uptime", value: "99.99%", unit: "" },
                  { label: "Security Incidents", value: "0", unit: "last 30 days" },
                  { label: "Response Time", value: "< 1", unit: "hour" },
                  { label: "Patch Coverage", value: "100%", unit: "" },
                ].map((metric) => (
                  <div key={metric.label} className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-primary">{metric.value}</p>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-xs text-muted-foreground">{metric.unit}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="font-semibold mb-3">Security</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Security Overview</a></li>
                <li><a href="#" className="hover:text-foreground">Compliance</a></li>
                <li><a href="#" className="hover:text-foreground">Vulnerability Program</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground">DPA</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Contact</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>security@descope.com</li>
                <li><a href="#" className="hover:text-foreground">Report a Vulnerability</a></li>
                <li><a href="#" className="hover:text-foreground">Security Questions</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Descope. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
