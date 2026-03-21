'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Award, Briefcase, GraduationCap, Mail, MapPin, Bookmark, BookmarkCheck, Shield } from 'lucide-react';
import { employerApi } from '@/lib/employer-api';

interface LearnerProfile {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  bio: string;
  skills: string[];
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    current: boolean;
  }>;
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  totalCredits: number;
  nsqfLevel: number;
  location?: string;
}

interface Credential {
  _id: string;
  title: string;
  description: string;
  skills: string[];
  credits: number;
  verificationStatus: string;
  issuerId: {
    name: string;
  };
  issueDate: string;
  credentialUrl?: string;
}

export default function EmployerLearnerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const learnerId = params.id as string;

  const [learner, setLearner] = useState<LearnerProfile | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    fetchLearnerDetails();
    checkBookmarkStatus();
  }, [learnerId]);

  const fetchLearnerDetails = async () => {
    try {
      setLoading(true);
      const data = await employerApi.getLearnerDetails(learnerId);
      setLearner(data.profile);
      setCredentials(data.credentials || []);
    } catch (error) {
      console.error('Error fetching learner details:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkBookmarkStatus = async () => {
    try {
      const data = await employerApi.getBookmarks();
      const bookmarked = data.bookmarks.some((b: any) => b.learnerId.userId._id === learnerId);
      setIsBookmarked(bookmarked);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const handleBookmark = async () => {
    try {
      if (isBookmarked) {
        await employerApi.removeBookmark(learnerId);
        setIsBookmarked(false);
      } else {
        await employerApi.addBookmark(learnerId);
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleVerifyCredential = async (credentialId: string) => {
    try {
      await employerApi.verifyCredential(credentialId);
      alert('Credential verification requested');
    } catch (error) {
      console.error('Error verifying credential:', error);
      alert('Failed to verify credential');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading learner profile...</p>
        </div>
      </div>
    );
  }

  if (!learner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Learner not found</p>
          <button
            onClick={() => router.push('/employer/search')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{learner.userId.name}</h1>
              <p className="text-gray-600">{learner.userId.email}</p>
            </div>
          </div>
          <button
            onClick={handleBookmark}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isBookmarked
                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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

        {/* Overview Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">NSQF Level</p>
                <p className="text-xl font-bold text-gray-900">Level {learner.nsqfLevel}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Credits</p>
                <p className="text-xl font-bold text-gray-900">{learner.totalCredits}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Credentials</p>
                <p className="text-xl font-bold text-gray-900">{credentials.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {learner.bio && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
            <p className="text-gray-700 leading-relaxed">{learner.bio}</p>
          </div>
        )}

        {/* Skills */}
        {learner.skills && learner.skills.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {learner.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {learner.experience && learner.experience.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Experience</h2>
            <div className="space-y-4">
              {learner.experience.map((exp, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Briefcase className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                      <p className="text-gray-700">{exp.company}</p>
                      {exp.description && (
                        <p className="text-sm text-gray-600 mt-2">{exp.description}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-2">
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {learner.education && learner.education.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Education</h2>
            <div className="space-y-4">
              {learner.education.map((edu, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                      <p className="text-gray-700">{edu.institution}</p>
                      {edu.field && <p className="text-sm text-gray-600">{edu.field}</p>}
                      <p className="text-sm text-gray-500 mt-2">
                        {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Credentials */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Credentials</h2>
          {credentials.length > 0 ? (
            <div className="space-y-4">
              {credentials.map((credential) => (
                <div key={credential._id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Award className="w-5 h-5 text-green-600" />
                        <h3 className="font-semibold text-gray-900">{credential.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          credential.verificationStatus === 'verified'
                            ? 'bg-green-100 text-green-800'
                            : credential.verificationStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {credential.verificationStatus}
                        </span>
                      </div>
                      {credential.description && (
                        <p className="text-sm text-gray-700 mb-2">{credential.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Issued by {credential.issuerId?.name || 'Unknown'}</span>
                        <span>•</span>
                        <span>{credential.credits} credits</span>
                        <span>•</span>
                        <span>{new Date(credential.issueDate).toLocaleDateString()}</span>
                      </div>
                      {credential.skills && credential.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {credential.skills.map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleVerifyCredential(credential._id)}
                      className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No credentials available</p>
          )}
        </div>
      </div>
    </div>
  );
}
