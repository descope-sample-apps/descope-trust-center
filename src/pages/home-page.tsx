import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FAQSection } from "@/components/ui/faq-section";
import { Shield, FileText, CheckCircle, Lock, Award, Download, ExternalLink } from "lucide-react";

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

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export function HomePage() {
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

  const faqItems: FAQItem[] = [
    {
      id: "faq-1",
      question: "What compliance standards does Descope meet?",
      answer: "Descope maintains compliance with multiple industry standards including SOC 2 Type II, ISO 27001, GDPR, and is currently working toward HIPAA compliance. We undergo regular third-party audits to validate our security controls and compliance posture.",
      category: "Compliance"
    },
    {
      id: "faq-2", 
      question: "How is customer data protected?",
      answer: "We implement comprehensive security measures including end-to-end encryption for data in transit and at rest, regular security monitoring, access controls, and follow the principle of least privilege. All data is encrypted using AES-256 encryption standards.",
      category: "Security"
    },
    {
      id: "faq-3",
      question: "Can I request a copy of your security audit reports?",
      answer: "Yes, qualified customers and prospects can request access to our SOC 2 Type II reports, ISO 27001 certificates, and other compliance documentation. Please use the 'Request Audit Report' button or contact our security team directly.",
      category: "Documentation"
    },
    {
      id: "faq-4",
      question: "How often do you conduct security assessments?",
      answer: "We conduct continuous security monitoring and perform formal assessments on a regular basis. This includes annual SOC 2 Type II audits, quarterly penetration testing, monthly vulnerability scans, and regular internal security reviews.",
      category: "Security"
    },
    {
      id: "faq-5",
      question: "What happens in case of a security incident?",
      answer: "We have a comprehensive incident response program that includes immediate detection and investigation, customer notification within required timeframes, remediation activities, and post-incident reviews to improve our security posture. All incidents are handled according to our documented incident response procedures.",
      category: "Security"
    },
    {
      id: "faq-6",
      question: "Do you offer Business Associate Agreements (BAAs)?",
      answer: "Yes, we offer Business Associate Agreements for customers handling protected health information (PHI) as part of our HIPAA compliance efforts. Please contact our sales or security team to discuss your specific BAA requirements.",
      category: "Compliance"
    },
    {
      id: "faq-7",
      question: "Where is customer data stored?",
      answer: "Customer data is stored in secure, SOC 2-compliant data centers with geographic redundancy. We maintain data residency options and can provide specific information about data storage locations based on your requirements and compliance needs.",
      category: "Data Management"
    },
    {
      id: "faq-8",
      question: "How can I report a security vulnerability?",
      answer: "We take security vulnerabilities seriously and encourage responsible disclosure. Please report any security concerns to our security team at security@descope.com. We'll acknowledge receipt within 24 hours and provide regular updates on our remediation progress.",
      category: "Security"
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
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Descope Trust Center</h1>
            </div>
            <p className="text-sm sm:text-base text-gray-600 text-center sm:text-right">Security, compliance, and transparency</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <section className="mb-8 sm:mb-12">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Security & Compliance Overview</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-4">
              We're committed to maintaining the highest standards of security and compliance. 
              Our comprehensive security program protects your data and ensures regulatory compliance.
            </p>
          </div>
        </section>

        <section className="mb-8 sm:mb-12">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">Compliance Status</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
            {complianceItems.map((item, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-base sm:text-lg">{item.name}</CardTitle>
                    <div className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      <span className="capitalize hidden sm:inline">{item.status.replace('-', ' ')}</span>
                      <span className="capitalize sm:hidden">{item.status === 'in-progress' ? 'In Progress' : item.status}</span>
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

        <section className="mb-8 sm:mb-12">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">Security Documents</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
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
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                     <p className="text-xs sm:text-sm text-gray-500">
                       Updated: {new Date(doc.lastUpdated).toLocaleDateString()}
                     </p>
                     <div className="flex space-x-2">
                       {doc.downloadUrl && (
                         <Button variant="outline" size="sm">
                           <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                           <span className="hidden sm:inline">Download</span>
                           <span className="sm:hidden">DL</span>
                         </Button>
                       )}
                       <Button variant="outline" size="sm">
                         <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                         <span className="hidden sm:inline">View</span>
                         <span className="sm:hidden">View</span>
                       </Button>
                     </div>
                   </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-8 sm:mb-12">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">Security Highlights</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
<Card className="text-center">
               <CardHeader>
                 <Lock className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-3 sm:mb-4" />
                 <CardTitle className="text-base sm:text-lg">End-to-End Encryption</CardTitle>
               </CardHeader>
               <CardContent>
                 <p className="text-gray-600 text-sm sm:text-base">
                   All data is encrypted in transit and at rest using industry-standard encryption protocols.
                 </p>
               </CardContent>
             </Card>
             
             <Card className="text-center">
               <CardHeader>
                 <Shield className="h-10 w-10 sm:h-12 sm:w-12 text-green-600 mx-auto mb-3 sm:mb-4" />
                 <CardTitle className="text-base sm:text-lg">24/7 Monitoring</CardTitle>
               </CardHeader>
               <CardContent>
                 <p className="text-gray-600 text-sm sm:text-base">
                   Continuous security monitoring and threat detection to keep your data safe.
                 </p>
               </CardContent>
             </Card>
             
             <Card className="text-center">
               <CardHeader>
                 <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-purple-600 mx-auto mb-3 sm:mb-4" />
                 <CardTitle className="text-base sm:text-lg">Regular Audits</CardTitle>
               </CardHeader>
               <CardContent>
                 <p className="text-gray-600 text-sm sm:text-base">
                   Third-party security audits and penetration testing to validate our security controls.
                 </p>
               </CardContent>
             </Card>
          </div>
        </section>

        <FAQSection items={faqItems} />

        <section className="bg-blue-50 rounded-lg p-6 sm:p-8 text-center">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">Have Questions?</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto px-4">
            Our security team is here to help. If you have questions about our security practices, 
            compliance status, or need access to additional documentation, please don't hesitate to reach out.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
            <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              Contact Security Team
            </Button>
            <Button variant="outline" className="w-full sm:w-auto">
              Request Audit Report
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12 sm:mt-16">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm sm:text-base">&copy; 2024 Descope. All rights reserved.</p>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm">
              Trust Center last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}