import { initializeApp, cert, getApps, getApp, type AppOptions } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  console.warn("[firebase-admin] Missing service account env vars");
}

if (privateKey) {
  privateKey = privateKey.replace(/\\n/g, "\n");
}

const appOptions: AppOptions = projectId && clientEmail && privateKey
  ? {
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    }
  : {};

const app = getApps().length ? getApp() : initializeApp(appOptions);

export const messaging = getMessaging(app);
