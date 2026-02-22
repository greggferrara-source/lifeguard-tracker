import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Upload, Download, Trash2, Clock, User, Tag, Search, Archive } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function DocumentManagement() {
  const qc = useQueryClient();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] = useState("");

  const { data: documents = [] } = useQuery({
    queryKey: ["documents"],
    queryFn: () => base44.entities.DocumentUpload.list("-uploaded_date")
  });

  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => base44.entities.Location.list()
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.list()
  });

  const { data: assets = [] } = useQuery({
    queryKey: ["assets"],
    queryFn: () => base44.entities.Asset.list()
  });

  const filtered = documents.filter(doc => {
    if (searchTerm && !doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) && !doc.description?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (categoryFilter && doc.category !== categoryFilter) return false;
    if (entityTypeFilter && doc.entity_type !== entityTypeFilter) return false;
    return true;
  });

  const categories = [...new Set(documents.map(d => d.category))];
  const entityTypes = [...new Set(documents.map(d => d.entity_type))];

  const deleteDoc = useMutation({
    mutationFn: (docId) => base44.entities.DocumentUpload.delete(docId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documents"] })
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Document Management</h1>
        <Button onClick={() => setShowUploadDialog(true)} className="bg-blue-600 hover:bg-blue-700">
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{documents.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Entity Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{entityTypes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {documents.filter(d => d.expiry_date && new Date(d.expiry_date) < new Date(Date.now() + 30*24*60*60*1000)).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex gap-4 flex-wrap items-end">
          <div className="flex-1 min-w-64">
            <label className="text-sm font-medium block mb-2">Search</label>
            <Input
              placeholder="Search by filename or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Entity Type</label>
            <select
              value={entityTypeFilter}
              onChange={(e) => setEntityTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="">All Types</option>
              {entityTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No documents found</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map(doc => (
            <Card key={doc.id} className={doc.expiry_date && new Date(doc.expiry_date) < new Date(Date.now() + 30*24*60*60*1000) ? "border-orange-200 bg-orange-50" : ""}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <p className="font-semibold">{doc.file_name}</p>
                      {doc.description && <p className="text-sm text-gray-600 mt-1">{doc.description}</p>}

                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline">{doc.category}</Badge>
                        <Badge className="bg-gray-100 text-gray-700">{doc.entity_type}: {doc.entity_name}</Badge>
                        <Badge className="bg-blue-100 text-blue-700">v{doc.version}</Badge>
                        {doc.expiry_date && (
                          <Badge className={new Date(doc.expiry_date) < new Date(Date.now() + 30*24*60*60*1000) ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}>
                            Expires: {doc.expiry_date}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{doc.uploaded_by_name}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{format(parseISO(doc.uploaded_date), "MMM d, yyyy")}</span>
                        <span>{(doc.file_size / 1024).toFixed(0)} KB</span>
                      </div>

                      {doc.tags?.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {doc.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => window.open(doc.file_url)}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteDoc.mutate(doc.id)} className="text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Upload Dialog */}
      <DocumentUploadDialog open={showUploadDialog} onOpenChange={setShowUploadDialog} locations={locations} employees={employees} assets={assets} />
    </div>
  );
}

function DocumentUploadDialog({ open, onOpenChange, locations, employees, assets }) {
  const qc = useQueryClient();
  const [entityType, setEntityType] = React.useState("Location");
  const [entityId, setEntityId] = React.useState("");
  const [category, setCategory] = React.useState("certification");
  const [file, setFile] = React.useState(null);
  const [fileName, setFileName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [expiryDate, setExpiryDate] = React.useState("");
  const [tags, setTags] = React.useState("");

  const entityOptions = {
    Location: locations,
    Employee: employees,
    Asset: assets
  };

  const upload = useMutation({
    mutationFn: async (data) => {
      if (!file) throw new Error("No file selected");
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const entity = entityOptions[entityType].find(e => e.id === entityId);
      return base44.entities.DocumentUpload.create({
        file_name: fileName || file.name,
        file_url,
        file_type: file.type,
        file_size: file.size,
        category,
        entity_type: entityType,
        entity_id: entityId,
        entity_name: entity?.name || "Unknown",
        uploaded_by_email: "current@user.com",
        uploaded_by_name: "Current User",
        uploaded_date: new Date().toISOString(),
        description: description || null,
        expiry_date: expiryDate || null,
        tags: tags ? tags.split(",").map(t => t.trim()) : [],
        version: 1
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents"] });
      onOpenChange(false);
      setFile(null);
      setFileName("");
      setDescription("");
      setExpiryDate("");
      setTags("");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file || !entityId) {
      alert("Please select a file and entity");
      return;
    }
    upload.mutate({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Entity Type *</label>
            <select
              value={entityType}
              onChange={(e) => { setEntityType(e.target.value); setEntityId(""); }}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="Location">Location</option>
              <option value="Employee">Employee</option>
              <option value="Asset">Asset</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Entity *</label>
            <select
              required
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="">Select {entityType}...</option>
              {entityOptions[entityType].map(e => (
                <option key={e.id} value={e.id}>{e.name || e.first_name + " " + e.last_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="certification">Certification</option>
              <option value="inspection_report">Inspection Report</option>
              <option value="equipment_manual">Equipment Manual</option>
              <option value="maintenance_log">Maintenance Log</option>
              <option value="compliance_doc">Compliance Document</option>
              <option value="training_material">Training Material</option>
              <option value="incident_report">Incident Report</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">File *</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">File Name</label>
            <Input placeholder="Auto-populated from file" value={fileName} onChange={(e) => setFileName(e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Description</label>
            <textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Expiry Date</label>
            <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Tags (comma-separated)</label>
            <Input placeholder="e.g., important, 2026" value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={upload.isPending}>
              {upload.isPending ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}