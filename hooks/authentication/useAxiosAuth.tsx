"use client";

import { Session, User } from "next-auth";
import { useSession } from "next-auth/react";

interface CustomUser extends User {
  token?: string;
}

interface CustomSession extends Session {
  user?: CustomUser;
}

function useAxiosAuth() {
  const { data: session } = useSession() as { data: CustomSession };

  const tokens = session?.user?.token;

  const authenticationHeader = {
    headers: {
      Authorization: tokens ? "Token " + tokens : "",
      "Content-Type": "multipart/form-data",
    },
  };

  return authenticationHeader;
}

export default useAxiosAuth;
