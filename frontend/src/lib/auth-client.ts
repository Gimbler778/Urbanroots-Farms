import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:8000/api/auth"
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;
