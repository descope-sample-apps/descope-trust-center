import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ExternalLink, CheckCircle, AlertCircle, Clock } from "lucide-react";

interface Subprocessor {
  id: string;
  name: string;
  category: string;
  purpose: string;
  dataLocation: string;
  status: "active" | "under-review" | "inactive";
  lastReviewed: string;
  dpaUrl?: string;
}

interface SubprocessorsTableProps {
  subprocessors: Subprocessor[];
}

export function SubprocessorsTable({ subprocessors }: SubprocessorsTableProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const categories = React.useMemo(() => {
    const cats = new Set(subprocessors.map(sp => sp.category));
    return Array.from(cats).sort();
  }, [subprocessors]);

  const filteredSubprocessors = React.useMemo(() => {
    return subprocessors.filter(subprocessor => {
      const matchesSearch = searchTerm === "" || 
        subprocessor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subprocessor.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subprocessor.dataLocation.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === "all" || subprocessor.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || subprocessor.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [subprocessors, searchTerm, categoryFilter, statusFilter]);

  const getStatusColor = (status: Subprocessor["status"]) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "under-review":
        return "text-yellow-600 bg-yellow-100";
      case "inactive":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: Subprocessor["status"]) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />;
      case "under-review":
        return <Clock className="h-4 w-4" />;
      case "inactive":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Subprocessors</CardTitle>
        <p className="text-gray-600">
          Third-party services that process customer data on our behalf
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search subprocessors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="under-review">Under Review</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Purpose</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Data Location</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Last Reviewed</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubprocessors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No subprocessors found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredSubprocessors.map((subprocessor) => (
                  <tr key={subprocessor.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{subprocessor.name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">{subprocessor.category}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">{subprocessor.purpose}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">{subprocessor.dataLocation}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className={`flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subprocessor.status)}`}>
                        {getStatusIcon(subprocessor.status)}
                        <span className="capitalize">{subprocessor.status.replace('-', ' ')}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">
                        {new Date(subprocessor.lastReviewed).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        {subprocessor.dpaUrl && (
                          <a
                            href={subprocessor.dpaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredSubprocessors.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredSubprocessors.length} of {subprocessors.length} subprocessors
          </div>
        )}
      </CardContent>
    </Card>
  );
}