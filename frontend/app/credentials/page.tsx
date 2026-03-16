"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CredentialCard } from "@/components/credential-card";
import { CredentialCardSkeleton } from "@/components/loading-skeleton";
import { Plus, Search, Filter } from "lucide-react";
import Link from "next/link";

const mockCredentials = [
  {
    id: "1",
    title: "Full Stack Web Development Certification",
    issuer: "Coursera",
    date: "Dec 2024",
    nsqfLevel: 6,
    skills: ["React", "Node.js", "MongoDB"],
    verified: true,
  },
  {
    id: "2",
    title: "Data Science Professional Certificate",
    issuer: "edX",
    date: "Nov 2024",
    nsqfLevel: 7,
    skills: ["Python", "Machine Learning", "Statistics"],
    verified: true,
  },
  {
    id: "3",
    title: "AWS Solutions Architect",
    issuer: "Amazon Web Services",
    date: "Oct 2024",
    nsqfLevel: 6,
    skills: ["AWS", "Cloud", "DevOps"],
    verified: false,
  },
];

export default function CredentialsPage() {
  const [loading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Credentials</h1>
          <p className="text-muted-foreground">Manage and share your achievements</p>
        </div>
        <Link href="/credentials/upload">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Credential
          </Button>
        </Link>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search credentials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <CredentialCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockCredentials.map((credential) => (
            <CredentialCard key={credential.id} {...credential} />
          ))}
        </div>
      )}
    </div>
  );
}
