import express from "express";
import dotenv from "dotenv";
import firebaseAdmin from "firebase-admin";
import { verifyToken, clerkClient } from "@clerk/clerk-sdk-node";

import cors from "cors";

dotenv.config({ path: [".env.local"], debug: true });

const app = express();

const PORT = process.env.PORT;

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
);
// let clerk;
// try {
//   clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });
// } catch (error) {
//   console.log("Clerk Error " + error);
// }

try {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.applicationDefault(),
  });
  console.log("Firebase Admin initialized successfully.");
} catch (error) {
  console.error("Error initializing Firebase Admin:", error);
}

const database = firebaseAdmin.firestore();

app.post("/api/syncUser", async (req, res) => {
  const { sessionToken, cartID } = req.body;

  const verifiedTokken = await verifyToken(sessionToken, {
    jwtKey: process.env.CLERK_JWT_KEY,
    authorizedParties: [process.env.CLIENT_ORIGIN],
  });

  const userID = verifiedTokken.sub;
  const sessionID = verifiedTokken.sid;

  const user = await clerkClient.users.getUser(userID);
  const userEmail =
    user.primaryEmailAddress?.emailAddress ||
    user.emailAddresses?.[0]?.emailAddress ||
    null;

  console.log("User email:", userEmail);
  console.log("UserID:", userID, "SessionID:", sessionID);

  try {
    const result = await database.doc(`Users/${userID}`).set(
      {
        userID: userID,
        userEmail: userEmail,
        sessionID: sessionID,
        cartID: cartID,
        updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    console.log("User sync completed successfully");
    res.status(200).json({ success: true, userId: userID, email: userEmail });
  } catch (error) {
    console.error("Database write error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
