"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, X, Plus } from "lucide-react";
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
  const [credential, setCredential] = useState<Credential | null>(null);
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
      await api.put(`/credentials/${params.id}`, {
        title: formData.title,
        skills,
        credits: credits,
        issueDate: formData.issueDate,
        certificateUrl: formData.certificateUrl || undefined,
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

            {/* Certificate URL */}
            <div className="space-y-2">
              <Label htmlFor="certificateUrl">Certificate URL (Optional)</Label>
              <Input
                id="certificateUrl"
                type="url"
                value={formData.certificateUrl}
                onChange={(e) => setFormData({ ...formData, certificateUrl: e.target.value })}
                placeholder="https://example.com/certificate.pdf"
              />
              <p className="text-xs text-muted-foreground">
                URL to the certificate document or image
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button type="submit" disabled={saving} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={saving}
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
