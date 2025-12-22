import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
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

const ComplianceCard = ({ item }: { item: ComplianceItem }) => (
  <Card className="hover:shadow-md transition-shadow">
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
);

const DocumentCard = ({ doc }: { doc: Document }) => (
  <Card className="hover:shadow-md transition-shadow">
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
);

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