'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, Award, Briefcase, Eye, Trash2 } from 'lucide-react';
import { employerApi } from '@/lib/employer-api';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface BookmarkedLearner {
  _id: string;
  learnerId: {
    _id: string;
    userId: {
      _id: string;
      name: string;
      email: string;
    };
    bio: string;
    skills: string[];
    nsqfLevel: number;
    totalCredits: number;
    experience?: any[];
  };
  createdAt: string;
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
          fetchBookmarks();
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        } catch (error) {
          console.error('Error removing bookmark:', error);
        }
      },
    });
  };

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookmarked Candidates</h1>
          <p className="text-gray-600">Your saved talent for future reference</p>
        </div>

        {/* Bookmarks List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading bookmarks...</p>
          </div>
        ) : bookmarks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((bookmark) => {
              const learner = bookmark.learnerId;
              const learnerId = learner?.userId?._id;
              const learnerName = learner?.userId?.name || 'Unknown';
              const learnerEmail = learner?.userId?.email || '';
              
              if (!learner || !learnerId) return null;
              
              return (
                <div key={bookmark._id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{learnerName}</h3>
                      <p className="text-sm text-gray-600">{learnerEmail}</p>
                    </div>
                    <button
                      onClick={() => handleRemove(learnerId, learnerName)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Award className="w-4 h-4" />
                      <span>NSQF Level {learner.nsqfLevel || 0} • {learner.totalCredits || 0} credits</span>
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

                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Bookmarked {new Date(bookmark.createdAt).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookmarks yet</h3>
            <p className="text-gray-600 mb-4">Start bookmarking candidates you're interested in</p>
            <Link href="/employer/search">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Search Talent
              </button>
            </Link>
          </div>
        )}
      </div>

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
