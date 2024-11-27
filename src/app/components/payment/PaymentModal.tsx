import { useEffect, useState } from "react";
import Ticket from "public/svgs/ticket";
import { Modal } from "../modals/Modal";
import Button from "../ui/Button";
import { loadTossPayments } from "@tosspayments/payment-sdk";
import { ReactNode } from "react";
import { getUserLocale } from "@/app/services/locale";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  //   t: (key: string) => string;
}

interface PaymentTier {
  discount: ReactNode;
  price: number;
  originalPrice: number;
  interviews: number;
}

export default function PaymentModal({
  isOpen,
  onClose,
  email,
}: PaymentModalProps) {
  const [locale, setLocale] = useState("en");

  useEffect(() => {
    async function fetchLocale() {
      const userLocale = await getUserLocale();
      setLocale(userLocale);
    }
    fetchLocale();
  }, []);

  const paymentTiers: PaymentTier[] = [
    { price: 3000, originalPrice: 3000, interviews: 1, discount: 0 },
    { price: 5000, originalPrice: 7000, interviews: 2, discount: 11 },
    { price: 10000, originalPrice: 15000, interviews: 4, discount: 17 },
    { price: 20000, originalPrice: 15000, interviews: 10, discount: 23 },
  ];

  const handlePayment = async (tier: PaymentTier) => {
    try {
      if (locale === "ko") {
        const tossPayments = await loadTossPayments(
          process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? ""
        );
        await tossPayments.requestPayment("카드", {
          amount: tier.price,
          customerEmail: email,
          orderId: Math.random().toString(36).slice(2),
          orderName: `Mock Interview ${tier.interviews}회`,
          successUrl: `${window.location.origin}/api/payments?email=${email}&interviews=${tier.interviews}`,
          failUrl: `${window.location.origin}/api/payments`,
          _skipAuth: "FORCE_SUCCESS",
        });
        console.log("successUrl", `${window.location.origin}/payment/complete`);
        console.log("failUrl", `${window.location.origin}/payment/`);
      } else {
        // Implement Stripe payment logic here
        console.log("stripe");
      }
    } catch (error) {
      console.error("Payment initialization failed:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">
          {"Would you like to conduct a mock interview?"}
        </h2>
        <p className="text-center text-gray-600 mb-8">
          {"Please select an interview package"}
        </p>

        <div className="space-y-4">
          {paymentTiers.map((tier, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 hover:border-black transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 ">
                  <div className="flex items-center justify-center">
                    <Ticket />
                  </div>
                  <div className="flex items-start flex-col gap-1 ">
                    <p className="text-lg font-semibold flex items-center ">
                      {tier.price.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 line-through">
                      {tier.originalPrice.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {tier.discount}% off
                    </p>
                  </div>
                </div>
                <div>
                  <Button onClick={() => handlePayment(tier)}>
                    {"Mock Interview"} {tier.interviews}
                    {"times"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p>support company</p>
      </div>
      <div className="flex justify-center">
        <Button onClick={onClose} style={{ width: "90%", marginTop: "1rem" }}>
          {"Conduct a mock interview"}
        </Button>
      </div>
    </Modal>
  );
}
