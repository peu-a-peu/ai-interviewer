"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Button from "../ui/Button";
import { useRouter } from "next/navigation";
import PaymentModal from "../payment/PaymentModal";
import Ticket from "public/svgs/ticket";
import ConfirmModal from "../form/ConfirmModal";

export default function Navbar() {
  const [emailVerified, setEmailVerified] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  // const t = useTranslations();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("emailVerificationToken");
    const email = localStorage.getItem("userEmail");
    const expires = localStorage.getItem("sessionExpires");

    if (token && email && expires && new Date(expires) > new Date()) {
      setEmailVerified(true);
      setUserEmail(email);
    } else {
      handleLogout();
    }
  }, []);

  useEffect(() => {
    if (emailVerified && userEmail) {
      fetchUserData(userEmail);
    }
  }, [emailVerified, userEmail]);

  const fetchUserData = async (email: string) => {
    try {
      const response = await fetch("/api/user-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await response.json();
      console.log("User data:", userData);
      setUserData(userData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleLogout = (event?: React.MouseEvent<HTMLButtonElement>) => {
    localStorage.removeItem("emailVerificationToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("sessionExpires");
    setEmailVerified(false);
    setUserEmail("");
  };

  const handlePaymentClick = () => {
    setShowPaymentModal(true);
  };

  const handleConfirm = () => {
    // Handle confirm logic here
  };

  return (
    <>
      <nav className="px-8 py-4 text-xl flex justify-between items-center">
        {!emailVerified ? (
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
            <div className="flex items-center gap-4 flex-row">
              <button
                onClick={handlePaymentClick}
                className="hover:text-gray-900"
              >
                <div className="flex items-center gap-2">
                  <Ticket />
                  {userData?.ticketCount}
                </div>
              </button>

              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
                type="button"
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
        email={userEmail}
        // t={t}
      />
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirm}
        userEmail={userEmail}
      />
    </>
  );
}
