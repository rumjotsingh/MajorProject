"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { BackToHome } from "@/components/back-to-home";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Eye, ArrowLeft, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const gradients = {
  "gradient-1": "from-blue-500 to-purple-500",
  "gradient-2": "from-purple-500 to-pink-500",
  "gradient-3": "from-pink-500 to-orange-500",
  "gradient-4": "from-orange-500 to-yellow-500",
  "gradient-5": "from-green-500 to-teal-500",
  "gradient-6": "from-teal-500 to-blue-500",
};

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.slug) {
      loadPost();
    }
  }, [params.slug]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/blog/${params.slug}`);
      setPost(response.data.post);
    } catch (error: any) {
      console.error("Failed to load blog post:", error);
      toast({
        title: "Error",
        description: "Blog post not found",
        variant: "destructive",
      });
      router.push("/blog");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Blog post link copied to clipboard",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <LandingNav />
        <BackToHome />
        <main className="flex-1 container py-12 max-w-4xl">
          <Skeleton className="h-64 w-full mb-8" />
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </main>
        <LandingFooter />
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <LandingNav />
      <BackToHome />

      <main className="flex-1">
        <article className="container py-12 max-w-4xl">
          {/* Back Button */}
          <Link href="/blog">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>

          {/* Cover Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`h-64 md:h-96 bg-gradient-to-br ${gradients[post.coverImage as keyof typeof gradients] || gradients["gradient-1"]} rounded-xl mb-8`}
          />

          {/* Post Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Badge className="mb-4">{post.category}</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
            <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-semibold text-primary">
                    {post.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{post.author}</p>
                  <p className="text-xs">Author</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.publishedAt || post.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{post.readTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{post.views} views</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </motion.div>

          {/* Post Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div 
                  className="prose prose-lg dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8"
            >
              <h3 className="text-sm font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: string, i: number) => (
                  <Badge key={i} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}
        </article>
      </main>

      <LandingFooter />
    </div>
  );
}
