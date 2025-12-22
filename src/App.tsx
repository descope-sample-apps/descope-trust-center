import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, FileText, CheckCircle, Lock, Award, Download, ExternalLink } from "lucide-react";
import "./index.css";

interface ComplianceItem {
  name: string;
  status: "compliant" | "pending" | "in-progress";
  description: string;
  lastUpdated: string;
}

interface Document {
  id: string;
  title: string;
  type: "policy" | "report" | "certificate";
  description: string;
  lastUpdated: string;
  downloadUrl?: string;
}

export function App() {
  const complianceItems: ComplianceItem[] = [
    {
      name: "SOC 2 Type II",
      status: "compliant",
      description: "Security controls based on AICPA Trust Services Criteria",
      lastUpdated: "2024-11-15"
    },
    {
      name: "ISO 27001",
      status: "compliant", 
      description: "Information security management system certification",
      lastUpdated: "2024-10-20"
    },
    {
      name: "GDPR",
      status: "compliant",
      description: "General Data Protection Regulation compliance",
      lastUpdated: "2024-09-30"
    },
    {
      name: "HIPAA",
      status: "in-progress",
      description: "Health Insurance Portability and Accountability Act",
      lastUpdated: "2024-12-01"
    }
  ];

  const documents: Document[] = [
    {
      id: "1",
      title: "Security Policy",
      type: "policy",
      description: "Comprehensive security policies and procedures",
      lastUpdated: "2024-11-01"
    },
    {
      id: "2", 
      title: "Privacy Policy",
      type: "policy",
      description: "How we collect, use, and protect customer data",
      lastUpdated: "2024-10-15"
    },
    {
      id: "3",
      title: "SOC 2 Report",
      type: "report", 
      description: "Latest SOC 2 Type II examination report",
      lastUpdated: "2024-11-15",
      downloadUrl: "#"
    },
    {
      id: "4",
      title: "ISO 27001 Certificate",
      type: "certificate",
      description: "Official ISO 27001 certification document",
      lastUpdated: "2024-10-20",
      downloadUrl: "#"
    }
  ];

  const getStatusColor = (status: ComplianceItem["status"]) => {
    switch (status) {
      case "compliant":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "in-progress":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: ComplianceItem["status"]) => {
    switch (status) {
      case "compliant":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Lock className="h-4 w-4" />;
      case "in-progress":
        return <Shield className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getDocumentIcon = (type: Document["type"]) => {
    switch (type) {
      case "policy":
        return <FileText className="h-5 w-5 text-blue-600" />;
      case "report":
        return <Shield className="h-5 w-5 text-green-600" />;
      case "certificate":
        return <Award className="h-5 w-5 text-purple-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
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
            <p className="text-gray-600">Security, compliance, and transparency</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Security & Compliance Overview</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We're committed to maintaining the highest standards of security and compliance. 
              Our comprehensive security program protects your data and ensures regulatory compliance.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">Compliance Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {complianceItems.map((item, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      <span className="capitalize">{item.status.replace('-', ' ')}</span>
                    </div>
                  </div>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Last updated: {new Date(item.lastUpdated).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">Security Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documents.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start space-x-3">
                    {getDocumentIcon(doc.type)}
                    <div className="flex-1">
                      <CardTitle className="text-lg">{doc.title}</CardTitle>
                      <CardDescription className="mt-2">{doc.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Updated: {new Date(doc.lastUpdated).toLocaleDateString()}
                    </p>
                    <div className="flex space-x-2">
                      {doc.downloadUrl && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">Security Highlights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardHeader>
                <Lock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>End-to-End Encryption</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  All data is encrypted in transit and at rest using industry-standard encryption protocols.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>24/7 Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Continuous security monitoring and threat detection to keep your data safe.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <CheckCircle className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Regular Audits</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Third-party security audits and penetration testing to validate our security controls.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="bg-blue-50 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Have Questions?</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our security team is here to help. If you have questions about our security practices, 
            compliance status, or need access to additional documentation, please don't hesitate to reach out.
          </p>
          <div className="flex justify-center space-x-4">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Contact Security Team
            </Button>
            <Button variant="outline">
              Request Audit Report
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Descope. All rights reserved.</p>
            <p className="mt-2 text-sm">
              Trust Center last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
