'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckIcon, Loader2 } from 'lucide-react';
import { getStripe } from '@/lib/stripe-client';
import { useToast } from '@/hooks/use-toast';

const features = [
  'Unlimited app cloning projects',
  'Advanced AI analysis',
  'Priority code generation',
  'Export to multiple frameworks',
  'Premium support',
  'Early access to new features',
];

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Upgrade to Pro</h1>
          <p className="text-xl text-muted-foreground">
            Unlock unlimited app cloning and advanced features
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="text-2xl">Free</CardTitle>
              <CardDescription>Perfect for trying out app cloning</CardDescription>
              <div className="text-3xl font-bold">$0<span className="text-base font-normal">/month</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-5 w-5 text-green-500" />
                  <span>3 app cloning projects</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-5 w-5 text-green-500" />
                  <span>Basic AI analysis</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-5 w-5 text-green-500" />
                  <span>Standard code generation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-5 w-5 text-green-500" />
                  <span>Community support</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-primary">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Pro</CardTitle>
              <CardDescription>For serious app developers</CardDescription>
              <div className="text-3xl font-bold">$29<span className="text-base font-normal">/month</span></div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleSubscribe}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Upgrade to Pro'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Cancel anytime. No questions asked.</p>
          <p className="mt-2">Secure payment processing by Stripe</p>
        </div>
      </div>
    </div>
  );
}