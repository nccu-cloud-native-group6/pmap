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
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";

/* components */
import { FaGoogle, FaGithub } from "react-icons/fa";

/* types */
import "../../styles/globals.css";
import { useUser } from "../../contexts/UserContext";
import { AppUser } from "../../types/user";

export default function Login() {
  const { data: session } = useSession();
  const { setUser } = useUser();

  useEffect(() => {
    if (session?.user) {
      const appUser: AppUser = {
        id: "generated-id-12345", // TODO: Database ID
        name: session.user.name ?? "Unknown User",
        email: session.user.email ?? "Unknown Email",
        image: session.user.image ?? "/default-avatar.png",
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
      {!session ? (
        <Dropdown>
          <DropdownTrigger>
            <Avatar size="sm" showFallback style={{ cursor: "pointer" }} alt="Login Avatar" />
          </DropdownTrigger>
          <DropdownMenu aria-label="Sign in options">
            <DropdownItem key="google" onClick={() => signIn("google")} startContent={<FaGoogle />}>
              Sign in with Google
            </DropdownItem>
            <DropdownItem key="github" onClick={() => signIn("github")} startContent={<FaGithub />}>
              Sign in with GitHub
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      ) : (
        (
          <Popover>
            <PopoverTrigger>
              <Avatar
                src={session.user?.image || "/default-avatar.png"}
                alt="User Avatar"
                size="sm"
              />
            </PopoverTrigger>
            <PopoverContent>
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
                  src={session.user?.image || "/default-avatar.png"}
                  alt="User Avatar"
                  size="sm"
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
            </PopoverContent>
          </Popover>
        ))
      }
    </div>
  );
}
