export type FirebaseClientConfig = {
  apiKey: string;
  authDomain?: string;
  projectId: string;
};

export const firebaseConfig: FirebaseClientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
};

export const hasFirebaseConfig = () => {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
};
