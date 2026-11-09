import { getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { env } from "../config/env";

if (!getApps().length) {
  initializeApp({
    projectId: env.FIREBASE_PROJECT_ID || "kantingo-d4eb1",
  });
}

export const firebaseAdminAuth = getAuth(getApp());
