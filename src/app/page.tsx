import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpTooltip } from "@/components/onboarding/help-tooltip";
import { Code, Upload, Zap, Smartphone, Monitor, Globe, Brain, Sparkles, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-4 py-24 text-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-indigo-50/50 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-indigo-950/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" aria-hidden="true"></div>
        
        <div className="relative space-y-8 max-w-5xl animate-fade-in">
          <Badge variant="outline" className="mb-6 animate-scale-in delay-100 bg-white/80 backdrop-blur-sm border-primary/20">
            <Sparkles className="w-3 h-3 mr-1 text-primary" />
            AI-Powered Development
          </Badge>
          
          <h1 className="animate-slide-up delay-200 text-balance">
            Turn Screenshots into
            <span className="text-brand-gradient block mt-2">
              Full-Stack Apps
            </span>
          </h1>
          
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl leading-relaxed animate-slide-up delay-300">
            Upload a screenshot of any app interface and watch our AI transform it into production-ready code.
            Supports React, React Native, Flutter, and more.
          </p>
          
          <div className="flex flex-col gap-4 sm:flex-row justify-center animate-slide-up delay-400">
            <div className="upload-area relative flex justify-center">
              <Button asChild size="lg" className="gap-2 button-hover bg-primary hover:bg-primary/90">
                <Link href="/create">
                  <Upload className="w-4 h-4" />
                  Upload Screenshot
                </Link>
              </Button>
              <div className="absolute -top-2 -right-2">
                <HelpTooltip
                  content="Upload any app screenshot (PNG, JPG, or WebP) and our AI will analyze the interface to generate production-ready code. Supports mobile apps, web apps, and desktop applications."
                  title="Start Your Project"
                  type="tip"
                  position="top"
                />
              </div>
            </div>
            <Button asChild variant="outline" size="lg" className="gap-2 button-hover border-primary/20 hover:bg-primary/5">
              <Link href="/dashboard">
                <Code className="w-4 h-4" />
                View Examples
              </Link>
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-8 pt-8 animate-slide-up delay-500">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">Screenshots Processed</div>
            </div>
            <div className="w-px h-12 bg-border"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">50K+</div>
              <div className="text-sm text-muted-foreground">Lines of Code Generated</div>
            </div>
            <div className="w-px h-12 bg-border"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">99%</div>
              <div className="text-sm text-muted-foreground">Accuracy Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-balance mb-4">
              How It Works
            </h2>
            <p className="mt-4 text-muted-foreground md:text-lg max-w-2xl mx-auto">
              Transform your app ideas into reality in just three simple steps.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="text-center card-hover border-primary/10 animate-fade-in delay-100">
              <CardHeader>
                <div className="mx-auto bg-gradient-to-br from-blue-500/10 to-blue-600/20 rounded-2xl p-4 w-16 h-16 flex items-center justify-center mb-6 relative">
                  <Upload className="w-8 h-8 text-primary relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent rounded-2xl animate-pulse"></div>
                </div>
                <CardTitle className="text-xl mb-3">1. Upload Screenshot</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Drop your app screenshot or UI mockup. We support all common image formats with instant processing.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center card-hover border-primary/10 animate-fade-in delay-200">
              <CardHeader>
                <div className="mx-auto bg-gradient-to-br from-purple-500/10 to-purple-600/20 rounded-2xl p-4 w-16 h-16 flex items-center justify-center mb-6 relative">
                  <Brain className="w-8 h-8 text-accent relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent rounded-2xl animate-pulse delay-100"></div>
                </div>
                <CardTitle className="text-xl mb-3">2. AI Analysis</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Our advanced computer vision AI identifies components, layouts, and platform patterns with 99% accuracy.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center card-hover border-primary/10 animate-fade-in delay-300">
              <CardHeader>
                <div className="mx-auto bg-gradient-to-br from-green-500/10 to-green-600/20 rounded-2xl p-4 w-16 h-16 flex items-center justify-center mb-6 relative">
                  <Code className="w-8 h-8 text-green-600 relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent rounded-2xl animate-pulse delay-200"></div>
                </div>
                <CardTitle className="text-xl mb-3">3. Generate Code</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Get production-ready code with complete project structure, APIs, and database schemas in seconds.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section className="px-4 py-24 relative">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-balance mb-4">
              Support for All Platforms
            </h2>
            <p className="mt-4 text-muted-foreground md:text-lg max-w-2xl mx-auto">
              Generate code for any platform or framework you need with our intelligent detection system.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="text-center card-hover group border-primary/10 relative overflow-hidden">
              <CardContent className="pt-8 pb-6 relative z-10">
                <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2 text-lg">Web Apps</h3>
                <p className="text-sm text-muted-foreground">React, Vue, Angular, Svelte</p>
              </CardContent>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Card>

            <Card className="text-center card-hover group border-primary/10 relative overflow-hidden">
              <CardContent className="pt-8 pb-6 relative z-10">
                <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Smartphone className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2 text-lg">Mobile Apps</h3>
                <p className="text-sm text-muted-foreground">React Native, Flutter, Native</p>
              </CardContent>
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Card>

            <Card className="text-center card-hover group border-primary/10 relative overflow-hidden">
              <CardContent className="pt-8 pb-6 relative z-10">
                <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Monitor className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2 text-lg">Desktop Apps</h3>
                <p className="text-sm text-muted-foreground">Electron, Flutter Desktop</p>
              </CardContent>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Card>

            <Card className="text-center card-hover group border-primary/10 relative overflow-hidden">
              <CardContent className="pt-8 pb-6 relative z-10">
                <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold mb-2 text-lg">Full-Stack</h3>
                <p className="text-sm text-muted-foreground">API + Database + Frontend</p>
              </CardContent>
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-24 bg-brand-gradient relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" aria-hidden="true"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.05),transparent_50%)]" aria-hidden="true"></div>
        
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-balance mb-6">
              Ready to Clone Your First App?
            </h2>
            <p className="text-xl opacity-95 mb-10 leading-relaxed">
              Join thousands of developers who are building faster with AI-powered code generation.
              Start your free trial today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button asChild size="lg" variant="secondary" className="gap-2 button-hover bg-white text-primary hover:bg-white/90 min-w-48">
                <Link href="/create">
                  Get Started Now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="gap-2 button-hover text-white hover:bg-white/10 min-w-48">
                <Link href="/dashboard">
                  View Live Demo
                  <Code className="w-4 h-4" />
                </Link>
              </Button>
            </div>
            
            {/* Social Proof */}
            <div className="flex items-center justify-center gap-8 pt-8 border-t border-white/20">
              <div className="text-center">
                <div className="text-lg font-semibold">5,000+</div>
                <div className="text-sm opacity-80">Happy Developers</div>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <div className="text-lg font-semibold">100+</div>
                <div className="text-sm opacity-80">Companies Trust Us</div>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <div className="text-lg font-semibold">4.9/5</div>
                <div className="text-sm opacity-80">User Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
