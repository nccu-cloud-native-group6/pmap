"use client";

import React from "react";
import { Button } from "@nextui-org/react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { signIn } from "next-auth/react";
import CredentialAuth from "../login/credential";

const LoginPage = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-center h-full w-full shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-6">Access Restricted</h2>
        <p className="text-center mb-10 px-4">
          This is a feature available only to logged-in users. <br />
          Please log in to continue.
        </p>

        {/* Google and GitHub Sign-In Buttons */}
        <div className="flex flex-col gap-4 w-4/5 max-w-sm">
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
          <p style={{ textAlign: 'center'}}>Or Login</p>
          <CredentialAuth />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
