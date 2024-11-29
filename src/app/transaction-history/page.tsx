"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import Ticket from "public/svgs/ticket";
import { useTranslations } from "next-intl";
import PaymentModal from "../components/payment/PaymentModal";
import { api } from "@/trpc/react";

interface Transaction {
  transactionId: number;
  ticketBalanceChange: number;
  type: string;
  description: string;
  createdAt: string;
}

interface UserData {
  userId: number;
  email: string;
  ticketCount: number;
}

export default function TicketTransactions() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const t = useTranslations();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUserEmail(localStorage.getItem("userEmail"));
  }, []);

  // Replace fetch with tRPC queries
  const { data: transactionData, isLoading } =
    api.ticket.getTransactionData.useQuery(
      { email: userEmail ?? "" },
      {
        enabled: !!userEmail,
        // onError: (err: Error) => {
        //   setError(err instanceof Error ? err.message : "Failed to load data");
        // },
      }
    );

  const transactions = transactionData?.transactions ?? [];
  const userData = transactionData?.user;

  const handleClickPaymentModal = () => {
    setShowPaymentModal(true);
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-blue-500 mx-2"></div>
        </div>
      </div>
    );
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="mt-6 ">
      <div className="mt-6 max-w-lg mx-auto px-4 rounded-lg">
        <div className="bg-white rounded-lg p-4">
          <div className="flex justify-between items-center m-2">
            <div className="flex items-center justify-center">
              <button onClick={handleClickPaymentModal}>
                <Ticket />
              </button>
              <h2 className="text-lg font-medium ml-2">{t("My ticket")}</h2>
            </div>
            <span className="text-lg">
              {userData?.ticketCount || 0} {t("Times")}
            </span>
          </div>
        </div>
      </div>
      <div className="bg-white mt-4 px-4">
        <div className="p-4  max-w-lg mx-auto mt-4">
          <h3 className="text-lg mb-4">{t("Usage details")}</h3>

          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.transactionId}
                className="flex justify-between items-center py-2 border-b-2 border-[#EAEBEF]"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {transaction.type === "PURCHASE" ? t("Charge") : t("Use")}
                  </span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(transaction.createdAt), "yyyy.MM.dd")}
                  </span>
                </div>
                <span
                  className={`text-sm font-medium ${
                    transaction.ticketBalanceChange > 0
                      ? "text-blue-500"
                      : "text-red-500"
                  }`}
                >
                  {transaction.ticketBalanceChange > 0 ? "+" : ""}
                  {transaction.ticketBalanceChange}
                  {t("Times")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
      />
    </div>
  );
}
