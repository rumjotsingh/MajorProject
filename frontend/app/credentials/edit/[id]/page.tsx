"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, X, Plus, Upload, Eye, FileText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Credential {
  _id: string;
  title: string;
  issuerId: {
    _id: string;
    name: string;
  };
  issueDate: string;
  verificationStatus: string;
  nsqfLevel: number;
  credits: number;
  skills: string[];
  certificateUrl: string;
}

export default function EditCredentialPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [credential, setCredential] = useState<Credential | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadedCertificateUrl, setUploadedCertificateUrl] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    credits: 0,
    issueDate: "",
    certificateUrl: "",
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    loadCredential();
  }, [params.id]);

  const loadCredential = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/credentials/${params.id}`);
      const cred = response.data;
      
      // Check if credential can be edited
      if (cred.verificationStatus === 'verified') {
        toast({
          title: "Cannot Edit",
          description: "Verified credentials cannot be edited",
          variant: "destructive",
        });
        router.push('/credentials');
        return;
      }

      setCredential(cred);
      setFormData({
        title: cred.title,
        credits: cred.credits || 0,
        issueDate: cred.issueDate.split('T')[0], // Format for date input
        certificateUrl: cred.certificateUrl || "",
      });
      setSkills(cred.skills || []);
      
      // Set preview to existing certificate URL
      if (cred.certificateUrl) {
        setPreviewUrl(cred.certificateUrl);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to load credential",
        variant: "destructive",
      });
      router.push('/credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || skills.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const credits = formData.credits;
    if (!credits || credits < 1 || credits > 40) {
      toast({
        title: "Invalid Credits",
        description: "Credits must be between 1 and 40",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      
      // Use uploaded certificate URL if available, otherwise use existing
      const certificateUrl = uploadedCertificateUrl || formData.certificateUrl;

      // Update credential with new data
      await api.put(`/credentials/${params.id}`, {
        title: formData.title,
        skills,
        credits: credits,
        issueDate: formData.issueDate,
        certificateUrl: certificateUrl || undefined,
      });

      toast({
        title: "Success",
        description: "Credential updated successfully. NSQF level recalculated.",
      });

      router.push('/credentials');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update credential",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    
    // Create temporary preview URL for images
    if (file.type.startsWith('image/')) {
      const tempUrl = URL.createObjectURL(file);
      setPreviewUrl(tempUrl);
    }

    // Automatically upload file to Cloudinary
    try {
      setUploading(true);
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const uploadResponse = await api.post("/credentials/upload-file", uploadFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const cloudinaryUrl = uploadResponse.data.certificateUrl;
      setUploadedCertificateUrl(cloudinaryUrl);
      
      // Update preview to show the Cloudinary URL
      setPreviewUrl(cloudinaryUrl);
      
      toast({
        title: "File Uploaded",
        description: "Certificate uploaded successfully to cloud storage",
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.response?.data?.error || "Failed to upload file",
        variant: "destructive",
      });
      setSelectedFile(null);
      setUploadedCertificateUrl("");
      setPreviewUrl(credential?.certificateUrl || "");
    } finally {
      setUploading(false);
    }
  };

  const isImageUrl = (url: string) => {
    return url && (url.match(/\.(jpeg|jpg|gif|png|webp)$/i) || url.includes('cloudinary'));
  };

  const isPdfUrl = (url: string) => {
    return url && url.match(/\.pdf$/i);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading credential...</p>
        </div>
      </div>
    );
  }

  if (!credential) {
    return null;
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Credential</h1>
          <p className="text-muted-foreground">Update your credential information</p>
        </div>
      </div>

      {/* Status Warning */}
      {credential.verificationStatus === 'rejected' && (
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">
              This credential was rejected. You can edit and resubmit it for verification.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Credential Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Issuer (Read-only) */}
            <div className="space-y-2">
              <Label>Issuer (Cannot be changed)</Label>
              <Input
                value={credential.issuerId.name}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                The issuer cannot be changed after credential creation
              </p>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Credential Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Advanced JavaScript Certification"
                required
              />
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label htmlFor="skills">
                Skills <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="skills"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Add a skill and press Enter"
                />
                <Button type="button" onClick={handleAddSkill} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.map((skill, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Credits and NSQF Level (Read-only) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="credits">
                  Credits <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="credits"
                  type="number"
                  min="1"
                  max="40"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 0 })}
                  placeholder="1-40"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Credits earned (1-40)
                </p>
              </div>

              <div className="space-y-2">
                <Label>NSQF Level (Auto-calculated)</Label>
                <Input
                  value={`Level ${credential.nsqfLevel}`}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Calculated based on total credits
                </p>
              </div>
            </div>

            {/* Issue Date */}
            <div className="space-y-2">
              <Label htmlFor="issueDate">
                Issue Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="issueDate"
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                max={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            {/* Certificate Upload with Preview */}
            <div className="space-y-4">
              <Label>Certificate</Label>
              
              {/* File Upload */}
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  id="certificateFile"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileSelect(file);
                    }
                  }}
                  className="hidden"
                  disabled={uploading}
                />
                <label
                  htmlFor="certificateFile"
                  className={`cursor-pointer flex flex-col items-center gap-2 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <Upload className={`h-10 w-10 text-muted-foreground ${uploading ? 'animate-pulse' : ''}`} />
                  {uploading ? (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Uploading to cloud storage...</p>
                      <p className="text-xs text-muted-foreground">Please wait</p>
                    </div>
                  ) : selectedFile ? (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-green-600">✓ {selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB - Uploaded successfully
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedFile(null);
                          setUploadedCertificateUrl("");
                          setPreviewUrl(credential?.certificateUrl || "");
                        }}
                      >
                        Remove & Use Original
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {previewUrl ? "Click to upload new certificate" : "Click to upload certificate"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF, JPG, PNG, DOC (Max 10MB)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        File will be uploaded automatically
                      </p>
                    </div>
                  )}
                </label>
              </div>

              {/* Certificate Preview */}
              {previewUrl && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      {uploadedCertificateUrl ? "New Certificate (Uploaded)" : "Current Certificate"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isImageUrl(previewUrl) ? (
                      <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
                        <img
                          src={previewUrl}
                          alt="Certificate preview"
                          className="w-full h-full object-contain"
                          key={previewUrl} // Force re-render when URL changes
                        />
                      </div>
                    ) : isPdfUrl(previewUrl) ? (
                      <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">PDF Document</p>
                          <p className="text-xs text-muted-foreground">
                            {uploadedCertificateUrl ? "Newly uploaded" : "Click to view"}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(previewUrl, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Document</p>
                          <p className="text-xs text-muted-foreground truncate">{previewUrl}</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(previewUrl, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Upload Success Message */}
              {uploadedCertificateUrl && (
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mt-2">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    ✓ New certificate uploaded successfully. Click "Save Changes" to update your credential.
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button type="submit" disabled={saving || uploading} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : uploading ? "Uploading..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={saving || uploading}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">About Editing Credentials</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Only unverified credentials can be edited</li>
            <li>• The issuer cannot be changed after creation</li>
            <li>• NSQF level is automatically recalculated based on your total credits</li>
            <li>• Changes will reset verification status to pending</li>
            <li>• Make sure all information is accurate before saving</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
