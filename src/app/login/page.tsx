"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import GoogleIcon from "public/svgs/google-icon";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const t = useTranslations();

  const signInGoogle = useMutation({
    mutationKey: ["signInWithGoogle"],
    mutationFn: async () => {
      await signIn("google",{
        callbackUrl: origin
      });
    },
  });

  const origin = window.location.origin
  const signInMagicLink = useMutation({
    mutationKey: ["signInMagicLink"],
    mutationFn: async () => {
      await signIn("email", {
        //@ts-ignore
        email: formData.email,
        callbackUrl: origin
      });
    },
    onError: (err) => console.log(err),
    onSuccess: (data) => console.log(data)
  });




  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoadingGoogle(true);
    signInMagicLink.mutate()
    setIsLoadingGoogle(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };


  return (
    <div className="body-height flex items-center justify-center bg-white">
      <div className="max-w-md w-full space-y-6 p-8">
        <div className="text-center">
          <div className="h-14 w-full flex  justify-center items-center ">
            <Image
              src="/svgs/productLogo.svg"
              alt="logo"
              width={200}
              height={24}
            />
          </div>
        </div>
        <>
          <div className="text-center">
            <p className="mt-2 text-sm text-gray-600">
              {t(
                "Learned 40,000 interview questions Conduct a mock interview with an AI interviewer"
              )}
            </p>
          </div>
          <div className="space-y-4">
            <div onClick={() => signInGoogle.mutate()} className="w-full flex items-center justify-center px-4 py-3.5 border border-gray-700 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              <GoogleIcon />
              <p className="ml-3 font-semibold text-black"> Continue with Google</p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
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
                className="w-full px-3 py-3.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none  focus:border-gray-700"
                required
              />

              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={isLoadingGoogle}
                className="mt-4 w-full flex justify-center py-3.5 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-black "
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
        </>
      </div>
    </div>
  );
}
