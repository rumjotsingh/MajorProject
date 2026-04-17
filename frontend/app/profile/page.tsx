"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  User, Mail, Award, GraduationCap, Briefcase, Edit, Save, X, 
  Plus, Trash2, MapPin, Calendar, Building2 
} from "lucide-react";
import { dashboardAPI, type LearnerProfile } from "@/lib/dashboard-api";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [formData, setFormData] = useState({
    bio: "",
    education: [] as Array<{ degree: string; institution: string; year: string; fieldOfStudy: string }>,
    experience: [] as Array<{ role: string; company: string; duration: string; description: string }>,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  // Prefill form data when profile loads
  useEffect(() => {
    if (profile) {
      let education = Array.isArray(profile.education) ? profile.education : [];
      education = education.filter(item => 
        item && typeof item === 'object' && !Array.isArray(item) && typeof item !== 'string'
      );
      
      let experience = Array.isArray(profile.experience) ? profile.experience : [];
      experience = experience.filter(item => 
        item && typeof item === 'object' && !Array.isArray(item) && typeof item !== 'string'
      );
      
      setFormData({
        bio: profile.bio || "",
        education,
        experience,
      });
    }
  }, [profile]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await dashboardAPI.getProfile();
      setProfile(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const cleanedData = {
        bio: formData.bio,
        education: formData.education.filter(
          (edu) => edu.degree || edu.institution || edu.year || edu.fieldOfStudy
        ),
        experience: formData.experience.filter(
          (exp) => exp.role || exp.company || exp.duration || exp.description
        ),
      };
      
      await api.put("/profile/me", cleanedData);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setEditing(false);
      loadProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your personal information and credentials
          </p>
        </div>
        {!editing ? (
          <Button onClick={() => setEditing(true)} size="sm" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(false)} disabled={saving}>
              <X className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="rounded-xl border border-border/50 bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold">{profile.userId.name}</h2>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <Mail className="h-4 w-4" />
              <span className="text-sm">{profile.userId.email}</span>
            </div>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Level {profile.nsqfLevel}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-muted-foreground">{profile.skills.length} Skills</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="mt-6">
          <label className="text-sm font-medium mb-2 block">About</label>
          {editing ? (
            <textarea
              className="w-full min-h-[80px] rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              {profile.bio || "No bio added yet"}
            </p>
          )}
        </div>
      </div>

      {/* Skills Section */}
      <div className="rounded-xl border border-border/50 bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Skills</h3>
          </div>
          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full">
            Auto-computed
          </span>
        </div>
        
        {profile.skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-muted text-sm font-medium">
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Award className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">No skills yet</p>
            <Link href="/credentials/upload">
              <Button size="sm" variant="outline">Upload Credential</Button>
            </Link>
          </div>
        )}
        
        <div className="mt-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-muted-foreground">
            💡 Skills are automatically extracted from your verified credentials. Upload more credentials to expand your skill set.
          </p>
        </div>
      </div>

      {/* Education Section */}
      <div className="rounded-xl border border-border/50 bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Education</h3>
          </div>
          {editing && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setFormData({
                  ...formData,
                  education: [...formData.education, { degree: "", institution: "", year: "", fieldOfStudy: "" }],
                });
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            {formData.education.map((edu, i) => (
              <div key={i} className="rounded-xl border border-border/30 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Education {i + 1}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const newEducation = formData.education.filter((_, idx) => idx !== i);
                      setFormData({ ...formData, education: newEducation });
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    placeholder="Degree"
                    value={edu.degree}
                    onChange={(e) => {
                      const newEducation = [...formData.education];
                      newEducation[i].degree = e.target.value;
                      setFormData({ ...formData, education: newEducation });
                    }}
                  />
                  <Input
                    placeholder="Institution"
                    value={edu.institution}
                    onChange={(e) => {
                      const newEducation = [...formData.education];
                      newEducation[i].institution = e.target.value;
                      setFormData({ ...formData, education: newEducation });
                    }}
                  />
                  <Input
                    placeholder="Year (e.g., 2020-2024)"
                    value={edu.year}
                    onChange={(e) => {
                      const newEducation = [...formData.education];
                      newEducation[i].year = e.target.value;
                      setFormData({ ...formData, education: newEducation });
                    }}
                  />
                  <Input
                    placeholder="Field of Study"
                    value={edu.fieldOfStudy}
                    onChange={(e) => {
                      const newEducation = [...formData.education];
                      newEducation[i].fieldOfStudy = e.target.value;
                      setFormData({ ...formData, education: newEducation });
                    }}
                  />
                </div>
              </div>
            ))}
            {formData.education.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No education added. Click the + button to add your education.
              </p>
            )}
          </div>
        ) : profile.education && profile.education.length > 0 ? (
          <div className="space-y-4">
            {profile.education.map((edu, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{edu.degree}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Building2 className="h-3 w-3" />
                    <span>{edu.institution}</span>
                    {edu.year && (
                      <>
                        <span>•</span>
                        <Calendar className="h-3 w-3" />
                        <span>{edu.year}</span>
                      </>
                    )}
                  </div>
                  {edu.fieldOfStudy && (
                    <p className="text-sm text-muted-foreground mt-1">{edu.fieldOfStudy}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No education added yet</p>
        )}
      </div>

      {/* Experience Section */}
      <div className="rounded-xl border border-border/50 bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Experience</h3>
          </div>
          {editing && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setFormData({
                  ...formData,
                  experience: [...formData.experience, { role: "", company: "", duration: "", description: "" }],
                });
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            {formData.experience.map((exp, i) => (
              <div key={i} className="rounded-xl border border-border/30 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Experience {i + 1}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const newExperience = formData.experience.filter((_, idx) => idx !== i);
                      setFormData({ ...formData, experience: newExperience });
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    placeholder="Role"
                    value={exp.role}
                    onChange={(e) => {
                      const newExperience = [...formData.experience];
                      newExperience[i].role = e.target.value;
                      setFormData({ ...formData, experience: newExperience });
                    }}
                  />
                  <Input
                    placeholder="Company"
                    value={exp.company}
                    onChange={(e) => {
                      const newExperience = [...formData.experience];
                      newExperience[i].company = e.target.value;
                      setFormData({ ...formData, experience: newExperience });
                    }}
                  />
                </div>
                <Input
                  placeholder="Duration (e.g., Jan 2020 - Dec 2022)"
                  value={exp.duration}
                  onChange={(e) => {
                    const newExperience = [...formData.experience];
                    newExperience[i].duration = e.target.value;
                    setFormData({ ...formData, experience: newExperience });
                  }}
                />
                <textarea
                  className="w-full min-h-[60px] rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none"
                  placeholder="Description"
                  value={exp.description}
                  onChange={(e) => {
                    const newExperience = [...formData.experience];
                    newExperience[i].description = e.target.value;
                    setFormData({ ...formData, experience: newExperience });
                  }}
                />
              </div>
            ))}
            {formData.experience.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No experience added. Click the + button to add your work experience.
              </p>
            )}
          </div>
        ) : profile.experience && profile.experience.length > 0 ? (
          <div className="space-y-4">
            {profile.experience.map((exp, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{exp.role}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Building2 className="h-3 w-3" />
                    <span>{exp.company}</span>
                    {exp.duration && (
                      <>
                        <span>•</span>
                        <Calendar className="h-3 w-3" />
                        <span>{exp.duration}</span>
                      </>
                    )}
                  </div>
                  {exp.description && (
                    <p className="text-sm text-muted-foreground mt-2">{exp.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No experience added yet</p>
        )}
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6 pb-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>

      <div className="rounded-xl border border-border/50 bg-card p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-20 w-full mt-6" />
      </div>

      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-border/50 bg-card p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-16 w-full" />
        </div>
      ))}
    </div>
  );
}