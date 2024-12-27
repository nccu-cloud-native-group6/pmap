import { useState, useRef, useCallback } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { Button } from '@nextui-org/react';

interface RecaptchaProps {
    onComplete: (success: boolean) => void;
}

export function Recaptcha({ onComplete }: RecaptchaProps) {
  const reCaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

  const [captcha, setCaptcha] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset the captcha safely
  const resetCaptcha = useCallback(() => {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
    }

    resetTimeoutRef.current = setTimeout(() => {
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
        setCaptcha(null); // Reset the state
        if (onComplete) {
          onComplete(false); // Reset success state in parent
        }
      }
    }, 1000); // Waiting 1 second to ensure proper execution
  }, []);

  // Handle manual reset logic if needed
  const handleCaptchaReset = useCallback(() => {
    resetCaptcha();
  }, [resetCaptcha]);

  const handleChange = (value: string | null) => {
    setCaptcha(value);
    if (onComplete) {
      onComplete(!!value); // Notify parent about success
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <ReCAPTCHA
        ref={(ref) => {
          recaptchaRef.current = ref;
        }}
        sitekey={reCaptchaSiteKey}
        onChange={handleChange}
      />
      {captcha && (
        <Button onClick={handleCaptchaReset} size="sm" style={{ marginLeft: '10px' }} color="primary">
          Reset Captcha
        </Button>
      )}
    </div>
  );
}
