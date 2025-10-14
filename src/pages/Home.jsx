import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth,
  useUser,
} from "@clerk/clerk-react";
//import { db } from "../firebase";
//import { collection, addDoc } from "firebase/firestore";
import { useEffect } from "react";
import ProductDemo from "../components/ProductDemo";

async function syncUserToServer(sessionToken, cartID) {
  try {
    console.log("Sending request to server...");
    const res = await fetch("http://localhost:3001/api/syncUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ sessionToken, cartID }),
    });

    if (!res.ok) {
      console.error("Server error:", res.status, await res.text());
      return;
    }

    const data = await res.json();
    console.log("User sync successful:", data);
  } catch (error) {
    console.error("Network error:", error);
  }
}

export default function HomePage() {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (!isSignedIn || !user) return;

    (async () => {
      try {
        console.log("Getting JWT token...");
        const token = await getToken();
        if (!token) {
          console.warn("NO Token is Available");
          return;
        }
        console.log("Token obtained, syncing user...");
        const cartID = null;
        await syncUserToServer(token, cartID);
      } catch (error) {
        console.log("Clerk Token Not Found! Reason: " + error);
      }
    })();
  }, [isSignedIn, user, getToken]);
  return (
    <>
      <header>
        <SignedIn>
          <UserButton></UserButton>
        </SignedIn>
        <SignedOut>
          <SignInButton></SignInButton>
        </SignedOut>
      </header>

      <main>
        <SignedIn>
          <ProductDemo />
        </SignedIn>
      </main>
    </>
  );
}
