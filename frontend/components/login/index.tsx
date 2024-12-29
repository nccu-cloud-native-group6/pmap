"use client";

/* NextUI */
import { useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import {
  Button,
  Avatar,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@nextui-org/react";

/* components */
import { FaGoogle, FaGithub } from "react-icons/fa";

/* types */
import "../../styles/globals.css";
import { useUser } from "../../contexts/UserContext";
import { AppUser } from "../../types/user";

import CredentialAuth from "./credential";

export default function Login() {
  const { data: session } = useSession();
  const { setUser } = useUser();

  useEffect(() => {
    if (session?.user) {
      const appUser: AppUser = {
        id: (session.user as any).id ?? "Unknown ID",
        name: session.user.name ?? "Unknown User",
        email: session.user.email ?? "Unknown Email",
        image: session.user.image ?? "",
        access_token: (session.user as any).accessToken ?? "",
      };
      setUser(appUser); // 更新 UserContext
      console.log("Session updated:", appUser);
    }
  }, [session, setUser]);

  const handleLogout = async () => {
    await signOut();
    setUser(null); // 清除 UserContext 的 user 資訊
    console.log("Logout successfully");
  };

  return (
    <div className="flex items-center justify-end">
      <Popover>
        <PopoverTrigger>
          <Avatar
            src={session?.user?.image || ""}
            alt="User Avatar"
            classNames={{
              base: session ? "bg-gradient-to-br from-[#7A20A2] to-[#7A20A2]" : "",
            }}
            size="md"
            showFallback
            style={{ cursor: "pointer" }}
          />
        </PopoverTrigger>
        <PopoverContent>
          {!session ? (
            <div
              style={{
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <Button
                color="primary"
                size="sm"
                startContent={<FaGoogle />}
                onPress={() => signIn("google")}
              >
                Sign in with Google
              </Button>
              <Button
                color="secondary"
                size="sm"
                startContent={<FaGithub />}
                onPress={() => signIn("github")}
              >
                Sign in with GitHub
              </Button>
              <CredentialAuth />
            </div>
          ) : (
            <div
              style={{
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: "0.5rem",
              }}
            >
              <Avatar
                src={session.user?.image || ""}
                classNames={{
                  base: "bg-gradient-to-br from-[#7A20A2] to-[#7A20A2]",
                }}
                alt="User Avatar"
                size="lg"
              />
              <p style={{ fontSize: "0.875rem", fontWeight: "bold" }}>
                {session.user?.name}
              </p>
              <p style={{ fontSize: "0.75rem", color: "#666" }}>
                {session.user?.email}
              </p>
              <Button color="danger" size="sm" onClick={() => handleLogout()}>
                Logout
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}