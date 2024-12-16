"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import GoogleIcon from "public/svgs/google-icon";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import Loader from "../components/ui/Loader";
import { z } from "zod";
import Input from "../components/ui/Input";
import { toast } from "react-toast";
export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
  });

  const t = useTranslations();
  const [formErrors, setFormErrors] = useState<Record<string, string>>();

  const formSchema = z.object({
    email: z.string().min(1,{message:t("Email is required")}).email({message:t("Email is invalid")}),
  });
  type FormData = z.infer<typeof formSchema>;
  function validate(): FormData | null {
    try {
      const validatedData = formSchema.parse(formData);
      return validatedData;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formErrors = error.errors;
        const newErrors: Record<string, string> = {};
        formErrors.forEach((error) => {
          let key = error.path[0] as string;
          newErrors[key] = newErrors[key]
            ? newErrors[key].concat(". ", error.message)
            : error.message;
        });
        setFormErrors(newErrors);
      }
      return null;
    }
  }

  const {mutate:signInGoogle, isPending:isLoadingGoogle, isError:googleAuthFailed, isSuccess:isGoogleAuthSuccess} = useMutation({
    mutationKey: ["signInWithGoogle"],
    mutationFn: async () => {
      toast.info(`${t("Please wait")}...`)
      await signIn("google",{
        callbackUrl: origin
      });
    },
  });


  const origin = window.location.origin
  const {mutate:signInMagicLink, isPending:isLoadingEmail, isError:emailSentFailed, isSuccess: isMagicLinkSuccess}  = useMutation({
    mutationKey: ["signInMagicLink"],
    mutationFn: async () => {
      toast.info(`${t("Please wait")}...`)
      await signIn("email", {
        //@ts-ignore
        email: formData.email,
        callbackUrl: origin
      });
    },
    onError: (err) => console.log(err),
    onSuccess: (data) => console.log(data)
  });

    if(!isLoadingEmail){
      if(emailSentFailed){
        toast.error(`${t("Failed to send magic link")}. ${t(`Please try again later`)}.`)
      }
    }

    if(!isLoadingGoogle && googleAuthFailed){
      if(googleAuthFailed){
        toast.error(`${t("Failed to perform Google auth")}. ${t(`Please try again later`)}.`)
      }

      if(isGoogleAuthSuccess){
        toast.success(t("Logged in successfully"))
      }
    }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = validate()
    if(data){
      signInMagicLink()
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
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
            <div onClick={() => isLoadingGoogle ? ()=>{} : signInGoogle()} className="w-full flex items-center justify-center px-4 py-3.5 border border-gray-700 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              {!isLoadingGoogle ? <><GoogleIcon />
              <p className="ml-3 font-semibold text-black"> {t(`Continue with Google`)}</p>
              </>:
              <Loader loading={isLoadingGoogle}/>}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-white text-gray-500">{t("or")}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <Input
                error={formErrors?.email}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t("Enter Your Email")}
                className="w-full px-3 py-3.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none  focus:border-gray-700"
              />

              <button
                type="submit"
                disabled={isLoadingEmail}
                className="mt-4 w-full flex justify-center py-3.5 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-black disabled:bg-gray-500"
              >
                {isLoadingEmail ? (
                 <Loader loading={isLoadingEmail}/>
                ) : (
                  t("Sign in with Email")
                )}
              </button>
            </form>
          </div>
        </>
      </div>
    </div>
  );
}
