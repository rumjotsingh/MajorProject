'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, Award, Briefcase, Eye, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { employerApi } from '@/lib/employer-api';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/hooks/use-toast';

interface BookmarkedLearner {
  _id: string;
  learnerId: {
    _id: string;
    name: string;
    email: string;
  };
  learnerProfile: {
    bio: string;
    skills: string[];
    nsqfLevel: number;
    totalCredits: number;
  };
  credentialCount: number;
  createdAt: string;
  notes?: string;
  tags?: string[];
  folder?: string;
}

export default function EmployerBookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkedLearner[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning' as 'danger' | 'warning' | 'success' | 'info',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const data = await employerApi.getBookmarks();
      setBookmarks(data.bookmarks || []);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      toast({
        title: "Error",
        description: "Failed to load bookmarks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (learnerId: string, learnerName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Bookmark',
      message: `Are you sure you want to remove ${learnerName} from your bookmarks?`,
      type: 'warning',
      onConfirm: async () => {
        try {
          await employerApi.removeBookmark(learnerId);
          await fetchBookmarks();
          setConfirmDialog({ ...confirmDialog, isOpen: false });
          toast({
            title: "Success",
            description: `${learnerName} removed from bookmarks`,
          });
        } catch (error) {
          console.error('Error removing bookmark:', error);
          toast({
            title: "Error",
            description: "Failed to remove bookmark",
            variant: "destructive",
          });
        }
      },
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bookmarked Candidates</h1>
        <p className="text-muted-foreground">Your saved talent for future reference</p>
      </div>

      {/* Bookmarks List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading bookmarks...</p>
        </div>
      ) : bookmarks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((bookmark) => {
            const learner = bookmark.learnerId;
            const profile = bookmark.learnerProfile;
            const learnerId = learner?._id;
            const learnerName = learner?.name || 'Unknown';
            const learnerEmail = learner?.email || '';
            
            if (!learner || !learnerId || !profile) return null;
            
            return (
              <Card key={bookmark._id} className="rounded-xl hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">{learnerName}</h3>
                      <p className="text-sm text-muted-foreground">{learnerEmail}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(learnerId, learnerName)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Award className="w-4 h-4 text-primary" />
                      <span>NSQF Level {profile.nsqfLevel || 0} • {profile.totalCredits || 0} credits</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Briefcase className="w-4 h-4 text-emerald-600" />
                      <span>{bookmark.credentialCount || 0} verified credentials</span>
                    </div>
                  </div>

                  {profile.bio && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{profile.bio}</p>
                  )}

                  {profile.skills && profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {profile.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="rounded-xl text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {profile.skills.length > 3 && (
                        <Badge variant="outline" className="rounded-xl text-xs">
                          +{profile.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {bookmark.notes && (
                    <div className="mb-4 p-3 bg-muted/50 rounded-xl">
                      <p className="text-xs text-muted-foreground mb-1">Notes:</p>
                      <p className="text-sm">{bookmark.notes}</p>
                    </div>
                  )}

                  {bookmark.tags && bookmark.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {bookmark.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="rounded-full text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <Button asChild className="w-full rounded-xl">
                    <Link href={`/employer/learners/${learnerId}`} className="flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4" />
                      View Profile
                    </Link>
                  </Button>

                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Bookmarked {new Date(bookmark.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="rounded-xl">
          <CardContent className="text-center py-12">
            <Bookmark className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No bookmarks yet</h3>
            <p className="text-muted-foreground mb-4">Start bookmarking candidates you're interested in</p>
            <Button asChild className="rounded-xl">
              <Link href="/employer/search">
                Search Talent
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        confirmText="Remove"
        cancelText="Cancel"
      />
    </div>
  );
}
