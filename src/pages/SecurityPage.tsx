import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Key, AlertTriangle, CheckCircle } from "lucide-react";

export function SecurityPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Security</h1>
        <p className="text-lg text-muted-foreground">
          Learn about our comprehensive security measures and how we protect your data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Overview
            </CardTitle>
            <CardDescription>
              Our approach to security and data protection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Lock className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">End-to-End Encryption</p>
                  <p className="text-sm text-muted-foreground">AES-256 encryption for data at rest and in transit</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Key className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Identity & Access Management</p>
                  <p className="text-sm text-muted-foreground">Multi-factor authentication and role-based access</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Network Security</p>
                  <p className="text-sm text-muted-foreground">Firewalls, DDoS protection, and intrusion detection</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Incident Response
            </CardTitle>
            <CardDescription>
              How we handle security incidents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">24/7 Monitoring</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">Incident Response Team</span>
                <Badge variant="default">On Call</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">Response Time</span>
                <Badge variant="secondary">&lt; 1 Hour</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">Regular Drills</span>
                <Badge variant="default">Quarterly</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Security Certifications</CardTitle>
          <CardDescription>
            Industry-recognized security certifications we maintain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold">SOC 2</h4>
              <p className="text-sm text-muted-foreground">Type II Certified</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold">ISO 27001</h4>
              <p className="text-sm text-muted-foreground">Information Security</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold">CSA STAR</h4>
              <p className="text-sm text-muted-foreground">Cloud Security</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold">PCI DSS</h4>
              <p className="text-sm text-muted-foreground">Payment Security</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}