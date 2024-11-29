"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import GoogleIcon from "public/svgs/google-icon";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth(false); // Pass false to not require auth
  const [formData, setFormData] = useState({
    email: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const t = useTranslations();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const sendVerificationMutation =
    api.emailVerification.sendVerification.useMutation({
      onSuccess: () => {
        setSuccess(true);
      },
      onError: (error) => {
        setError(error.message);
      },
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoadingGoogle(true);

    try {
      await sendVerificationMutation.mutateAsync({
        email: formData.email,
        user: process.env.NEXT_PUBLIC_EMAIL_USER ?? "",
        pass: process.env.NEXT_PUBLIC_EMAIL_PASSWORD ?? "",
        redirectUrl: process.env.NEXT_PUBLIC_APP_URL ?? "",
      });
    } catch (err) {
      // Error handling is done in onError callback
    }
    setIsLoadingGoogle(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-md w-full space-y-6 p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">AI Interviewer</h2>
          <p className="mt-2 text-sm text-gray-600">
            {t("Please check your email")}
          </p>
          <p className="text-sm text-gray-600"></p>
        </div>

        {success ? (
          <div className="text-center text-green-600">
            <p>
              {t(
                "An email has been sent to the email address you entered Please click the link in the email"
              )}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              <GoogleIcon />
              <p className="ml-3"> Continue with Google</p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter Your Email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />

              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={isLoadingGoogle}
                className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black "
              >
                {isLoadingGoogle ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-4 border-b-4 border-blue-500"></div>
                  </>
                ) : (
                  "Sign in with Email"
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
