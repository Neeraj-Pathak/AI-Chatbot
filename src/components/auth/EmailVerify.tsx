import { useEffect, useState } from "react";
import { nhost } from "@/components/auth/AuthProvider"; 
const EmailVerify = () => {
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    nhost.auth
      .refreshSession()
      .then(() => setStatus("✅ Email verified successfully!"))
      .catch(() => setStatus("❌ Invalid or expired verification link"));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>{status}</p>
    </div>
  );
};

export default EmailVerify;
