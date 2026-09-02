"use client";

import { useSession } from "next-auth/react";
import { Session, User } from "next-auth";

interface CustomUser extends User {
  member_code: string;
}

interface CustomSession extends Session {
  user: CustomUser;
}

function useUserMemberCode(): string | null {
  const { data: session, status } = useSession();
  // Return null if session is not authenticated or data is null
  if (status !== "authenticated" || !session) {
    return null;
  }
  // Cast session to CustomSession since we know it's authenticated
  const customSession = session as CustomSession;
  const member_code = customSession.user.member_code;
  return member_code;
}

export default useUserMemberCode;
