'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, Award, MapPin, Briefcase, Bookmark, BookmarkCheck, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
    nsqfLevel: 'all',
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
      if (filters.nsqfLevel && filters.nsqfLevel !== 'all') params.append('nsqfLevel', filters.nsqfLevel);
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Search Talent</h1>
        <p className="text-muted-foreground">Find skilled learners for your organization</p>
      </div>

      {/* Search & Filters */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="skills">Skills</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="skills"
                  type="text"
                  value={filters.skills}
                  onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
                  placeholder="e.g., JavaScript, Python, Data Science"
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="nsqfLevel">NSQF Level</Label>
              <Select value={filters.nsqfLevel} onValueChange={(value) => setFilters({ ...filters, nsqfLevel: value })}>
                <SelectTrigger className="mt-2 rounded-xl">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                    <SelectItem key={level} value={level.toString()}>Level {level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                type="text"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                placeholder="City or region"
                className="mt-2 rounded-xl"
              />
            </div>
          </div>
          <div className="mt-4">
            <Button
              onClick={searchLearners}
              disabled={loading}
              className="rounded-xl"
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {learners.length} {learners.length === 1 ? 'Result' : 'Results'}
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Searching...</p>
          </div>
        ) : learners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learners.map((learner) => {
              const learnerId = learner.userId?._id || learner._id;
              const learnerName = learner.userId?.name || learner.name || 'Unknown';
              const learnerEmail = learner.userId?.email || learner.email || '';
              
              return (
                <Card key={learner._id} className="hover:shadow-md transition-shadow rounded-xl">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold">{learnerName}</h3>
                        <p className="text-sm text-muted-foreground">{learnerEmail}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBookmark(learnerId)}
                        className="p-2 rounded-xl"
                      >
                        {bookmarkedIds.has(learnerId) ? (
                          <BookmarkCheck className="w-4 h-4 text-primary" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Award className="w-4 h-4" />
                        <span>NSQF Level {learner.nsqfLevel} • {learner.totalCredits} credits</span>
                      </div>
                      {learner.experience && learner.experience.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Briefcase className="w-4 h-4" />
                          <span>{learner.experience.length} {learner.experience.length === 1 ? 'experience' : 'experiences'}</span>
                        </div>
                      )}
                    </div>

                    {learner.bio && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{learner.bio}</p>
                    )}

                    {learner.skills && learner.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {learner.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="rounded-xl">
                            {skill}
                          </Badge>
                        ))}
                        {learner.skills.length > 3 && (
                          <Badge variant="outline" className="rounded-xl">
                            +{learner.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <Button asChild className="w-full rounded-xl">
                      <Link href={`/employer/learners/${learnerId}`} className="flex items-center justify-center gap-2">
                        <Eye className="w-4 h-4" />
                        View Profile
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="rounded-xl">
            <CardContent className="text-center py-12">
              <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground">Try adjusting your search filters</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
