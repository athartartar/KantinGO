import { getApp, getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { env } from "../config/env";
import { AppError } from "./errors";

const stripQuotes = (value: string | undefined): string | undefined => {
  if (value === undefined) return undefined;
  return value.replace(/^"|"$/g, "");
};

const initializeFirebaseAdmin = () => {
  const clientEmail = stripQuotes(env.FIREBASE_CLIENT_EMAIL);
  const privateKey = stripQuotes(env.FIREBASE_PRIVATE_KEY);

  const opts: Record<string, unknown> = {
    projectId: env.FIREBASE_PROJECT_ID,
  };

  // Kredensial service account WAJIB untuk memverifikasi Firebase ID token
  if (!clientEmail || !privateKey) {
    throw new AppError(
      "FIREBASE_CLIENT_EMAIL dan FIREBASE_PRIVATE_KEY belum diisi di backend/.env",
      500
    );
  }

  opts["credential"] = cert({
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, "\n"),
  });

  if (!getApps().length) {
    initializeApp(opts);
  }
};

initializeFirebaseAdmin();

export const firebaseAdminAuth = getAuth(getApp());
