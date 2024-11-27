"use client";
import { useTranslations } from "next-intl";
import Button from "../ui/Button";
import { useState } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      const userEmail = localStorage.getItem("userEmail");

      if (!userEmail) {
        throw new Error("User email not found");
      }

      const response = await fetch("/api/use-ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
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
          {"One voucher is used."}
          <br />
          {"Would you like to conduct a mock interview?"}
        </h3>
        <div className="flex gap-4 justify-center">
          <Button onClick={onClose} variant="secondary">
            {"No"}
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-4 border-b-4 border-blue-500 mx-2"></div>
            ) : (
              "Yes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
