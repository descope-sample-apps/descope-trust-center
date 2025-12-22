import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Shield, Lock, CheckCircle, AlertTriangle, Users, Key, Eye, Cloud, Server } from "lucide-react";

interface SecurityMetric {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "stable";
}

interface SecurityControl {
  category: string;
  controls: Array<{
    name: string;
    status: "implemented" | "partial" | "planned";
    description: string;
  }>;
}

export function SecurityOverview() {
  const securityMetrics: SecurityMetric[] = [
    {
      title: "Uptime",
      value: "99.99%",
      description: "Platform availability over last 12 months",
      icon: <Server className="h-6 w-6 text-green-600" />,
      trend: "stable"
    },
    {
      title: "Security Incidents",
      value: "0",
      description: "Confirmed security incidents in last 24 months",
      icon: <Shield className="h-6 w-6 text-green-600" />,
      trend: "stable"
    },
    {
      title: "Response Time",
      value: "< 1 hour",
      description: "Average security incident response time",
      icon: <AlertTriangle className="h-6 w-6 text-blue-600" />,
      trend: "up"
    },
    {
      title: "Data Encryption",
      value: "256-bit",
      description: "AES encryption for data at rest and in transit",
      icon: <Lock className="h-6 w-6 text-purple-600" />,
      trend: "stable"
    }
  ];

  const securityControls: SecurityControl[] = [
    {
      category: "Access Control",
      controls: [
        {
          name: "Multi-Factor Authentication",
          status: "implemented",
          description: "MFA required for all administrative access"
        },
        {
          name: "Role-Based Access Control",
          status: "implemented", 
          description: "Granular permissions based on user roles"
        },
        {
          name: "Single Sign-On (SSO)",
          status: "implemented",
          description: "SAML and OAuth integration support"
        }
      ]
    },
    {
      category: "Data Protection",
      controls: [
        {
          name: "End-to-End Encryption",
          status: "implemented",
          description: "All data encrypted using industry-standard protocols"
        },
        {
          name: "Data Loss Prevention",
          status: "implemented",
          description: "Automated monitoring and prevention of data exfiltration"
        },
        {
          name: "Key Management",
          status: "implemented",
          description: "HSM-backed key management system"
        }
      ]
    },
    {
      category: "Infrastructure Security",
      controls: [
        {
          name: "Network Segmentation",
          status: "implemented",
          description: "Isolated network zones for different security levels"
        },
        {
          name: "DDoS Protection",
          status: "implemented",
          description: "Multi-layer DDoS mitigation system"
        },
        {
          name: "Vulnerability Management",
          status: "implemented",
          description: "Continuous scanning and remediation program"
        }
      ]
    },
    {
      category: "Monitoring & Detection",
      controls: [
        {
          name: "24/7 Security Monitoring",
          status: "implemented",
          description: "Continuous monitoring by security operations team"
        },
        {
          name: "Intrusion Detection",
          status: "implemented",
          description: "Real-time threat detection and alerting"
        },
        {
          name: "Security Information Management",
          status: "partial",
          description: "Centralized log management and analysis (in progress)"
        }
      ]
    }
  ];

  const getControlStatusColor = (status: SecurityControl["controls"][0]["status"]) => {
    switch (status) {
      case "implemented":
        return "text-green-600 bg-green-100";
      case "partial":
        return "text-yellow-600 bg-yellow-100";
      case "planned":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getControlStatusIcon = (status: SecurityControl["controls"][0]["status"]) => {
    switch (status) {
      case "implemented":
        return <CheckCircle className="h-4 w-4" />;
      case "partial":
        return <AlertTriangle className="h-4 w-4" />;
      case "planned":
        return <Shield className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend?: SecurityMetric["trend"]) => {
    switch (trend) {
      case "up":
        return "↗️";
      case "down":
        return "↘️";
      case "stable":
        return "→";
      default:
        return "";
    }
  };

  return (
    <section className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Security Overview</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Our comprehensive security program ensures the protection, confidentiality, and integrity 
          of your data through multiple layers of security controls and continuous monitoring.
        </p>
      </div>

      {/* Security Metrics */}
      <div className="mb-12">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6">Security Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {securityMetrics.map((metric, index) => (
            <Card key={index} className="text-center hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-center items-center mb-4">
                  {metric.icon}
                </div>
                <CardTitle className="text-lg">{metric.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {metric.value}
                  <span className="ml-2 text-sm">{getTrendIcon(metric.trend)}</span>
                </div>
                <p className="text-sm text-gray-600">{metric.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Security Controls */}
      <div className="mb-12">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6">Security Controls</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {securityControls.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  {category.category === "Access Control" && <Users className="h-5 w-5 mr-2 text-blue-600" />}
                  {category.category === "Data Protection" && <Lock className="h-5 w-5 mr-2 text-green-600" />}
                  {category.category === "Infrastructure Security" && <Cloud className="h-5 w-5 mr-2 text-purple-600" />}
                  {category.category === "Monitoring & Detection" && <Eye className="h-5 w-5 mr-2 text-orange-600" />}
                  {category.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {category.controls.map((control, controlIndex) => (
                    <div key={controlIndex} className="flex items-start space-x-3">
                      <div className={`flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-medium ${getControlStatusColor(control.status)}`}>
                        {getControlStatusIcon(control.status)}
                        <span className="capitalize">{control.status}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{control.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{control.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Security Frameworks */}
      <div className="mb-12">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6">Security Frameworks & Standards</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center hover:shadow-md transition-shadow">
            <CardHeader>
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>SOC 2 Type II</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Certified based on AICPA Trust Services Criteria for security, availability, 
                confidentiality, and privacy.
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-md transition-shadow">
            <CardHeader>
              <Key className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>ISO 27001</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Information Security Management System certification demonstrating 
                comprehensive security governance.
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-md transition-shadow">
            <CardHeader>
              <CheckCircle className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>GDPR & HIPAA</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Full compliance with data protection regulations including GDPR 
                and HIPAA for healthcare data.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Security Commitment */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
        <div className="text-center">
          <Shield className="h-16 w-16 text-blue-600 mx-auto mb-6" />
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Our Security Commitment</h3>
          <p className="text-gray-600 max-w-3xl mx-auto mb-6">
            Security is not just a feature—it's fundamental to everything we do. We continuously 
            invest in people, processes, and technology to maintain the highest security standards 
            and protect your data with enterprise-grade security controls.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
              <p className="text-sm text-gray-600">Security Monitoring</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">99.9%</div>
              <p className="text-sm text-gray-600">Compliance Rate</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
              <p className="text-sm text-gray-600">Security Breaches</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}