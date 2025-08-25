'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { SignInButton } from '@/components/auth/sign-in-button';
import { UserMenu } from '@/components/auth/user-menu';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import { Code, Upload, Menu, X, Sparkles } from 'lucide-react';

export function Navbar() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo/Brand */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Code className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
              <div className="absolute -top-1 -right-1 h-2 w-2 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse"></div>
            </div>
            <span className="font-bold text-lg text-brand-gradient">App Cloner</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="/dashboard"
            className="text-sm font-medium transition-all duration-200 hover:text-primary hover:scale-105 relative group"
          >
            Dashboard
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
          </Link>
          <Link
            href="/create"
            className="text-sm font-medium transition-all duration-200 hover:text-primary hover:scale-105 relative group"
          >
            New Project
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
          </Link>
          
          {session?.user && (
            <Button asChild variant="outline" size="sm" className="gap-2 button-hover border-primary/20 hover:bg-primary/5">
              <Link href="/create">
                <Upload className="h-4 w-4" />
                Upload Screenshot
              </Link>
            </Button>
          )}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center space-x-2">
          <ThemeToggle />
          {status === 'loading' ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : session?.user ? (
            <UserMenu />
          ) : (
            <SignInButton />
          )}
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden items-center space-x-2">
          {/* Theme Toggle for Mobile */}
          <ThemeToggle />
          
          {/* Quick Upload Button for Mobile */}
          {session?.user && (
            <Button asChild variant="ghost" size="sm" className="p-2">
              <Link href="/create">
                <Upload className="h-5 w-5" />
              </Link>
            </Button>
          )}
          
          {/* Auth for Mobile */}
          {status === 'loading' ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : session?.user ? (
            <UserMenu />
          ) : (
            <SignInButton />
          )}

          {/* Mobile Menu Trigger */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>

        {/* Mobile Menu Overlay */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Mobile Menu Panel */}
            <div className="fixed top-16 right-0 z-50 h-[calc(100vh-4rem)] w-80 bg-background border-l shadow-lg md:hidden">
              <div className="flex flex-col h-full">
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between p-6 border-b">
                  <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                    <Code className="h-6 w-6 text-primary" />
                    <span className="font-bold text-lg text-brand-gradient">App Cloner</span>
                  </Link>
                </div>

                {/* Mobile Navigation Links */}
                <nav className="flex flex-col p-6 space-y-6">
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-3 text-lg font-medium transition-colors hover:text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="w-2 h-2 bg-primary/30 rounded-full"></div>
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/create"
                    className="flex items-center space-x-3 text-lg font-medium transition-colors hover:text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="w-2 h-2 bg-accent/30 rounded-full"></div>
                    <span>New Project</span>
                  </Link>
                  
                  {session?.user && (
                    <div className="border-t pt-6">
                      <Button asChild className="w-full gap-2 button-hover">
                        <Link href="/create" onClick={() => setIsOpen(false)}>
                          <Upload className="h-4 w-4" />
                          Upload Screenshot
                        </Link>
                      </Button>
                    </div>
                  )}
                </nav>

                {/* Mobile Menu Footer */}
                <div className="mt-auto p-6 border-t bg-muted/30">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>AI-Powered Development</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}