"use client";
import { useTranslations } from "next-intl";

export default function VerifyEmail() {
  const t = useTranslations()
  return (
    <div className="body-height flex items-center justify-center">
      <div className="text-center text-black">
        <h2 className="text-xl font-semibold mb-4">
          {t("Please check your email")}
        </h2>
        <p className="text-lg mb-4">
          {t("We have sent an email to the address you provided. Please click the link in the email.")}
        </p>
      </div>
    </div>
  );
}
