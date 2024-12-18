"use client";
import { useTranslations } from "next-intl";
import Button from "../ui/Button";
import { useState } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userId: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  userId
}: ConfirmModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations();

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/use-ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("API Error:", data);
        throw new Error(data.error || "Failed to use ticket");
      }

      onConfirm();
    } catch (error) {
      console.error("Error details:", error);
      alert("Failed to use ticket. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4 text-center">
          {t("One voucher is used")}
          <br />
          {t("Would you like to conduct a mock interview?")}
        </h3>
        <div className="flex gap-4 justify-center">
          <Button onClick={onClose} variant="secondary">
            {t("cancel")}
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-4 border-b-4 border-blue-500 mx-2"></div>
            ) : (
              t("Interview progress")
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
