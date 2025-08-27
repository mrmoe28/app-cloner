'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { HelpTooltip } from '@/components/onboarding/help-tooltip';
import { useToast } from '@/hooks/use-toast';
import { Code, Mail, ArrowRight, Sparkles, Users, Shield, Zap, Lock, Eye, EyeOff, Check } from 'lucide-react';
import { FaGithub, FaGoogle } from 'react-icons/fa';

export default function SignUpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!email || !password || !confirmPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: 'Error',
        description: 'Password must be at least 8 characters long.',
        variant: 'destructive',
      });
      return;
    }

    if (!acceptTerms) {
      toast({
        title: 'Error',
        description: 'Please accept the terms and conditions.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Call your API endpoint to create the user account
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create account');
      }

      // Auto sign in after successful signup
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        toast({
          title: 'Success!',
          description: 'Your account has been created successfully.',
        });
        router.push('/dashboard');
      } else {
        toast({
          title: 'Account created',
          description: 'Please sign in with your new account.',
        });
        router.push('/signin');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignUp = async (provider: 'google' | 'github') => {
    try {
      setIsLoading(true);
      await signIn(provider, { callbackUrl: '/dashboard' });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to sign up with ${provider}. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-indigo-50/50 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-indigo-950/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"></div>
      
      <div className="relative w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <Link href="/" className="inline-flex items-center space-x-2 group">
            <div className="relative">
              <Code className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse"></div>
            </div>
            <span className="font-bold text-xl text-brand-gradient">App Cloner</span>
          </Link>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
            <p className="text-muted-foreground">
              Start building amazing apps with AI-powered code generation
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full mx-auto flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground font-medium">Fast & Easy</p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 bg-green-100 rounded-full mx-auto flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground font-medium">Secure</p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 bg-blue-100 rounded-full mx-auto flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground font-medium">Join 5K+</p>
          </div>
        </div>

        {/* Sign Up Card */}
        <Card className="border-primary/10 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign up for free</CardTitle>
            <CardDescription className="text-center">
              Enter your email to create your account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Sign Up Form */}
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password (min. 8 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {password && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            i < passwordStrength()
                              ? passwordStrength() <= 2
                                ? 'bg-orange-500'
                                : 'bg-green-500'
                              : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {passwordStrength() === 0 && 'Very weak'}
                      {passwordStrength() === 1 && 'Weak'}
                      {passwordStrength() === 2 && 'Fair'}
                      {passwordStrength() === 3 && 'Good'}
                      {passwordStrength() === 4 && 'Strong'}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {confirmPassword && password && (
                  <p className={`text-xs flex items-center gap-1 ${
                    password === confirmPassword ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {password === confirmPassword ? (
                      <><Check className="w-3 h-3" /> Passwords match</>
                    ) : (
                      'Passwords do not match'
                    )}
                  </p>
                )}
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1"
                  required
                />
                <label htmlFor="terms" className="text-xs text-muted-foreground">
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button 
                type="submit" 
                className="w-full gap-2 h-11"
                disabled={isLoading || !email || !password || !confirmPassword || !acceptTerms}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Create account
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or sign up with</span>
              </div>
            </div>

            {/* Social Sign Up */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialSignUp('google')}
                disabled={isLoading}
                className="h-11"
              >
                <FaGoogle className="w-4 h-4 mr-2" />
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialSignUp('github')}
                disabled={isLoading}
                className="h-11"
              >
                <FaGithub className="w-4 h-4 mr-2" />
                GitHub
              </Button>
            </div>

            {/* What's Included */}
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground text-center mb-3">
                What&apos;s included in your free account:
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span>3 free AI code generations per month</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code className="w-3 h-3 text-accent" />
                  <span>Support for React, React Native & Flutter</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-3 h-3 text-green-600" />
                  <span>Secure project storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3 h-3 text-blue-600" />
                  <span>Community support & examples</span>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/signin" className="text-primary hover:underline font-medium">
              Sign in here
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}