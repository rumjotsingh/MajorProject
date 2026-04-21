'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Upload, Image as ImageIcon, FileText, Calendar, Tag } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  coverImage: string;
  author: string;
  readTime: string;
  tags: string[];
  published: boolean;
  views: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

const categories = ['Technology', 'Career', 'Education', 'Trends', 'Business', 'Inspiration'];

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning' as 'danger' | 'warning' | 'success' | 'info',
  });
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'Technology',
    tags: '',
    published: false,
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/admin/blogs`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.blogs || []);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPost(null);
    setImageFile(null);
    setImagePreview('');
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: 'Technology',
      tags: '',
      published: false,
    });
    setDialogOpen(true);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setImageFile(null);
    setImagePreview(post.coverImage || '');
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      tags: post.tags?.join(', ') || '',
      published: post.published,
    });
    setDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const formDataToSend = new FormData();

      formDataToSend.append('title', formData.title);
      formDataToSend.append('excerpt', formData.excerpt);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('category', formData.category);
      formDataToSend.append(
        'tags',
        JSON.stringify(formData.tags.split(',').map((t) => t.trim()).filter((t) => t))
      );
      formDataToSend.append('published', formData.published.toString());

      if (imageFile) {
        formDataToSend.append('coverImage', imageFile);
      }

      const url = editingPost
        ? `${apiUrl}/admin/blogs/${editingPost._id}`
        : `${apiUrl}/admin/blogs`;

      const method = editingPost ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      if (response.ok) {
        alert(`Blog post ${editingPost ? 'updated' : 'created'} successfully`);
        setDialogOpen(false);
        loadPosts();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save blog post');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to save blog post');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Blog Post',
      message: 'Are you sure you want to delete this blog post? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
          const response = await fetch(`${apiUrl}/admin/blogs/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            loadPosts();
            setConfirmDialog({ ...confirmDialog, isOpen: false });
          }
        } catch (error: any) {
          alert('Failed to delete blog post');
        }
      },
    });
  };

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const action = post.published ? 'unpublish' : 'publish';
      const response = await fetch(
        `${apiUrl}/admin/blogs/${post._id}/${action}`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        loadPosts();
      }
    } catch (error: any) {
      alert('Failed to update blog post');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
          <p className="text-muted-foreground">Create and manage blog posts</p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          New Post
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border-[rgba(0,0,0,0.1)] bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{posts.length}</p>
              <p className="text-xs text-muted-foreground">Total Posts</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border-[rgba(0,0,0,0.1)] bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Eye className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{posts.filter(p => p.published).length}</p>
              <p className="text-xs text-muted-foreground">Published</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border-[rgba(0,0,0,0.1)] bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <FileText className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{posts.filter(p => !p.published).length}</p>
              <p className="text-xs text-muted-foreground">Drafts</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border-[rgba(0,0,0,0.1)] bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Eye className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{posts.reduce((sum, p) => sum + p.views, 0)}</p>
              <p className="text-xs text-muted-foreground">Total Views</p>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Posts Table */}
      <div className="rounded-xl border-[rgba(0,0,0,0.1)] bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading blog posts...</p>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium mb-2">No blog posts yet</p>
            <p className="text-sm text-muted-foreground mb-4">Create your first blog post to get started</p>
            <Button onClick={handleCreate} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr className="border-b border-[rgba(0,0,0,0.06)]">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Post
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(0,0,0,0.06)]">
                  {posts.map((post) => (
                    <tr key={post._id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm truncate">{post.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{post.excerpt}</p>
                            {post.tags && post.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {post.tags.slice(0, 2).map((tag, i) => (
                                  <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="text-xs">
                          {post.category}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleTogglePublish(post)}
                          className={`text-[10px] font-medium px-2 py-1 rounded-full transition-colors ${
                            post.published
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-200'
                          }`}
                        >
                          {post.published ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Eye className="h-3.5 w-3.5" />
                          <span>{post.views || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(post.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(post)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(post._id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Create/Edit Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter post title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image
                </label>
                <div className="space-y-2">
                  {imagePreview && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="cover-image"
                    />
                    <label htmlFor="cover-image">
                      <button
                        type="button"
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                        onClick={() => document.getElementById('cover-image')?.click()}
                      >
                        <ImageIcon className="h-4 w-4" />
                        {imagePreview ? 'Change Image' : 'Upload Image'}
                      </button>
                    </label>
                    <p className="text-xs text-gray-500">Upload a banner image for your blog post</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description (max 300 characters)"
                  maxLength={300}
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="Write your blog post content here. You can use simple HTML tags like <p>, <h2>, <strong>, <em>, <ul>, <li>, etc."
                  rows={12}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tip: Use HTML tags for formatting. Example: &lt;h2&gt;Heading&lt;/h2&gt;
                  &lt;p&gt;Paragraph&lt;/p&gt;
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., skills, career, technology"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="published" className="text-sm text-gray-700">
                  Publish immediately
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDialogOpen(false)}
                disabled={uploading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={uploading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Upload className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>{editingPost ? 'Update' : 'Create'} Post</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
