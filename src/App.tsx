import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SecurityOverviewDashboard } from "./components/SecurityOverviewDashboard";
import { Shield } from "lucide-react";
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

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <SecurityOverviewDashboard />
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