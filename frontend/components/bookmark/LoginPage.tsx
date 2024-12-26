"use client";

import React from "react";
import { Button } from "@nextui-org/react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { signIn } from "next-auth/react";
import CredentialAuth from "../login/credential";

const LoginPage = ({ isInModal }: { isInModal?: boolean }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center ${
        isInModal ? "w-full" : "h-screen"
      }`}
      style={{ padding: isInModal ? "1rem" : "0" }}
    >
      <div className="flex flex-col items-center justify-center w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6">Access Restricted</h2>
        <p className="text-center mb-10 px-4">
          This is a feature available only to logged-in users. <br />
          Please log in to continue.
        </p>

        {/* Google and GitHub Sign-In Buttons */}
        <div className="flex flex-col gap-4 w-full">
          <Button
            color="primary"
            fullWidth
            startContent={<FaGoogle />}
            onPress={() => signIn("google")}
          >
            Sign in with Google
          </Button>
          <Button
            color="secondary"
            fullWidth
            startContent={<FaGithub />}
            onPress={() => signIn("github")}
          >
            Sign in with GitHub
          </Button>
          <p style={{ textAlign: "center" }}>Or use username and password:</p>
          <CredentialAuth />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
