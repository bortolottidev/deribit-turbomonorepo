"use client";

import {
  ClerkLoading,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { useEffect } from "react";
import { cleanSavedTracker } from "../equity-chart/actions";

export function ClerkButtonLogin(): JSX.Element {
  const { isSignedIn, isLoaded } = useUser();
  useEffect(() => {
    if (!isLoaded) {
      // wait
      return;
    }

    if (isSignedIn) {
      // load
      // fetchSavedTracker();
      return;
    }

    cleanSavedTracker();
  }, [isSignedIn, isLoaded]);

  return (
    <div>
      <ClerkLoading>
        <button>⌛</button>
      </ClerkLoading>
      <SignedOut>
        <SignInButton>
          <button>Sign in</button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
}
