import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ComplianceDisplay } from "@/components/ui/compliance-display";

const sampleComplianceData = [
  {
    id: "soc2",
    name: "SOC 2 Type II",
    status: "compliant" as const,
    description: "Security, Availability, Processing Integrity, Confidentiality, and Privacy controls",
    lastChecked: new Date("2024-12-01"),
    score: 98,
    details: [
      "Security controls implemented and tested",
      "Availability metrics met SLA requirements",
      "Processing integrity controls validated",
      "Confidentiality measures in place",
      "Privacy controls comply with criteria"
    ]
  },
  {
    id: "iso27001",
    name: "ISO 27001:2022",
    status: "compliant" as const,
    description: "Information Security Management System certification",
    lastChecked: new Date("2024-11-15"),
    score: 95,
    details: [
      "ISMS implemented and maintained",
      "Risk assessment and treatment processes",
      "Statement of Applicability (SoA) complete",
      "Internal audit program established",
      "Management review processes in place"
    ]
  },
  {
    id: "gdpr",
    name: "GDPR Compliance",
    status: "compliant" as const,
    description: "General Data Protection Regulation compliance",
    lastChecked: new Date("2024-11-20"),
    score: 92,
    details: [
      "Data processing agreements in place",
      "Data subject rights procedures implemented",
      "Privacy policy updated and compliant",
      "Data breach notification process established",
      "Data protection impact assessments conducted"
    ]
  },
  {
    id: "hipaa",
    name: "HIPAA Compliance",
    status: "partial" as const,
    description: "Health Insurance Portability and Accountability Act",
    lastChecked: new Date("2024-10-30"),
    score: 78,
    details: [
      "Administrative safeguards implemented",
      "Physical safeguards in place",
      "Technical safeguards partially implemented",
      "Business associate agreements updated",
      "Risk analysis completed - remediation in progress"
    ]
  },
  {
    id: "ccpa",
    name: "CCPA Compliance",
    status: "compliant" as const,
    description: "California Consumer Privacy Act compliance",
    lastChecked: new Date("2024-11-10"),
    score: 90,
    details: [
      "Consumer rights disclosure implemented",
      "Data collection transparency maintained",
      "Opt-out mechanisms available",
      "Data deletion processes operational",
      "Non-discrimination policies in place"
    ]
  }
];

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
            <ComplianceDisplay 
              title="Active Compliance Status"
              description="Real-time monitoring of our compliance posture across all frameworks"
              items={sampleComplianceData}
              overallScore={91}
              lastUpdated={new Date("2024-12-15")}
            />
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