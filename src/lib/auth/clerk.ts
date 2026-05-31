import { auth, currentUser } from "@clerk/nextjs/server";
import { hasClerk } from "@/lib/env";

export const getClerkUserId = async (): Promise<string | null> => {
  if (!hasClerk) return null;
  const { userId } = await auth();
  return userId;
};

export const getClerkUser = async () => {
  if (!hasClerk) return null;
  return currentUser();
};
