"use client";

import { useState, useEffect } from "react";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { BackToHome } from "@/components/back-to-home";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, Search, Filter, Eye } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

const gradients = {
  "gradient-1": "from-blue-500 to-purple-500",
  "gradient-2": "from-purple-500 to-pink-500",
  "gradient-3": "from-pink-500 to-orange-500",
  "gradient-4": "from-orange-500 to-yellow-500",
  "gradient-5": "from-green-500 to-teal-500",
  "gradient-6": "from-teal-500 to-blue-500",
};

const categories = ["All", "Technology", "Career", "Education", "Trends", "Business", "Inspiration"];

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadPosts();
  }, [selectedCategory, page]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '9',
      });
      
      if (selectedCategory !== "All") {
        params.append('category', selectedCategory);
      }
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      const response = await api.get(`/blog?${params.toString()}`);
      setPosts(response.data.posts || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error("Failed to load blog posts:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadPosts();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <LandingNav />
      <BackToHome />

      <main className="flex-1">
        <section className="container py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl text-center space-y-4 md:space-y-6 mb-12 md:mb-16 px-4"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tighter">
              Blog & <span className="text-primary">Insights</span>
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground">
              Stay updated with the latest trends in credential management, skill development, and career growth.
            </p>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto mb-12 px-4"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
            
            {/* Category Filter */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <Filter className="h-5 w-5 text-muted-foreground" />
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(category);
                    setPage(1);
                  }}
                >
                  {category}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Results Count */}
          {!loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="max-w-7xl mx-auto px-4 mb-6"
            >
              <p className="text-sm text-muted-foreground">
                Showing {posts.length} {posts.length === 1 ? "article" : "articles"}
              </p>
            </motion.div>
          )}

          {/* Blog Posts */}
          {loading ? (
            <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto px-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <Skeleton className="h-48 rounded-t-xl" />
                  <CardHeader>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto px-4">
              {posts.length > 0 ? (
                posts.map((post, i) => (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link href={`/blog/${post.slug}`}>
                      <Card className="h-full hover:shadow-lg transition-all cursor-pointer group">
                        <div className={`h-48 bg-gradient-to-br ${gradients[post.coverImage as keyof typeof gradients] || gradients["gradient-1"]} rounded-t-xl`} />
                        <CardHeader>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{post.category}</Badge>
                          </div>
                          <CardTitle className="group-hover:text-primary transition-colors">
                            {post.title}
                          </CardTitle>
                          <CardDescription>{post.excerpt}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{post.readTime}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">By {post.author}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Eye className="h-3 w-3" />
                              <span>{post.views}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-primary mt-3 group-hover:gap-3 transition-all">
                            <span className="text-sm font-medium">Read more</span>
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No articles found matching your search.</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant={page === p ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
