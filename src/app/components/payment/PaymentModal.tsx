import { useEffect, useState } from "react";
import Ticket from "public/svgs/ticket";
import { Modal } from "../modals/Modal";
import Button from "../ui/Button";
import { loadTossPayments } from "@tosspayments/payment-sdk";
import { ReactNode } from "react";
import { getUserLocale } from "@/app/services/locale";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { stripePromise } from "@/app/services/stripe";
import { STRIPE_PRICE_IDS } from "@/common/constants/stripe";
import OverlayLoader from "../ui/OverlayLoader";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PaymentTier {
  discount: ReactNode;
  price: number;
  originalPrice: number;
  interviews: number;
  priceId?:string;
}

export default function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
  const [locale, setLocale] = useState("en");
  const {data} = useSession()
  const [loading, setLoading] = useState(false)
  const email = data?.user.email || ""
  useEffect(() => {
    async function fetchLocale() {
      const userLocale = await getUserLocale();
      setLocale(userLocale);
    }
    fetchLocale().catch(console.error);
  }, []);

  const createStripeSession = api.payment.createStripeSession.useMutation({
    onSuccess:async (data)=>{
      const stripe = await stripePromise;
      if (stripe && data.sessionId) {
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
      }
    }
  })

  const paymentTiers: PaymentTier[] = [
    { price: 3000, originalPrice: 3000, interviews: 1, discount: "" },
    { price: 8000, originalPrice: 9000, interviews: 3, discount: "11" },
    { price: 15000, originalPrice: 18000, interviews: 6, discount: "17" },
    { price: 23000, originalPrice: 30000, interviews: 10, discount: "23" },
  ];

  const paymentTiersUsd: PaymentTier[] = [
    { price: 3, originalPrice: 3, interviews: 1, discount: "" },
    { price: 8, originalPrice: 9, interviews: 3, discount: "11" },
    { price: 15, originalPrice: 18, interviews: 6, discount: "17" },
    { price: 23, originalPrice: 30, interviews: 10, discount: "23" },
  ];
  const t = useTranslations();
  const handlePayment = async (tier: PaymentTier, index?:number) => {
    setLoading(true)
    try {
      if (locale === "ko") {
        const tossPayments = await loadTossPayments(
          process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? ""
        );
        setLoading(true)
        await tossPayments.requestPayment({
          amount: tier.price,
          customerEmail: email ?? undefined,
          orderId: Math.random().toString(36).slice(2),
          orderName: `Mock Interview ${tier.interviews}회`,
          successUrl: `${window.location.origin}/api/payments?email=${email}&interviews=${tier.interviews}`,
          failUrl: `${window.location.origin}/api/payments`,
          // _skipAuth: "FORCE_SUCCESS",
        });
        setLoading(false)
      } else {
        // Implement Stripe payment logic here
          createStripeSession.mutate({priceId: STRIPE_PRICE_IDS[index!] as string})
      }
    } catch (error) {
      console.error("Payment initialization failed:", error);
      setLoading(false)
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="relative w-full max-w-md mx-auto">
        <OverlayLoader loading={loading || createStripeSession.isPending} size="lg"/>
        <h2 className="text-2xl font-bold text-center mb-6">
          {t("Would you like to conduct a mock interview?")}
        </h2>
        <p className="text-center text-gray-600 mb-8">
          {t("Please purchase a ticket for the mock interview")}
        </p>

        <div className="space-y-4 ">
          {(locale=='ko' ? paymentTiers : paymentTiersUsd).map((tier, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 ">
                  <div className="flex items-center justify-center">
                    <Ticket />
                  </div>
                  <div className="flex leading-none items-start flex-col gap-1 ">
                    <p className="text-lg font-semibold flex items-center ">
                      {tier.price.toLocaleString()}
                    </p>
                    {tier.discount && (
                      <>
                        <p className="text-sm text-gray-500 line-through">
                          {tier.originalPrice.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {tier.discount}%{t("discount")}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex justify-center ml-4">
                  <Button
                    extraClasses="py-3 px-9 cursor-pointer"
                    onClick={() => handlePayment(tier, index)}
                  >
                    <p className="text-xs whitespace-nowrap">
                      {t("Mock Interview")} {tier.interviews} {t("Times")}
                    </p>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
