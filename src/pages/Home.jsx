import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth,
  useUser,
} from "@clerk/clerk-react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useEffect } from "react";

async function addUser(User, cart) {
  try {
    const docReference = await addDoc(collection(db, "User"), {
      userID: User.userId,
      userEmail: User.email,
      cartID: cart && cart.cartId ? cart.cartId : null,
    });
    console.log(
      `The New User has been added to the collection: ${docReference.id}`
    );
  } catch (error) {
    console.log(error);
  }
}

export default function HomePage() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (!isSignedIn || !user) return;

    const clerkUser = {
      userId: user.id,
      email:
        user.primaryEmailAddress?.emailAddress ||
        user.emailAddresses?.[0]?.emailAddress ||
        null,
    };
    const cart = null;
    addUser(clerkUser, cart);
  }, [isSignedIn, user]);
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
    </>
  );
}
