"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Button from "../ui/Button";
import { useRouter } from "next/navigation";
import PaymentModal from "../payment/PaymentModal";
import Ticket from "public/svgs/ticket";
// import { useTranslations } from "next-intl";

export default function Navbar() {
  const [emailVerified, setEmailVerified] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const router = useRouter();
  // const t = useTranslations();

  useEffect(() => {
    const token = localStorage.getItem("emailVerificationToken");
    const email = localStorage.getItem("userEmail");
    const expires = localStorage.getItem("sessionExpires");

    if (token && email && expires) {
      // Check if session is still valid
      if (new Date(expires) > new Date()) {
        setEmailVerified(true);
        setUserEmail(email);
      } else {
        // Clear expired session
        handleLogout();
      }
    }
  }, []);

  const token = localStorage.getItem("emailVerificationToken");
  const handleLogout = () => {
    localStorage.removeItem("emailVerificationToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("sessionExpires");
    setEmailVerified(false);
    setUserEmail("");
  };

  const handlePaymentClick = () => {
    setShowPaymentModal(true);
  };

  return (
    <>
      <nav className="px-8 py-4 text-xl flex justify-between items-center">
        {!token ? (
          <>
            <Link href="/">
              <b>AI</b> Interviewer
            </Link>
            <Link href="/login">Login</Link>
          </>
        ) : (
          <>
            <Link href="/">
              <b>AI</b> Interviewer
            </Link>
            <div className="flex items-center gap-4">
              <button
                onClick={handlePaymentClick}
                className="hover:text-gray-900"
              >
                <Ticket />
              </button>

              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </>
        )}
      </nav>
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        // t={t}
      />
    </>
  );
}
