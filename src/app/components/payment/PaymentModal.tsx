import { Modal } from "../modals/Modal";
import Button from "../ui/Button";
import { loadTossPayments } from "@tosspayments/payment-sdk";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  //   t: (key: string) => string;
}

interface PaymentTier {
  price: number;
  originalPrice: number;
  interviews: number;
}

export default function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
  const paymentTiers: PaymentTier[] = [
    { price: 3000, originalPrice: 7000, interviews: 1 },
    { price: 5000, originalPrice: 7000, interviews: 2 },
    { price: 10000, originalPrice: 15000, interviews: 4 },
    { price: 20000, originalPrice: 15000, interviews: 10 },
  ];

  const handlePayment = async (tier: PaymentTier) => {
    try {
      const tossPayments = await loadTossPayments(
        process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? ""
      );

      await tossPayments.requestPayment("카드", {
        amount: tier.price,
        orderId: Math.random().toString(36).slice(2),
        orderName: `Mock Interview ${tier.interviews}회`,
        successUrl: `${window.location.origin}/api/payments`,
        failUrl: `${window.location.origin}/api/payments/fail`,
      });
    } catch (error) {
      console.error("Payment initialization failed:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">
          {"Would you like to proceed with the mock interview?"}
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
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold">
                    ₩{tier.price.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 line-through">
                    ₩{tier.originalPrice.toLocaleString()}
                  </p>
                </div>
                <Button variant="secondary" onClick={() => handlePayment(tier)}>
                  {"Mock Interview"} {tier.interviews}
                  {"times"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
