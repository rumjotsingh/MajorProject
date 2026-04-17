'use client';

import { useState, useEffect } from 'react';
import { Building2, Save, Mail, Phone, MapPin, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { employerApi } from '@/lib/employer-api';

interface EmployerProfile {
  companyName: string;
  website: string;
  description: string;
  location: string;
  contactEmail: string;
  contactPhone: string;
}

export default function EmployerProfilePage() {
  const [profile, setProfile] = useState<EmployerProfile>({
    companyName: '',
    website: '',
    description: '',
    location: '',
    contactEmail: '',
    contactPhone: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await employerApi.getProfile();
      if (data.profile) {
        const profileData = {
          companyName: data.profile.companyName || '',
          website: data.profile.website || '',
          description: data.profile.description || '',
          location: data.profile.location || '',
          contactEmail: data.profile.contactEmail || '',
          contactPhone: data.profile.contactPhone || '',
        };
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await employerApi.updateProfile(profile);
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Company Profile</h1>
        <p className="text-muted-foreground">Manage your company information</p>
      </div>

      {/* Form */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <Label htmlFor="companyName" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Company Name *
              </Label>
              <Input
                id="companyName"
                type="text"
                value={profile.companyName}
                onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                placeholder="Your Company Name"
                required
                className="mt-2 rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="website" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Website
              </Label>
              <Input
                id="website"
                type="url"
                value={profile.website}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                placeholder="https://yourcompany.com"
                className="mt-2 rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="description">Company Description *</Label>
              <Textarea
                id="description"
                value={profile.description}
                onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                rows={6}
                placeholder="Tell us about your company, culture, and what makes you unique..."
                required
                className="mt-2 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </Label>
                <Input
                  id="location"
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  placeholder="City, Country"
                  className="mt-2 rounded-xl"
                />
              </div>

              <div>
                <Label htmlFor="contactPhone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Contact Phone
                </Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={profile.contactPhone}
                  onChange={(e) => setProfile({ ...profile, contactPhone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className="mt-2 rounded-xl"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="contactEmail" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Contact Email
              </Label>
              <Input
                id="contactEmail"
                type="email"
                value={profile.contactEmail}
                onChange={(e) => setProfile({ ...profile, contactEmail: e.target.value })}
                placeholder="contact@yourcompany.com"
                className="mt-2 rounded-xl"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
