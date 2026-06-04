'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Award, Briefcase, GraduationCap, Mail, MapPin, Bookmark, BookmarkCheck, Shield, Calendar, Building2, ExternalLink } from 'lucide-react';
import { employerApi } from '@/lib/employer-api';
import { useToast } from '@/hooks/use-toast';

interface LearnerData {
  learner: {
    _id: string;
    name: string;
    email: string;
    bio: string;
    education: Array<{
      institution?: string;
      degree?: string;
      fieldOfStudy?: string;
      year?: string;
    }>;
    experience: Array<{
      company?: string;
      role?: string;
      duration?: string;
      description?: string;
    }>;
    skills: string[];
    totalCredits: number;
    nsqfLevel: number;
    joinedAt: string;
  };
  credentials: Array<{
    _id: string;
    title: string;
    description: string;
    skills: string[];
    credits: number;
    verificationStatus: string;
    issuerId: {
      _id: string;
      name: string;
      contactEmail: string;
    };
    issueDate: string;
    certificateUrl?: string;
    credentialType: string;
    nsqfLevel: number;
  }>;
  stats: {
    totalCredentials: number;
    totalCredits: number;
    nsqfLevel: number;
  };
  isBookmarked: boolean;
}

export default function EmployerLearnerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const learnerId = params.id as string;
  const { toast } = useToast();

  const [learnerData, setLearnerData] = useState<LearnerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  useEffect(() => {
    fetchLearnerDetails();
  }, [learnerId]);

  const fetchLearnerDetails = async () => {
    try {
      setLoading(true);
      const data = await employerApi.getLearnerDetails(learnerId);
      setLearnerData(data);
    } catch (error) {
      console.error('Error fetching learner details:', error);
      toast({
        title: "Error",
        description: "Failed to load learner details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!learnerData) return;
    
    try {
      setBookmarkLoading(true);
      if (learnerData.isBookmarked) {
        await employerApi.removeBookmark(learnerId);
        setLearnerData(prev => prev ? { ...prev, isBookmarked: false } : null);
        toast({
          title: "Success",
          description: "Learner removed from bookmarks",
        });
      } else {
        await employerApi.addBookmark(learnerId);
        setLearnerData(prev => prev ? { ...prev, isBookmarked: true } : null);
        toast({
          title: "Success", 
          description: "Learner added to bookmarks",
        });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive",
      });
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleVerifyCredential = async (credentialId: string) => {
    try {
      await employerApi.verifyCredential(credentialId);
      toast({
        title: "Success",
        description: "Credential verification requested",
      });
    } catch (error) {
      console.error('Error verifying credential:', error);
      toast({
        title: "Error",
        description: "Failed to verify credential",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'pending':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'failed':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading learner profile...</p>
        </div>
      </div>
    );
  }

  if (!learnerData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Learner not found</p>
          <button
            onClick={() => router.push('/employer/search')}
            className="mt-4 text-primary hover:text-primary/80"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const { learner, credentials, stats, isBookmarked } = learnerData;

  return (
    <div className="space-y-6 pb-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-muted rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">{learner.name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <Mail className="h-4 w-4" />
              <span>{learner.email}</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleBookmark}
          disabled={bookmarkLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
            isBookmarked
              ? 'bg-primary/10 text-primary border border-primary/20'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          {isBookmarked ? (
            <>
              <BookmarkCheck className="w-5 h-5" />
              Bookmarked
            </>
          ) : (
            <>
              <Bookmark className="w-5 h-5" />
              Bookmark
            </>
          )}
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border  bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">NSQF Level</p>
              <p className="text-2xl font-bold">Level {stats.nsqfLevel}</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border  bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Credits</p>
              <p className="text-2xl font-bold">{stats.totalCredits}</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border  bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Credentials</p>
              <p className="text-2xl font-bold">{stats.totalCredentials}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      {learner.bio && (
        <div className="rounded-xl border  bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">About</h2>
          <p className="text-muted-foreground leading-relaxed">{learner.bio}</p>
        </div>
      )}

      {/* Skills */}
      {learner.skills && learner.skills.length > 0 && (
        <div className="rounded-xl border  bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {learner.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {learner.experience && learner.experience.length > 0 && (
        <div className="rounded-xl border  bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Experience</h2>
          <div className="space-y-4">
            {learner.experience.map((exp, index) => (
              <div key={index} className="rounded-xl border  p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                    <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{exp.role}</h3>
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {learner.education && learner.education.length > 0 && (
        <div className="rounded-xl border  bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Education</h2>
          <div className="space-y-4">
            {learner.education.map((edu, index) => (
              <div key={index} className="rounded-xl border  p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{edu.degree}</h3>
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Credentials */}
      <div className="rounded-xl border  bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Credentials</h2>
        {credentials.length > 0 ? (
          <div className="space-y-4">
            {credentials.map((credential) => (
              <div key={credential._id} className="rounded-xl border  p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Award className="h-5 w-5 text-emerald-600" />
                      <p className="font-semibold">{credential.title}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(credential.verificationStatus)}`}>
                        {credential.verificationStatus}
                      </span>
                    </div>
                    {credential.description && (
                      <p className="text-sm text-muted-foreground mb-2">{credential.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Issued by {credential.issuerId?.name || 'Unknown'}</span>
                      <span>•</span>
                      <span>{credential.credits} credits</span>
                      <span>•</span>
                      <span>NSQF Level {credential.nsqfLevel}</span>
                      <span>•</span>
                      <span>{new Date(credential.issueDate).toLocaleDateString()}</span>
                    </div>
                    {credential.skills && credential.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {credential.skills.map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    {credential.certificateUrl && (
                      <a
                        href={credential.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-muted text-muted-foreground rounded-xl hover:bg-muted/80 text-sm flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View
                      </a>
                    )}
                    {/* <button
                      onClick={() => handleVerifyCredential(credential._id)}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 text-sm"
                    >
                      Verify
                    </button> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No credentials available</p>
          </div>
        )}
      </div>

      {/* Member Since */}
      <div className="rounded-xl border  bg-card p-6">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Member since {new Date(learner.joinedAt).toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
