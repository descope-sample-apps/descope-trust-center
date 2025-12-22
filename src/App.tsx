import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, FileText, CheckCircle, Lock, AlertCircle, Download, ExternalLink } from "lucide-react";
import { useState } from "react";
import "./index.css";

interface ComplianceItem {
  name: string;
  status: "compliant" | "in-progress" | "pending";
  description: string;
  lastUpdated: string;
}

interface Document {
  id: string;
  title: string;
  category: string;
  description: string;
  lastUpdated: string;
  downloadUrl?: string;
}

export function App() {
  const [activeTab, setActiveTab] = useState<"overview" | "compliance" | "documents">("overview");

  const complianceData: ComplianceItem[] = [
    {
      name: "SOC 2 Type II",
      status: "compliant",
      description: "Security, Availability, Processing Integrity, Confidentiality, and Privacy controls",
      lastUpdated: "2024-12-15"
    },
    {
      name: "ISO 27001",
      status: "compliant", 
      description: "Information security management system standards",
      lastUpdated: "2024-12-10"
    },
    {
      name: "GDPR",
      status: "compliant",
      description: "General Data Protection Regulation compliance",
      lastUpdated: "2024-12-08"
    },
    {
      name: "CCPA",
      status: "compliant",
      description: "California Consumer Privacy Act compliance",
      lastUpdated: "2024-12-05"
    },
    {
      name: "HIPAA",
      status: "in-progress",
      description: "Health Insurance Portability and Accountability Act",
      lastUpdated: "2024-11-20"
    }
  ];

  const documents: Document[] = [
    {
      id: "1",
      title: "Security Whitepaper",
      category: "Security",
      description: "Comprehensive overview of our security architecture and practices",
      lastUpdated: "2024-12-15",
      downloadUrl: "#"
    },
    {
      id: "2", 
      title: "SOC 2 Report",
      category: "Compliance",
      description: "Official SOC 2 Type II audit report (available under NDA)",
      lastUpdated: "2024-12-15",
      downloadUrl: "#"
    },
    {
      id: "3",
      title: "Data Processing Agreement",
      category: "Legal",
      description: "Standard DPA for customer data processing",
      lastUpdated: "2024-12-01",
      downloadUrl: "#"
    },
    {
      id: "4",
      title: "Incident Response Plan",
      category: "Security", 
      description: "Detailed incident response procedures and timelines",
      lastUpdated: "2024-11-15",
      downloadUrl: "#"
    }
  ];

  const getStatusIcon = (status: ComplianceItem["status"]) => {
    switch (status) {
      case "compliant":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "in-progress":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "pending":
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ComplianceItem["status"]) => {
    switch (status) {
      case "compliant":
        return "bg-green-100 text-green-800 border-green-200";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Descope Trust Center</h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Lock className="h-4 w-4" />
              <span>Security Status: Operational</span>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Security Overview
            </button>
            <button
              onClick={() => setActiveTab("compliance")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "compliance"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Compliance
            </button>
            <button
              onClick={() => setActiveTab("documents")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "documents"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Documents
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Uptime</p>
                      <p className="text-2xl font-bold text-gray-900">99.99%</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Last 30 days</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Security Incidents</p>
                      <p className="text-2xl font-bold text-gray-900">0</p>
                    </div>
                    <Shield className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Last 90 days</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Data Breaches</p>
                      <p className="text-2xl font-bold text-gray-900">0</p>
                    </div>
                    <Lock className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">All time</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Security Measures</CardTitle>
                <CardDescription>
                  Our comprehensive security framework protects your data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">End-to-end Encryption</h4>
                      <p className="text-sm text-gray-600">All data encrypted in transit and at rest</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Multi-factor Authentication</h4>
                      <p className="text-sm text-gray-600">Required for all administrative access</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Regular Security Audits</h4>
                      <p className="text-sm text-gray-600">Quarterly penetration testing and vulnerability assessments</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">24/7 Monitoring</h4>
                      <p className="text-sm text-gray-600">Continuous security monitoring and incident response</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "compliance" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
                <CardDescription>
                  Our current compliance certifications and standards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceData.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(item.status)}
                          <div>
                            <h3 className="font-medium text-gray-900">{item.name}</h3>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                            {item.status.replace("-", " ")}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">Updated: {item.lastUpdated}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security & Compliance Documents</CardTitle>
                <CardDescription>
                  Access our security documentation and compliance reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start space-x-3">
                          <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <h3 className="font-medium text-gray-900">{doc.title}</h3>
                            <p className="text-sm text-gray-600">{doc.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-xs text-gray-500">Category: {doc.category}</span>
                              <span className="text-xs text-gray-500">Updated: {doc.lastUpdated}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {doc.downloadUrl && (
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>© 2024 Descope. All rights reserved.</p>
            <p className="mt-2">For security inquiries, contact security@descope.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
