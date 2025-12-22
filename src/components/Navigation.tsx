import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Home, FileText, Lock, Server, Eye, Mail } from "lucide-react";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Compliance", href: "/compliance", icon: Shield },
  { name: "Security", href: "/security", icon: Lock },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Infrastructure", href: "/infrastructure", icon: Server },
  { name: "Privacy", href: "/privacy", icon: Eye },
  { name: "Contact", href: "/contact", icon: Mail },
];

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="h-6 w-6" />
              <span className="font-bold text-lg">Trust Center</span>
            </Link>
            
            <div className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link key={item.name} to={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}