"use client";

import {
  ClerkLoading,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { cleanSavedTracker } from "../equity-chart/actions";

export function ClerkButtonLogin(): JSX.Element {
  const { isSignedIn, isLoaded } = useUser();
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
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

  const renderWaitButton = () => <button>⌛</button>;

  return isClient ? (
    <div>
      <ClerkLoading>{renderWaitButton()}</ClerkLoading>
      <SignedOut>
        <SignInButton>
          <button>Sign in</button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  ) : (
    renderWaitButton()
  );
}
