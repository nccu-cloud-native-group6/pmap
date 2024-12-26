import React, { useState, useEffect } from "react";
import { Input, Button, Spacer } from "@nextui-org/react";
import { signIn } from "next-auth/react";
import ReCAPTCHA from "react-google-recaptcha";
import { EyeFilledIcon, EyeSlashFilledIcon } from "./icons";

const CredentialAuth = () => {
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
    const isUsernameValid = username.trim().length > 0; // 使用者名稱非空
    const isPasswordValid = password.length >= 0; // 密碼長度大於 0
    setIsFormValid(isUsernameValid && isPasswordValid && captchaCompleted);
  }, [username, password, captchaCompleted]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!isFormValid) {
      setError("Please ensure all fields are valid and complete the CAPTCHA.");
      return;
    }

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: username, // 使用 username
        password: password,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        console.log("Login successful", result);
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <form onSubmit={handleSubmit}>
      <Spacer y={2} />
      <Input
        isClearable
        fullWidth
        size="sm"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onClear={() => setUsername("")}
        aria-label="Username"
        required
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
        required  
      />
      <Spacer y={1.5} />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <ReCAPTCHA
          sitekey={siteKey} // 使用你的 v2 網站金鑰
          onChange={() => setCaptchaCompleted(true)} // 完成 CAPTCHA 時啟用按鈕
          onExpired={() => setCaptchaCompleted(false)} // CAPTCHA 過期時禁用按鈕
        />
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
      <Button
        type="submit"
        color="primary"
        fullWidth
        size="sm"
        isDisabled={!isFormValid} // 使用 isDisabled 控制按鈕狀態
      >
        Sign In or Sign Up
      </Button>
    </form>
  );
};

export default CredentialAuth;