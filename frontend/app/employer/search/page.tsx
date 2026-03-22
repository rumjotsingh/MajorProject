'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, Award, MapPin, Briefcase, Bookmark, BookmarkCheck, Eye } from 'lucide-react';
import { employerApi } from '@/lib/employer-api';

interface Learner {
  _id: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
  };
  name?: string;
  email?: string;
  bio: string;
  skills: string[];
  nsqfLevel: number;
  totalCredits: number;
  location?: string;
  experience?: any[];
  isBookmarked?: boolean;
}

export default function EmployerSearchPage() {
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    skills: '',
    nsqfLevel: '',
    location: '',
  });
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    searchLearners();
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const data = await employerApi.getBookmarks();
      const ids = new Set<string>(data.bookmarks.map((b: any) => b.learnerId._id as string));
      setBookmarkedIds(ids);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const searchLearners = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.skills) params.append('skills', filters.skills);
      if (filters.nsqfLevel) params.append('nsqfLevel', filters.nsqfLevel);
      if (filters.location) params.append('location', filters.location);

      const data = await employerApi.searchLearners(params);
      setLearners(data.learners || []);
    } catch (error) {
      console.error('Error searching learners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async (learnerId: string) => {
    try {
      if (bookmarkedIds.has(learnerId)) {
        await employerApi.removeBookmark(learnerId);
        setBookmarkedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(learnerId);
          return newSet;
        });
      } else {
        await employerApi.addBookmark(learnerId);
        setBookmarkedIds(prev => new Set(prev).add(learnerId));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Search Talent</h1>
          <p className="text-gray-600">Find skilled learners for your organization</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={filters.skills}
                  onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
                  placeholder="e.g., JavaScript, Python, Data Science"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">NSQF Level</label>
              <select
                value={filters.nsqfLevel}
                onChange={(e) => setFilters({ ...filters, nsqfLevel: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Levels</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                  <option key={level} value={level}>Level {level}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                placeholder="City or region"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={searchLearners}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Results */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {learners.length} {learners.length === 1 ? 'Result' : 'Results'}
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Searching...</p>
            </div>
          ) : learners.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {learners.map((learner) => {
                const learnerId = learner.userId?._id || learner._id;
                const learnerName = learner.userId?.name || learner.name || 'Unknown';
                const learnerEmail = learner.userId?.email || learner.email || '';
                
                return (
                  <div key={learner._id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">{learnerName}</h3>
                        <p className="text-sm text-gray-600">{learnerEmail}</p>
                      </div>
                      <button
                        onClick={() => handleBookmark(learnerId)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {bookmarkedIds.has(learnerId) ? (
                          <BookmarkCheck className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Bookmark className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Award className="w-4 h-4" />
                        <span>NSQF Level {learner.nsqfLevel} • {learner.totalCredits} credits</span>
                      </div>
                      {learner.experience && learner.experience.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Briefcase className="w-4 h-4" />
                          <span>{learner.experience.length} {learner.experience.length === 1 ? 'experience' : 'experiences'}</span>
                        </div>
                      )}
                    </div>

                    {learner.bio && (
                      <p className="text-sm text-gray-700 mb-4 line-clamp-2">{learner.bio}</p>
                    )}

                    {learner.skills && learner.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {learner.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {skill}
                          </span>
                        ))}
                        {learner.skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                            +{learner.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <Link href={`/employer/learners/${learnerId}`}>
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Eye className="w-4 h-4" />
                        View Profile
                      </button>
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600">Try adjusting your search filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
