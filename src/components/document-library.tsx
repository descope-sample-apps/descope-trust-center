import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Shield, Award, Download, ExternalLink, Search, Filter } from "lucide-react";

interface Document {
  id: string;
  title: string;
  type: "policy" | "report" | "certificate" | "guide" | "technical";
  category: "security" | "compliance" | "privacy" | "technical" | "legal";
  description: string;
  lastUpdated: string;
  downloadUrl?: string;
  externalUrl?: string;
  tags: string[];
}

interface DocumentLibraryProps {
  documents?: Document[];
}

const defaultDocuments: Document[] = [
  {
    id: "1",
    title: "Security Policy",
    type: "policy",
    category: "security",
    description: "Comprehensive security policies and procedures",
    lastUpdated: "2024-11-01",
    downloadUrl: "#",
    tags: ["security", "policy", "internal"]
  },
  {
    id: "2",
    title: "Privacy Policy",
    type: "policy",
    category: "privacy",
    description: "How we collect, use, and protect customer data",
    lastUpdated: "2024-10-15",
    downloadUrl: "#",
    tags: ["privacy", "policy", "gdpr"]
  },
  {
    id: "3",
    title: "SOC 2 Type II Report",
    type: "report",
    category: "compliance",
    description: "Latest SOC 2 Type II examination report",
    lastUpdated: "2024-11-15",
    downloadUrl: "#",
    tags: ["soc2", "compliance", "audit"]
  },
  {
    id: "4",
    title: "ISO 27001 Certificate",
    type: "certificate",
    category: "compliance",
    description: "Official ISO 27001 certification document",
    lastUpdated: "2024-10-20",
    downloadUrl: "#",
    tags: ["iso27001", "compliance", "certificate"]
  },
  {
    id: "5",
    title: "Data Processing Agreement",
    type: "legal",
    category: "legal",
    description: "Standard DPA for enterprise customers",
    lastUpdated: "2024-09-30",
    downloadUrl: "#",
    tags: ["dpa", "legal", "enterprise"]
  },
  {
    id: "6",
    title: "API Security Guide",
    type: "guide",
    category: "technical",
    description: "Best practices for secure API integration",
    lastUpdated: "2024-11-20",
    externalUrl: "#",
    tags: ["api", "security", "technical"]
  },
  {
    id: "7",
    title: "Penetration Testing Report",
    type: "report",
    category: "security",
    description: "Latest third-party penetration testing results",
    lastUpdated: "2024-10-10",
    downloadUrl: "#",
    tags: ["pentest", "security", "audit"]
  },
  {
    id: "8",
    title: "Incident Response Plan",
    type: "policy",
    category: "security",
    description: "Procedures for handling security incidents",
    lastUpdated: "2024-11-05",
    downloadUrl: "#",
    tags: ["incident", "response", "security"]
  }
];

const typeConfig = {
  policy: { icon: FileText, color: "text-blue-600", label: "Policy" },
  report: { icon: Shield, color: "text-green-600", label: "Report" },
  certificate: { icon: Award, color: "text-purple-600", label: "Certificate" },
  guide: { icon: FileText, color: "text-orange-600", label: "Guide" },
  technical: { icon: FileText, color: "text-gray-600", label: "Technical" }
} as const;

const categoryConfig = {
  security: { label: "Security", color: "bg-red-100 text-red-800" },
  compliance: { label: "Compliance", color: "bg-green-100 text-green-800" },
  privacy: { label: "Privacy", color: "bg-blue-100 text-blue-800" },
  technical: { label: "Technical", color: "bg-gray-100 text-gray-800" },
  legal: { label: "Legal", color: "bg-purple-100 text-purple-800" }
} as const;

export function DocumentLibrary({ documents = defaultDocuments }: DocumentLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = searchTerm === "" || 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
      const matchesType = selectedType === "all" || doc.type === selectedType;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [documents, searchTerm, selectedCategory, selectedType]);

  const documentStats = useMemo(() => {
    const stats = documents.reduce((acc, doc) => {
      acc[doc.category] = (acc[doc.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryConfig).map(([key, config]) => ({
      key,
      label: config.label,
      count: stats[key] || 0,
      color: config.color
    }));
  }, [documents]);

  const getDocumentIcon = (type: Document["type"]) => {
    const config = typeConfig[type];
    const Icon = config.icon;
    return <Icon className={`h-5 w-5 ${config.color}`} />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Document Library</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Access our comprehensive collection of security, compliance, and technical documentation.
        </p>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {documentStats.map(stat => (
          <Card key={stat.key} className="text-center">
            <CardContent className="pt-4">
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stat.color} mb-2`}>
                {stat.label}
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.count}</div>
              <div className="text-sm text-gray-500">documents</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(typeConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || selectedCategory !== "all" || selectedType !== "all") && (
            <div className="mt-4 flex items-center space-x-2">
              <span className="text-sm text-gray-500">Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Search: "{searchTerm}"
                </span>
              )}
              {selectedCategory !== "all" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Category: {categoryConfig[selectedCategory as keyof typeof categoryConfig].label}
                </span>
              )}
              {selectedType !== "all" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Type: {typeConfig[selectedType as keyof typeof typeConfig].label}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedType("all");
                }}
              >
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredDocuments.length} of {documents.length} documents
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDocuments.map((doc) => (
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
              <div className="space-y-3">
                {/* Metadata */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryConfig[doc.category].color}`}>
                      {categoryConfig[doc.category].label}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-500">{typeConfig[doc.type].label}</span>
                  </div>
                  <span className="text-gray-500">
                    {new Date(doc.lastUpdated).toLocaleDateString()}
                  </span>
                </div>

                {/* Tags */}
                {doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {doc.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  {doc.downloadUrl && (
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                  {doc.externalUrl && (
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  )}
                  {!doc.downloadUrl && !doc.externalUrl && (
                    <Button variant="outline" size="sm" disabled>
                      Request Access
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredDocuments.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSelectedType("all");
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}