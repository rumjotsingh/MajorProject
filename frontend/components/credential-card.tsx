"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Calendar, Building2, Share2, Eye } from "lucide-react";
import { motion } from "framer-motion";

interface CredentialCardProps {
  title: string;
  issuer: string;
  date: string;
  nsqfLevel?: number;
  skills: string[];
  verified: boolean;
  onView?: () => void;
  onShare?: () => void;
}

export function CredentialCard({
  title,
  issuer,
  date,
  nsqfLevel,
  skills,
  verified,
  onView,
  onShare,
}: CredentialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <h3 className="font-semibold text-lg leading-tight">{title}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-3 w-3" />
                <span>{issuer}</span>
              </div>
            </div>
            <Badge variant={verified ? "success" : "warning"}>
              {verified ? "Verified" : "Pending"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{date}</span>
            </div>
            {nsqfLevel && (
              <div className="flex items-center gap-1">
                <Award className="h-3 w-3" />
                <span>NSQF Level {nsqfLevel}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <Badge key={i} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={onView}>
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={onShare}>
              <Share2 className="h-3 w-3 mr-1" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
