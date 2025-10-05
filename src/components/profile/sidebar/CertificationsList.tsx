import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Edit2, ExternalLink } from "lucide-react";
import { CertificationItem } from "@/hooks/profile/profileTypes";

interface CertificationsListProps {
  certifications: CertificationItem[];
  onAddCertification?: (cert: CertificationItem) => Promise<void>;
  onEditCertification?: (id: string, cert: CertificationItem) => Promise<void>;
  onRemoveCertification?: (id: string) => Promise<void>;
  highlightColor?: string;
}

export function CertificationsList({ 
  certifications, 
  onAddCertification, 
  onEditCertification,
  onRemoveCertification,
  highlightColor = "#FF6B4A"
}: CertificationsListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newCert, setNewCert] = useState({
    title: "",
    issuer: "",
    issue_date: "",
    credential_id: "",
    credential_url: "",
    description: ""
  });
  
  const [editCert, setEditCert] = useState({
    title: "",
    issuer: "",
    issue_date: "",
    credential_id: "",
    credential_url: "",
    description: ""
  });

  const handleAddCertification = async () => {
    if (newCert.title.trim() && newCert.issuer.trim() && onAddCertification) {
      try {
        await onAddCertification({
          title: newCert.title.trim(),
          issuer: newCert.issuer.trim(),
          issue_date: newCert.issue_date || undefined,
          credential_id: newCert.credential_id || undefined,
          credential_url: newCert.credential_url || undefined,
          description: newCert.description || undefined
        });
        setNewCert({ title: "", issuer: "", issue_date: "", credential_id: "", credential_url: "", description: "" });
        setIsAdding(false);
      } catch (error) {
        console.error("Error adding certification:", error);
      }
    }
  };

  const handleEditCertification = async (id: string) => {
    if (editCert.title.trim() && editCert.issuer.trim() && onEditCertification) {
      try {
        await onEditCertification(id, {
          id,
          title: editCert.title.trim(),
          issuer: editCert.issuer.trim(),
          issue_date: editCert.issue_date || undefined,
          credential_id: editCert.credential_id || undefined,
          credential_url: editCert.credential_url || undefined,
          description: editCert.description || undefined
        });
        setEditingId(null);
        setEditCert({ title: "", issuer: "", issue_date: "", credential_id: "", credential_url: "", description: "" });
      } catch (error) {
        console.error("Error editing certification:", error);
      }
    }
  };

  const startEdit = (cert: CertificationItem) => {
    setEditingId(cert.id || "");
    setEditCert({
      title: cert.title,
      issuer: cert.issuer,
      issue_date: cert.issue_date || "",
      credential_id: cert.credential_id || "",
      credential_url: cert.credential_url || "",
      description: cert.description || ""
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditCert({ title: "", issuer: "", issue_date: "", credential_id: "", credential_url: "", description: "" });
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setNewCert({ title: "", issuer: "", issue_date: "", credential_id: "", credential_url: "", description: "" });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold" style={{ color: highlightColor }}>Certifications</h3>
          {onAddCertification && !isAdding && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => setIsAdding(true)}
              style={{ color: highlightColor }}
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add certification</span>
            </Button>
          )}
        </div>
        
        {isAdding && (
          <div className="space-y-3 mb-4 p-4 border rounded-lg">
            <Input 
              value={newCert.title} 
              onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
              placeholder="Certification title (e.g., AWS Solutions Architect)"
              className="h-9"
            />
            <Input 
              value={newCert.issuer} 
              onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
              placeholder="Issuing organization (e.g., Amazon Web Services)"
              className="h-9"
            />
            <Input 
              type="month"
              value={newCert.issue_date} 
              onChange={(e) => setNewCert({ ...newCert, issue_date: e.target.value })}
              placeholder="Issue date"
              className="h-9"
            />
            <Input 
              value={newCert.credential_id} 
              onChange={(e) => setNewCert({ ...newCert, credential_id: e.target.value })}
              placeholder="Credential ID (optional)"
              className="h-9"
            />
            <Input 
              value={newCert.credential_url} 
              onChange={(e) => setNewCert({ ...newCert, credential_url: e.target.value })}
              placeholder="Credential URL (optional)"
              className="h-9"
            />
            <Textarea 
              value={newCert.description} 
              onChange={(e) => setNewCert({ ...newCert, description: e.target.value })}
              placeholder="Description (optional)"
              className="min-h-[60px]"
            />
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9" 
                onClick={handleAddCertification}
                disabled={!newCert.title.trim() || !newCert.issuer.trim()}
                style={{ 
                  borderColor: `${highlightColor}50`,
                  color: highlightColor
                }}
              >
                Add
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 px-2" 
                onClick={cancelAdd}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          {certifications.map((cert, index) => (
            <div key={cert.id || index}>
              {editingId === cert.id ? (
                <div className="space-y-3 p-4 border rounded-lg">
                  <Input 
                    value={editCert.title} 
                    onChange={(e) => setEditCert({ ...editCert, title: e.target.value })}
                    placeholder="Certification title"
                    className="h-9"
                  />
                  <Input 
                    value={editCert.issuer} 
                    onChange={(e) => setEditCert({ ...editCert, issuer: e.target.value })}
                    placeholder="Issuing organization"
                    className="h-9"
                  />
                  <Input 
                    type="month"
                    value={editCert.issue_date} 
                    onChange={(e) => setEditCert({ ...editCert, issue_date: e.target.value })}
                    placeholder="Issue date"
                    className="h-9"
                  />
                  <Input 
                    value={editCert.credential_id} 
                    onChange={(e) => setEditCert({ ...editCert, credential_id: e.target.value })}
                    placeholder="Credential ID (optional)"
                    className="h-9"
                  />
                  <Input 
                    value={editCert.credential_url} 
                    onChange={(e) => setEditCert({ ...editCert, credential_url: e.target.value })}
                    placeholder="Credential URL (optional)"
                    className="h-9"
                  />
                  <Textarea 
                    value={editCert.description} 
                    onChange={(e) => setEditCert({ ...editCert, description: e.target.value })}
                    placeholder="Description (optional)"
                    className="min-h-[60px]"
                  />
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9" 
                      onClick={() => handleEditCertification(cert.id || "")}
                      disabled={!editCert.title.trim() || !editCert.issuer.trim()}
                      style={{ 
                        borderColor: `${highlightColor}50`,
                        color: highlightColor
                      }}
                    >
                      Save
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-9 px-2" 
                      onClick={cancelEdit}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-semibold text-sm">{cert.title}</h4>
                        {cert.issue_date && (
                          <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                            {new Date(cert.issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                      {cert.description && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{cert.description}</p>
                      )}
                      {cert.credential_id && (
                        <p className="text-xs text-muted-foreground mt-1">ID: {cert.credential_id}</p>
                      )}
                      {cert.credential_url && (
                        <a 
                          href={cert.credential_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs inline-flex items-center gap-1 mt-1 hover:underline"
                          style={{ color: highlightColor }}
                        >
                          View credential <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <div className="flex gap-1 ml-3 flex-shrink-0">
                      {onEditCertification && (
                        <button
                          onClick={() => startEdit(cert)}
                          className="p-1 opacity-60 hover:opacity-100 transition-opacity"
                          style={{ color: highlightColor }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                      {onRemoveCertification && (
                        <button
                          onClick={() => onRemoveCertification(cert.id || "")}
                          className="p-1 opacity-60 hover:opacity-100 transition-opacity text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {certifications.length === 0 && !isAdding && (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">No certifications added yet</p>
            {onAddCertification && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2"
                onClick={() => setIsAdding(true)}
                style={{ color: highlightColor }}
              >
                Add your first certification
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}