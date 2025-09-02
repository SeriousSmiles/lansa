import React from 'react';
import { 
  SignedIn, 
  SignedOut, 
  SignInButton, 
  SignUpButton, 
  UserButton 
} from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { OrganizationSwitcher } from '@/components/organization/OrganizationSwitcher';

export function ClerkAuthButtons() {
  return (
    <div className="flex items-center gap-4">
      <SignedOut>
        <div className="flex items-center gap-2">
          <SignInButton mode="modal">
            <Button variant="outline">Sign In</Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button>Sign Up</Button>
          </SignUpButton>
        </div>
      </SignedOut>
      
      <SignedIn>
        <div className="flex items-center gap-4">
          <OrganizationSwitcher />
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-8 w-8"
              }
            }}
          />
        </div>
      </SignedIn>
    </div>
  );
}