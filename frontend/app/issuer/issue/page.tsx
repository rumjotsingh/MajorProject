"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Award, Plus, X, ArrowLeft, Info, Upload, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import api from "@/lib/api";

export default function IssueCredentialPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [nsqfLevels, setNsqfLevels] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<"url" | "file">("file");
  const [uploading, setUploading] = useState(false);
  const [uploadedCertificateUrl, setUploadedCertificateUrl] = useState<string>("");
  const [formData, setFormData] = useState({
    userEmail: "",
    title: "",
    credits: "",
    issueDate: "",
    certificateUrl: "",
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  // Fetch NSQF levels
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const response = await api.get("/nsqf/levels");
        setNsqfLevels(response.data.levels || []);
      } catch (error) {
        console.error("Failed to fetch NSQF levels:", error);
      }
    };
    fetchLevels();
  }, []);

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

    if (!formData.userEmail || !formData.title || !formData.issueDate || !formData.credits) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const credits = parseInt(formData.credits);
    if (!credits || credits < 1 || credits > 40) {
      toast({
        title: "Invalid Credits",
        description: "Credits must be between 1 and 40",
        variant: "destructive",
      });
      return;
    }

    // Validate certificate (either URL or file)
    if (uploadMethod === "url" && !formData.certificateUrl) {
      toast({
        title: "Validation Error",
        description: "Please provide a certificate URL or upload a file",
        variant: "destructive",
      });
      return;
    }

    if (uploadMethod === "file" && !uploadedCertificateUrl) {
      toast({
        title: "Validation Error",
        description: "Please upload a certificate file",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Use uploaded URL if file method, otherwise use URL from input
      const certificateUrl = uploadMethod === "file" ? uploadedCertificateUrl : formData.certificateUrl;

      const response = await api.post("/issuer/issue-credential", {
        userEmail: formData.userEmail,
        title: formData.title,
        skills,
        credits: credits,
        issueDate: formData.issueDate,
        certificateUrl: certificateUrl || undefined,
      });

      toast({
        title: "Success! 🎉",
        description: response.data.message || `Credential issued successfully! Learner earned ${response.data.creditsEarned} credits.`,
      });

      router.push("/issuer/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to issue credential",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);

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
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Issue Credential</h1>
          <p className="text-muted-foreground">Issue a new credential to a learner</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Credential Information
            </CardTitle>
            <CardDescription>
              Fill in the details to issue a credential. NSQF level will be calculated automatically based on the learner's total credits.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Learner Email */}
              <div className="space-y-2">
                <Label htmlFor="userEmail">
                  Learner Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="userEmail"
                  type="email"
                  placeholder="learner@example.com"
                  value={formData.userEmail}
                  onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  If the learner doesn't exist, an account will be created automatically
                </p>
              </div>

              {/* Credential Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Credential Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Advanced JavaScript Certification"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <div className="flex gap-2">
                  <Input
                    id="skills"
                    placeholder="Add a skill"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
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

              {/* Credits and Issue Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="credits" className="flex items-center gap-2">
                    Credits <span className="text-destructive">*</span>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </Label>
                  <Input
                    id="credits"
                    type="number"
                    min="1"
                    max="40"
                    placeholder="1-40"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Credits earned (1-40)
                  </p>
                </div>

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
              </div>

              {/* Certificate Upload/URL */}
              <div className="space-y-4">
                <Label>Certificate <span className="text-destructive">*</span></Label>
                
                {/* Toggle between URL and File Upload */}
                <div className="flex gap-2 mb-4">
                  <Button
                    type="button"
                    variant={uploadMethod === "url" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUploadMethod("url")}
                    className="flex-1"
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    URL
                  </Button>
                  <Button
                    type="button"
                    variant={uploadMethod === "file" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUploadMethod("file")}
                    className="flex-1"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </div>

                {uploadMethod === "url" ? (
                  <div className="space-y-2">
                    <Input
                      id="certificateUrl"
                      type="url"
                      placeholder="https://example.com/certificate.pdf"
                      value={formData.certificateUrl}
                      onChange={(e) => setFormData({ ...formData, certificateUrl: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      URL to the certificate document or image
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
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
                      />
                      <label
                        htmlFor="certificateFile"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <Upload className="h-10 w-10 text-muted-foreground" />
                        {uploading ? (
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Uploading...</p>
                            <p className="text-xs text-muted-foreground">Please wait</p>
                          </div>
                        ) : uploadedCertificateUrl ? (
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-green-600">✓ Uploaded Successfully</p>
                            <p className="text-xs text-muted-foreground">
                              {selectedFile?.name}
                            </p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                setSelectedFile(null);
                                setUploadedCertificateUrl("");
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : selectedFile ? (
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{selectedFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Click to upload certificate</p>
                            <p className="text-xs text-muted-foreground">
                              PDF, JPG, PNG, DOC (Max 10MB)
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      About NSQF Levels
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      The learner's NSQF level will be automatically calculated based on their total accumulated credits. 
                      You don't need to specify the NSQF level - it's determined by the system.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Issuing..." : "Issue Credential"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* NSQF Levels Reference */}
      {nsqfLevels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">NSQF Level Reference</CardTitle>
            <CardDescription>Credit requirements for each level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {nsqfLevels.map((level) => (
                <div
                  key={level.level}
                  className="p-3 rounded-lg border border-border"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">Level {level.level}</p>
                      <p className="text-xs text-muted-foreground">{level.description}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {level.minCredits}-{level.maxCredits === "Unlimited" ? "∞" : level.maxCredits}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">About Credential Issuance</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Credits are automatically added to the learner's total</li>
            <li>• NSQF level is calculated based on total accumulated credits</li>
            <li>• Credentials are automatically verified after issuance</li>
            <li>• Learners will receive notifications about new credentials</li>
            <li>• You can view and manage issued credentials from the dashboard</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
