'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

interface SignInButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export function SignInButton({ variant = 'default', size = 'default' }: SignInButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => signIn()}
      className="gap-2"
    >
      <LogIn className="h-4 w-4" />
      Sign In
    </Button>
  );
}