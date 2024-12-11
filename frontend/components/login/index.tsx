"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import {
  Button,
  Avatar,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@nextui-org/react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import "../../styles/globals.css";

export default function Login() {
  const { data: session } = useSession();

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
        <Popover>
          <PopoverTrigger>
            <Avatar
              src={session.user?.image || "/default-avatar.png"}
              alt="User Avatar"
              size="md"
              radius="full"
              color="primary"
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
              <p style={{ fontSize: "0.875rem", fontWeight: "bold" }}>{session.user?.name}</p>
              <p style={{ fontSize: "0.75rem", color: "#666" }}>{session.user?.email}</p>
              <Button color="danger" size="sm" onClick={() => signOut()}>
                Logout
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
