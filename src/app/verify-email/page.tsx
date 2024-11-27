"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/app/components/ui/Button";
import Link from "next/link";

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setVerificationStatus("error");
      setError("No verification token found");
      return;
    }

    const verifyEmail = async () => {
      try {
        debugger;
        const response = await fetch(`/api/verify-email?token=${token}`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Verification failed");
        }

        // Store session data in localStorage
        localStorage.setItem("emailVerificationToken", token);
        localStorage.setItem("userEmail", data.session.user.email);
        localStorage.setItem("sessionExpires", data.session.expires);

        setVerificationStatus("success");

        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } catch (err) {
        setVerificationStatus("error");
        setError(err instanceof Error ? err.message : "Verification failed");
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  if (verificationStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Verifying your email...</h2>
          {/* Add a loading spinner here if desired */}
        </div>
      </div>
    );
  }

  if (verificationStatus === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Verification Failed</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/login">
            <Button>Return to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">
          Email Verified Successfully!
        </h2>
        <p className="text-green-600 mb-4">
          Redirecting you to the homepage...
        </p>
      </div>
    </div>
  );
}
