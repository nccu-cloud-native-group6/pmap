"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@nextui-org/react";
import "../styles/globals.css";

export default function Login() {
  const { data: session } = useSession();

  return (
    <div>
      {!session ? (
        <Button
          color="primary"
          variant="flat"
          onClick={() => signIn("google")}
        >
          Login
        </Button>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <p style={{ fontSize: "0.875rem" }}>{session.user?.name}</p>
          <Button color="danger" variant="flat" onClick={() => signOut()}>
            Logout
          </Button>
        </div>
      )}
    </div>
  );
}