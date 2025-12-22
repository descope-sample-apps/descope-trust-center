import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Shield, FileText, CheckCircle, Lock, Award, Download, ExternalLink } from "lucide-react";

export interface ComplianceItem {
  name: string;
  status: "compliant" | "pending" | "in-progress";
  description: string;
  lastUpdated: string;
}

export interface Document {
  id: string;
  title: string;
  type: "policy" | "report" | "certificate";
  description: string;
  lastUpdated: string;
  downloadUrl?: string;
}

export interface ComplianceGridProps {
  complianceItems?: ComplianceItem[];
  documents?: Document[];
  showDocuments?: boolean;
  className?: string;
}

const getStatusVariant = (status: ComplianceItem["status"]) => {
  switch (status) {
    case "compliant":
      return "success";
    case "pending":
      return "warning";
    case "in-progress":
      return "info";
    default:
      return "secondary";
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

const ComplianceCard = ({ item }: { item: ComplianceItem }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <CardTitle className="text-base sm:text-lg">{item.name}</CardTitle>
        <Badge variant={getStatusVariant(item.status)} className="flex items-center space-x-1.5">
          {getStatusIcon(item.status)}
          <span className="capitalize">{item.status.replace('-', ' ')}</span>
        </Badge>
      </div>
      <CardDescription>{item.description}</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-xs sm:text-sm text-muted-foreground">
        Last updated: {new Date(item.lastUpdated).toLocaleDateString()}
      </p>
    </CardContent>
  </Card>
);

const DocumentCard = ({ doc }: { doc: Document }) => {
  const getTypeVariant = (type: Document["type"]) => {
    switch (type) {
      case "policy":
        return "default";
      case "report":
        return "success";
      case "certificate":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start space-x-3">
          {getDocumentIcon(doc.type)}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <CardTitle className="text-base sm:text-lg">{doc.title}</CardTitle>
              <Badge variant={getTypeVariant(doc.type)} size="sm">
                {doc.type}
              </Badge>
            </div>
            <CardDescription>{doc.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs sm:text-sm text-muted-foreground">
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
  );
};

export function ComplianceGrid({ 
  complianceItems = [], 
  documents = [], 
  showDocuments = true,
  className 
}: ComplianceGridProps) {
  return (
    <div className={className}>
      <section className="mb-12">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6">Compliance Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {complianceItems.map((item, index) => (
            <ComplianceCard key={index} item={item} />
          ))}
        </div>
      </section>

      {showDocuments && documents.length > 0 && (
        <section className="mb-12">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">Security Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}