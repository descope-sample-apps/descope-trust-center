import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ComplianceDisplay } from "@/components/ui/compliance-display";
import { APITester } from "./APITester";
import { Shield, FileText, Download, CheckCircle, Lock, AlertCircle } from "lucide-react";
import "./index.css";

import logo from "./logo.svg";
import reactLogo from "./react.svg";

<<<<<<< HEAD
const mockComplianceData = [
  {
    id: "1",
    name: "GDPR Compliance",
    status: "compliant" as const,
    description: "General Data Protection Regulation compliance check",
    lastChecked: new Date("2024-12-20"),
    score: 95,
    details: [
      "Data processing agreements in place",
      "Consent management implemented",
      "Data subject rights configured",
    ],
  },
  {
    id: "2", 
    name: "SOC 2 Type II",
    status: "partial" as const,
    description: "Service Organization Control 2 Type II audit",
    lastChecked: new Date("2024-12-18"),
    score: 78,
    details: [
      "Security controls implemented",
      "Availability monitoring in progress",
      "Processing integrity needs review",
    ],
  },
  {
    id: "3",
    name: "ISO 27001",
    status: "pending" as const,
    description: "Information Security Management System certification",
    lastChecked: new Date("2024-12-15"),
    details: [
      "Initial assessment completed",
      "Waiting for external auditor",
    ],
  },
  {
    id: "4",
    name: "HIPAA Compliance",
    status: "non-compliant" as const,
    description: "Health Insurance Portability and Accountability Act",
    lastChecked: new Date("2024-12-22"),
    score: 45,
    details: [
      "Encryption standards not met",
      "Access controls need updating",
      "Audit trails incomplete",
    ],
  },
];
=======

>>>>>>> origin/opencode/issue-1-task-descope-trust-center-93c

export function App() {
  return (
    <div className="container mx-auto p-8 space-y-8 relative z-10">
      <div className="flex justify-center items-center gap-8">
        <img
          src={logo}
          alt="Bun Logo"
          className="h-36 p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#646cffaa] scale-120"
        />
        <img
          src={reactLogo}
          alt="React Logo"
          className="h-36 p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#61dafbaa] [animation:spin_20s_linear_infinite]"
        />
      </div>
      
      <Card>
        <CardHeader className="gap-4">
          <CardTitle className="text-3xl font-bold">Descope Trust Center</CardTitle>
          <CardDescription>
            Compliance monitoring and security status dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <APITester />
        </CardContent>
      </Card>

      <ComplianceDisplay
        title="Security & Compliance Overview"
        description="Real-time monitoring of our security and compliance posture"
        items={mockComplianceData}
        overallScore={72}
        lastUpdated={new Date()}
      />
    </div>
  );
}

export default App;