import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth,
  useUser,
} from "@clerk/clerk-react";
import { Link } from "react-router-dom";
//import { db } from "../firebase";
//import { collection, addDoc } from "firebase/firestore";
import { useEffect } from "react";
import { Footer, ReelsSection, CarouselSection } from "../components/layout";
import "../styles/pages/HomePage.css";

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
    <div className="container">
      <div className="newsline">Step into Winter 26 - 70% off Sale</div>

      <div className="hero">
        <div className="headline">
          Winter Sale
          <span>Now 70% OFF</span>
        </div>
        <div className="ctaBtn">SHOP NOW</div>
      </div>
      <CarouselSection title="New Arrivals" />
      <ReelsSection />

      <Footer />
    </div>
  );
}
