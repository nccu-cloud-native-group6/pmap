import React, { useState, useEffect } from "react";
import { Input, Button, Spacer } from "@nextui-org/react";
import { signIn } from "next-auth/react";
import { EyeFilledIcon, EyeSlashFilledIcon } from "./icons";
import { useUser } from "../../contexts/UserContext"; // 假設有 UserContext
import { Recaptcha } from "./recaptcha";

const CredentialAuth = () => {
  const { setUser } = useUser(); // 使用 setUser 更新用戶數據
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaCompleted, setCaptchaCompleted] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
  if (!siteKey) {
    console.error("Google reCAPTCHA site key is not defined!");
  }

  // 監聽表單有效性
  useEffect(() => {
    const isUsernameValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username); // Email 格式驗證
    const isPasswordValid = password.length >= 8; // 密碼至少 8 字元
    setIsFormValid(isUsernameValid && isPasswordValid && captchaCompleted);
  }, [username, password, captchaCompleted]);

  const handleSignIn = async () => {
    setError(null);

    if (!isFormValid) {
      setError("Please ensure all fields are valid and complete the CAPTCHA.");
      return;
    }

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: username,
        password: password,
        action: "signin", // 傳遞自定義操作
      });

      if (result?.error) {
        setError(result.error);
      } else {
        console.log("Sign In successful", result);
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  const handleSignUp = async () => {
    setError(null);

    if (!isFormValid) {
      setError("Please ensure all fields are valid and complete the CAPTCHA.");
      return;
    }

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: username,
        password: password,
        action: "signup", // 傳遞自定義操作
      });

      if (result?.error) {
        setError(result.error);
      } else {
        console.log("Sign Up successful", result);
      }
    } catch (error) {
      console.error("Error during sign-up:", error);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  const toggleVisibility = () => setIsVisible(!isVisible);

  const onCaptchaComplete = (success: boolean) => {
    setCaptchaCompleted(success);
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <Spacer y={2} />
      <Input
        type="email" // 改為 email 類型
        isClearable
        fullWidth
        size="sm"
        placeholder="Email Address"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onClear={() => setUsername("")}
        aria-label="Email"
        required
        errorMessage={
          username && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username)
            ? "Please enter a valid email address."
            : undefined
        }
      />
      <Spacer y={2} />
      <Input
        type={isVisible ? "text" : "password"}
        fullWidth
        size="sm"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        endContent={
          <button
            aria-label="toggle password visibility"
            onClick={toggleVisibility}
            type="button"
            className="focus:outline-none"
          >
            {isVisible ? <EyeSlashFilledIcon /> : <EyeFilledIcon />}
          </button>
        }
        aria-label="Password"
        isRequired
        errorMessage={
          password && password.length < 8
            ? "Password must be at least 8 characters."
            : undefined
        }
      />
      <Spacer y={1.5} />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Recaptcha onComplete={onCaptchaComplete} />
      </div>
      <Spacer y={0.5} />
      <p style={{ fontSize: "12px", textAlign: "center", color: "gray" }}>
        Please complete the CAPTCHA to proceed.
      </p>
      <Spacer y={1.5} />
      {error && (
        <div
          style={{ color: "red", textAlign: "center", marginBottom: "1rem" }}
        >
          {error}
        </div>
      )}
      <div style={{ display: "flex", gap: "1rem" }}>
        <Button
          type="button"
          color="primary"
          fullWidth
          size="sm"
          isDisabled={!isFormValid} // 使用 isDisabled 控制按鈕狀態
          onClick={handleSignIn}
        >
          Sign In
        </Button>
        <Button
          type="button"
          color="secondary"
          fullWidth
          size="sm"
          isDisabled={!isFormValid} // 使用 isDisabled 控制按鈕狀態
          onClick={handleSignUp}
        >
          Sign Up
        </Button>
      </div>
    </form>
  );
};

export default CredentialAuth;
