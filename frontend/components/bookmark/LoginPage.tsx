"use client";

import React from "react";
import { Card, Button } from "@nextui-org/react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { signIn } from "next-auth/react";

const LoginPage = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <Card className="p-6 w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-4">Access Restricted</h2>
        <p className="text-center mb-6">
          This is a feature available only to logged-in users. <br />
          Please log in to continue.
        </p>

        {/* Google and GitHub Sign-In Buttons */}
        <div className="flex flex-col gap-4">
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
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
