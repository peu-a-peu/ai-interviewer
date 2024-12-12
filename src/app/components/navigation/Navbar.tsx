"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Ticket from "public/svgs/ticket";
import ConfirmModal from "../form/ConfirmModal";
import { useTranslations } from "next-intl";
import { api } from "@/trpc/react";
import { setUserLocale } from "@/app/services/locale";
import ProductLogo from "public/svgs/productLogo";
import { useSession, signOut } from "next-auth/react";

interface UserData {
  userId: number;
  email: string;
  ticketCount: number;
}

export default function Navbar() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const pathname = usePathname();
  const t = useTranslations();
  const {data,status} = useSession()
  const isAuthenticated = status==='authenticated'
  useEffect(() => {
    const browserLocale = navigator.language || navigator.languages[0] || "en";
    setUserLocale(browserLocale);
  }, [pathname]);


  const handlePaymentClick = () => {
    router.push("/transaction-history");
  };

  const handleConfirm = () => {
    // Handle confirm logic here
  };

  return (
    <>
      <nav className="px-8 py-4 text-xl flex justify-between items-center">
        <Link href="/">
          <ProductLogo />
        </Link>
        {isAuthenticated ? (
          <>
            <div className="flex items-center gap-2 flex-row">
              <button
                onClick={handlePaymentClick}
                className="hover:text-gray-900"
              >
                <div className="flex items-center gap-2">
                  <Ticket />
                  {data?.user?.ticketCount}
                </div>
              </button>
              <div className=" h-6 border-r-2 border-[#DBDEE2]"></div>
              <button
                onClick={()=>signOut()}
                className="text-gray-600 hover:text-gray-900"
                type="button"
              >
                {t("Logout")}
              </button>
            </div>
          </>
        ) : (
          <>
            <button onClick={() => router.push("/login")}>{t("Login")}</button>
          </>
        )}
      </nav>
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirm}
        userId={data?.user.id||""}
      />
    </>
  );
}
