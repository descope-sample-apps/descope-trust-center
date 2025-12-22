import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, CheckCircle, Clock, Users, Lock, Eye, Activity } from "lucide-react";

interface SecurityMetric {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: React.ReactNode;
}

interface SecurityAlert {
  id: string;
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  timestamp: string;
  status: "open" | "investigating" | "resolved";
}

export function SecurityOverviewDashboard() {
  const securityMetrics: SecurityMetric[] = [
    {
      title: "Security Score",
      value: "94%",
      change: "+2%",
      trend: "up",
      icon: <Shield className="size-4" />
    },
    {
      title: "Active Threats",
      value: "3",
      change: "-1",
      trend: "down",
      icon: <AlertTriangle className="size-4" />
    },
    {
      title: "Compliance Rate",
      value: "98%",
      change: "0%",
      trend: "neutral",
      icon: <CheckCircle className="size-4" />
    },
    {
      title: "Response Time",
      value: "2.4h",
      change: "-0.3h",
      trend: "up",
      icon: <Clock className="size-4" />
    }
  ];

  const securityAlerts: SecurityAlert[] = [
    {
      id: "1",
      severity: "high",
      title: "Suspicious Login Activity",
      description: "Multiple failed login attempts detected from unusual IP range",
      timestamp: "2 hours ago",
      status: "investigating"
    },
    {
      id: "2",
      severity: "medium",
      title: "Outdated Security Policy",
      description: "Password policy requires update to meet new compliance standards",
      timestamp: "5 hours ago",
      status: "open"
    },
    {
      id: "3",
      severity: "low",
      title: "SSL Certificate Expiring",
      description: "Certificate for api.example.com expires in 30 days",
      timestamp: "1 day ago",
      status: "open"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400";
      case "medium":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-400";
      case "low":
        return "text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-950 dark:text-gray-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "text-gray-600 bg-gray-50 dark:bg-gray-950 dark:text-gray-400";
      case "investigating":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-400";
      case "resolved":
        return "text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-950 dark:text-gray-400";
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Overview</h1>
          <p className="text-muted-foreground">Monitor your security posture and threats</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Activity className="size-4 mr-2" />
            View Logs
          </Button>
          <Button>
            <Shield className="size-4 mr-2" />
            Run Security Scan
          </Button>
        </div>
      </div>

      {/* Security Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {securityMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <div className="text-muted-foreground">{metric.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className={`text-xs ${getTrendColor(metric.trend)}`}>
                {metric.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security Alerts and Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Security Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5" />
              Security Alerts
            </CardTitle>
            <CardDescription>Active security threats and warnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {securityAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                  <div className={`mt-0.5 rounded px-2 py-1 text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                    {alert.severity.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-none">{alert.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${getStatusColor(alert.status)}`}>
                        {alert.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5" />
              Recent Security Activity
            </CardTitle>
            <CardDescription>Latest security events and actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 rounded-full bg-green-100 p-1 dark:bg-green-900">
                  <CheckCircle className="size-3 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Security scan completed</p>
                  <p className="text-xs text-muted-foreground">No vulnerabilities detected</p>
                  <p className="text-xs text-muted-foreground mt-1">10 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 rounded-full bg-blue-100 p-1 dark:bg-blue-900">
                  <Users className="size-3 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">New user access granted</p>
                  <p className="text-xs text-muted-foreground">Admin privileges assigned to security team</p>
                  <p className="text-xs text-muted-foreground mt-1">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 rounded-full bg-yellow-100 p-1 dark:bg-yellow-900">
                  <Lock className="size-3 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Password policy updated</p>
                  <p className="text-xs text-muted-foreground">Minimum length increased to 12 characters</p>
                  <p className="text-xs text-muted-foreground mt-1">3 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 rounded-full bg-purple-100 p-1 dark:bg-purple-900">
                  <Eye className="size-3 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Audit log reviewed</p>
                  <p className="text-xs text-muted-foreground">Last 30 days of access patterns analyzed</p>
                  <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common security management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Shield className="size-6" />
              <span className="text-sm">Security Scan</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Users className="size-6" />
              <span className="text-sm">User Access</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Lock className="size-6" />
              <span className="text-sm">Policies</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Eye className="size-6" />
              <span className="text-sm">Audit Logs</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}