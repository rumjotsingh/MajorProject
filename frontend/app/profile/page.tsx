"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Mail, Award, Briefcase, GraduationCap, Edit, Save, X, Plus, Trash2 } from "lucide-react";
import { dashboardAPI, type LearnerProfile } from "@/lib/dashboard-api";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [formData, setFormData] = useState({
    bio: "",
    skills: [] as string[],
    education: [] as Array<{ degree: string; institution: string; year: string; fieldOfStudy: string }>,
    experience: [] as Array<{ role: string; company: string; duration: string; description: string }>,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await dashboardAPI.getProfile();
      setProfile(data);
      setFormData({
        bio: data.bio || "",
        skills: data.skills || [],
        education: data.education || [],
        experience: data.experience || [],
      });
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
      await api.put("/profile/me", formData);
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
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Profile not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information</p>
        </div>
        {!editing ? (
          <Button onClick={() => setEditing(true)} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Info Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{profile.userId.name}</h2>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{profile.userId.email}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Bio</label>
                {editing ? (
                  <textarea
                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-muted-foreground">
                    {profile.bio || "No bio added yet"}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">NSQF Level</label>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span className="text-lg font-semibold">Level {profile.nsqfLevel}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Skills</span>
              <Badge variant="secondary">{profile.skills.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">NSQF Level</span>
              <Badge>{profile.nsqfLevel}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Education</span>
              <Badge variant="secondary">{profile.education?.length || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Experience</span>
              <Badge variant="secondary">{profile.experience?.length || 0}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profile.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, i) => (
                <Badge key={i} variant="secondary" className="text-sm">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No skills added yet</p>
          )}
        </CardContent>
      </Card>

      {/* Education Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Education
            </CardTitle>
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
                <Plus className="h-4 w-4 mr-2" />
                Add Education
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {editing ? (
            formData.education.length > 0 ? (
              formData.education.map((edu, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Education {i + 1}</h4>
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
                  <Input
                    placeholder="Degree (e.g., Bachelor of Science)"
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
                  <div className="grid grid-cols-2 gap-3">
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
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No education added. Click "Add Education" to get started.
              </p>
            )
          ) : profile.education && profile.education.length > 0 ? (
            profile.education.map((edu, i) => (
              <div key={i} className="border-l-2 border-primary pl-4">
                <h3 className="font-semibold">{edu.degree}</h3>
                <p className="text-sm text-muted-foreground">{edu.institution}</p>
                {edu.fieldOfStudy && (
                  <p className="text-sm text-muted-foreground">{edu.fieldOfStudy}</p>
                )}
                <p className="text-xs text-muted-foreground">{edu.year}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No education added yet</p>
          )}
        </CardContent>
      </Card>

      {/* Experience Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Experience
            </CardTitle>
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
                <Plus className="h-4 w-4 mr-2" />
                Add Experience
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {editing ? (
            formData.experience.length > 0 ? (
              formData.experience.map((exp, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Experience {i + 1}</h4>
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
                  <Input
                    placeholder="Role (e.g., Software Engineer)"
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
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Description"
                    value={exp.description}
                    onChange={(e) => {
                      const newExperience = [...formData.experience];
                      newExperience[i].description = e.target.value;
                      setFormData({ ...formData, experience: newExperience });
                    }}
                  />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No experience added. Click "Add Experience" to get started.
              </p>
            )
          ) : profile.experience && profile.experience.length > 0 ? (
            profile.experience.map((exp, i) => (
              <div key={i} className="border-l-2 border-primary pl-4">
                <h3 className="font-semibold">{exp.role}</h3>
                <p className="text-sm text-muted-foreground">{exp.company}</p>
                <p className="text-xs text-muted-foreground mb-2">{exp.duration}</p>
                {exp.description && (
                  <p className="text-sm text-muted-foreground">{exp.description}</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No experience added yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
