import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ComplianceDisplay } from "@/components/ui/compliance-display";

export function CompliancePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Compliance</h1>
        <p className="text-lg text-muted-foreground">
          Our commitment to maintaining the highest standards of security and compliance across all frameworks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Active Certifications
              <Badge variant="secondary">Live</Badge>
            </CardTitle>
            <CardDescription>
              Current compliance certifications we maintain
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ComplianceDisplay />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Frameworks</CardTitle>
            <CardDescription>
              Industry standards we adhere to
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">SOC 2 Type II</span>
                <Badge variant="default">Certified</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">ISO 27001:2022</span>
                <Badge variant="default">Certified</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">GDPR</span>
                <Badge variant="default">Compliant</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">HIPAA</span>
                <Badge variant="default">Compliant</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">CCPA</span>
                <Badge variant="default">Compliant</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compliance Reports</CardTitle>
          <CardDescription>
            Download our latest compliance documentation and reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg space-y-2">
              <h4 className="font-semibold">SOC 2 Type II Report</h4>
              <p className="text-sm text-muted-foreground">Latest audit report</p>
              <button className="text-sm text-blue-600 hover:underline">Request Access</button>
            </div>
            <div className="p-4 border rounded-lg space-y-2">
              <h4 className="font-semibold">ISO 27001 Certificate</h4>
              <p className="text-sm text-muted-foreground">Valid certification document</p>
              <button className="text-sm text-blue-600 hover:underline">Download</button>
            </div>
            <div className="p-4 border rounded-lg space-y-2">
              <h4 className="font-semibold">GDPR Compliance</h4>
              <p className="text-sm text-muted-foreground">Data processing agreement</p>
              <button className="text-sm text-blue-600 hover:underline">View Details</button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}