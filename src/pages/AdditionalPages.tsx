import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface Document {
  id: string;
  title: string;
  description: string;
  category: string;
  accessLevel: "public" | "registered" | "enterprise";
  fileSize: string;
  fileType: string;
  lastUpdated: string;
  downloadCount: number;
}

const mockDocuments: Document[] = [
  {
    id: "1",
    title: "Security Whitepaper",
    description: "Comprehensive overview of our security architecture and best practices",
    category: "Security",
    accessLevel: "public",
    fileSize: "2.4 MB",
    fileType: "PDF",
    lastUpdated: "2024-12-01",
    downloadCount: 1234
  },
  {
    id: "2", 
    title: "API Documentation",
    description: "Complete API reference and integration guides",
    category: "Technical",
    accessLevel: "registered",
    fileSize: "5.1 MB",
    fileType: "PDF",
    lastUpdated: "2024-12-10",
    downloadCount: 892
  },
  {
    id: "3",
    title: "Incident Response Plan",
    description: "Detailed incident response procedures and communication protocols",
    category: "Security",
    accessLevel: "enterprise",
    fileSize: "1.8 MB",
    fileType: "PDF",
    lastUpdated: "2024-11-15",
    downloadCount: 234
  },
  {
    id: "4",
    title: "GDPR Compliance Guide",
    description: "How our platform complies with GDPR requirements",
    category: "Compliance",
    accessLevel: "public",
    fileSize: "3.2 MB",
    fileType: "PDF",
    lastUpdated: "2024-12-05",
    downloadCount: 567
  },
  {
    id: "5",
    title: "SOC 2 Type II Report",
    description: "Latest SOC 2 Type II audit report and attestation",
    category: "Compliance",
    accessLevel: "registered",
    fileSize: "4.7 MB",
    fileType: "PDF",
    lastUpdated: "2024-11-20",
    downloadCount: 445
  },
  {
    id: "6",
    title: "Technical Architecture Overview",
    description: "Deep dive into our infrastructure and system design",
    category: "Technical",
    accessLevel: "enterprise",
    fileSize: "6.3 MB",
    fileType: "PDF",
    lastUpdated: "2024-12-08",
    downloadCount: 178
  }
];

function getAccessLevelBadge(accessLevel: string) {
  switch (accessLevel) {
    case "public":
      return <Badge variant="default" className="bg-green-100 text-green-800">Public</Badge>;
    case "registered":
      return <Badge variant="default" className="bg-blue-100 text-blue-800">Registered</Badge>;
    case "enterprise":
      return <Badge variant="default" className="bg-purple-100 text-purple-800">Enterprise</Badge>;
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
}

function handleDocumentDownload(document: Document) {
  if (document.accessLevel === "public") {
    alert(`Downloading ${document.title}...`);
  } else if (document.accessLevel === "registered") {
    alert(`Please sign in to download ${document.title}`);
  } else {
    alert(`Enterprise access required for ${document.title}`);
  }
}

export function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<string>("all");

  const categories = ["all", ...Array.from(new Set(mockDocuments.map(doc => doc.category)))];
  const accessLevels = ["all", "public", "registered", "enterprise"];

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    const matchesAccessLevel = selectedAccessLevel === "all" || doc.accessLevel === selectedAccessLevel;
    
    return matchesSearch && matchesCategory && matchesAccessLevel;
  });

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="text-lg text-muted-foreground">
          Access security documentation, whitepapers, and technical resources.
        </p>
      </div>

      {/* Access Control Information */}
      <Card>
        <CardHeader>
          <CardTitle>Access Levels</CardTitle>
          <CardDescription>
            Document access is controlled based on your account level
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800">Public</Badge>
            <span className="text-sm">Available to everyone</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-800">Registered</Badge>
            <span className="text-sm">Requires account registration</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-100 text-purple-800">Enterprise</Badge>
            <span className="text-sm">Enterprise customers only</span>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Document Library</CardTitle>
          <CardDescription>
            Search and filter through our documentation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accessLevel">Access Level</Label>
              <Select value={selectedAccessLevel} onValueChange={setSelectedAccessLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select access level" />
                </SelectTrigger>
                <SelectContent>
                  {accessLevels.map(level => (
                    <SelectItem key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No documents found matching your criteria.</p>
            </CardContent>
          </Card>
        ) : (
          filteredDocuments.map(document => (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{document.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      {getAccessLevelBadge(document.accessLevel)}
                      <Badge variant="outline">{document.category}</Badge>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div>{document.fileSize}</div>
                    <div>{document.fileType}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{document.description}</p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <span>Updated: {document.lastUpdated}</span>
                    <span className="mx-2">•</span>
                    <span>{document.downloadCount} downloads</span>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleDocumentDownload(document)}
                    className="ml-4"
                  >
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Document Request Form */}
      <Card>
        <CardHeader>
          <CardTitle>Request Access</CardTitle>
          <CardDescription>
            Need access to restricted documents? Submit a request for review.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requestName">Your Name</Label>
              <Input id="requestName" placeholder="Enter your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requestEmail">Email</Label>
              <Input id="requestEmail" type="email" placeholder="Enter your email" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="requestDocument">Document Requested</Label>
            <Input id="requestDocument" placeholder="Which document do you need access to?" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requestReason">Reason for Access</Label>
            <Input id="requestReason" placeholder="Please explain why you need access" />
          </div>
          <Button>Submit Request</Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function InfrastructurePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Infrastructure</h1>
        <p className="text-lg text-muted-foreground">
          Overview of our technical infrastructure and reliability measures.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            Current infrastructure status and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Infrastructure details coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Privacy</h1>
        <p className="text-lg text-muted-foreground">
          How we handle and protect your personal data and privacy.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Privacy Policy</CardTitle>
          <CardDescription>
            Our commitment to data protection and privacy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Privacy information coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function ContactPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Contact</h1>
        <p className="text-lg text-muted-foreground">
          Get in touch with our security and trust team.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Security Contacts</CardTitle>
          <CardDescription>
            How to reach our security and compliance teams
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Contact information coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}