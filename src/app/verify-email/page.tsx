"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/app/components/ui/Button";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { api } from "@/trpc/react";
import { signIn } from "next-auth/react";

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [error, setError] = useState("");
  const t = useTranslations();

  const verifyEmailMutation = api.emailVerification.verifyEmail.useMutation({
    onSuccess: async (data) => {
      setVerificationStatus("success");

      // Sign in the user
      const result = await signIn("credentials", {
        email: data.session.user.email,
        redirect: false,
      });

      if (result?.ok) {
        // Store session data
        localStorage.setItem(
          "emailVerificationToken",
          searchParams.get("token")!
        );
        localStorage.setItem("userEmail", data.session.user.email);
        localStorage.setItem("sessionExpires", data.session.expires);

        // Redirect after successful verification and login
        setTimeout(() => {
          router.push("/"); // or wherever you want to redirect
          router.refresh(); // Refresh to update authentication state
        }, 2000);
      } else {
        setError("Failed to sign in after verification");
        setVerificationStatus("error");
      }
    },
    onError: (error) => {
      setVerificationStatus("error");
      setError(error.message);
    },
  });

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setVerificationStatus("error");
      setError("No verification token found");
      return;
    }

    verifyEmailMutation.mutate({ token });
  }, [searchParams]);

  if (verificationStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-blue-500 mx-2"></div>
          <p className="mt-4 text-gray-600">{t("Verifying your email")}</p>
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
          {t("Email Verified Successfully")}
        </h2>
        <p className="text-green-600 mb-4">
          {t("Redirecting you to the homepage")}
        </p>
      </div>
    </div>
  );
}
