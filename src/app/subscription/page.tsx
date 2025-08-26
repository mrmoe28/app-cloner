'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckIcon, Loader2, Crown, Zap, Shield, Rocket, Star, Sparkles, ArrowRight } from 'lucide-react';
import { getStripe } from '@/lib/stripe-client';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/use-subscription';

const proFeatures = [
  { icon: Rocket, text: 'Unlimited app cloning projects', highlight: true },
  { icon: Zap, text: 'Advanced AI analysis with GPT-4 Vision', highlight: true },
  { icon: Crown, text: 'Priority code generation queue', highlight: false },
  { icon: Shield, text: 'Export to React, React Native, Flutter & more', highlight: false },
  { icon: Star, text: 'Premium 24/7 support', highlight: false },
  { icon: Sparkles, text: 'Early access to new features', highlight: false },
];

export default function SubscriptionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { isSubscribed, isLoading: subLoading } = useSubscription();

  useEffect(() => {
    if (!subLoading && isSubscribed) {
      router.push('/dashboard');
    }
  }, [isSubscribed, subLoading, router]);

  const handleSubscribe = async () => {
    if (!session?.user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to subscribe',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: 'Subscription failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white border-none px-4 py-1">
              Limited Time Offer
            </Badge>
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Transform Screenshots into Production-Ready Apps
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of developers who are building apps 10x faster with AI-powered code generation
            </p>
          </div>

          {/* Pricing Card */}
          <Card className="relative border-2 border-primary shadow-2xl max-w-xl mx-auto overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10" />
            
            <CardHeader className="relative text-center pb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 mb-4 mx-auto">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl mb-2">App Cloner Pro</CardTitle>
              <CardDescription className="text-lg">
                Full access to all features - No trial period
              </CardDescription>
              <div className="mt-6">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold">$29</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                  Save $100+ on your first project alone
                </p>
              </div>
            </CardHeader>

            <CardContent className="relative space-y-8 pb-8">
              {/* Features List */}
              <div className="space-y-4">
                {proFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div 
                      key={index} 
                      className={`flex items-start gap-3 ${feature.highlight ? 'font-semibold' : ''}`}
                    >
                      <div className={`mt-0.5 rounded-full p-1 ${feature.highlight ? 'bg-primary/10' : 'bg-muted'}`}>
                        <Icon className={`h-4 w-4 ${feature.highlight ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <span className="flex-1">{feature.text}</span>
                    </div>
                  );
                })}
              </div>

              {/* CTA Button */}
              <Button 
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg" 
                size="lg"
                onClick={handleSubscribe}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    Get Instant Access
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              {/* Trust Badges */}
              <div className="pt-6 border-t space-y-3 text-center">
                <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckIcon className="h-4 w-4 text-green-600" />
                    <span>Cancel Anytime</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Powered by Stripe • 256-bit SSL Encryption
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Testimonial or Value Prop */}
          <div className="mt-16 text-center">
            <p className="text-lg text-muted-foreground mb-4">
              "App Cloner saved us weeks of development time. We built our entire mobile app from mockups in just 2 days!"
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">— Sarah Chen, CTO at TechStart</span>
            </div>
          </div>

          {/* FAQ or Money Back */}
          <div className="mt-12 p-6 bg-muted/30 rounded-lg max-w-2xl mx-auto text-center">
            <h3 className="font-semibold mb-2">30-Day Money-Back Guarantee</h3>
            <p className="text-sm text-muted-foreground">
              Not satisfied? Get a full refund within 30 days, no questions asked. 
              We're confident you'll love App Cloner Pro.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}