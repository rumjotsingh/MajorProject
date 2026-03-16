"use client";

import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const licenses = [
  {
    name: "Next.js",
    version: "14.2.5",
    license: "MIT",
    author: "Vercel",
  },
  {
    name: "React",
    version: "18.3.1",
    license: "MIT",
    author: "Meta",
  },
  {
    name: "Tailwind CSS",
    version: "3.4.4",
    license: "MIT",
    author: "Tailwind Labs",
  },
  {
    name: "Framer Motion",
    version: "11.0.3",
    license: "MIT",
    author: "Framer",
  },
  {
    name: "Radix UI",
    version: "Various",
    license: "MIT",
    author: "Radix UI",
  },
  {
    name: "Lucide Icons",
    version: "0.309.0",
    license: "ISC",
    author: "Lucide",
  },
];

export default function LicensesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNav />

      <main className="flex-1">
        <section className="container py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-4xl space-y-8"
          >
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
                Open Source Licenses
              </h1>
              <p className="text-muted-foreground text-lg">
                MicroCred is built with amazing open source software
              </p>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>MicroCred Platform</CardTitle>
                  <CardDescription>Our platform license</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">License:</span>
                      <span className="text-muted-foreground">Proprietary</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Copyright:</span>
                      <span className="text-muted-foreground">© 2026 MicroCred</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      All rights reserved. The MicroCred platform and its original content are
                      proprietary and protected by copyright laws.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div>
                <h2 className="text-2xl font-bold mb-4">Third-Party Licenses</h2>
                <p className="text-muted-foreground mb-6">
                  We use the following open source libraries and frameworks:
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  {licenses.map((lib, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">{lib.name}</CardTitle>
                          <CardDescription>v{lib.version}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">License:</span>
                              <span className="font-medium">{lib.license}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Author:</span>
                              <span className="font-medium">{lib.author}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle>MIT License</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Permission is hereby granted, free of charge, to any person obtaining a copy
                    of this software and associated documentation files (the "Software"), to deal
                    in the Software without restriction, including without limitation the rights
                    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                    copies of the Software, and to permit persons to whom the Software is
                    furnished to do so, subject to the following conditions:
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-4">
                    The above copyright notice and this permission notice shall be included in all
                    copies or substantial portions of the Software.
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
