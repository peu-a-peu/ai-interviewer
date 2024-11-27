"use client";

import { useEffect, useState } from "react";

export default function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) {
  const [payments, setPayments] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  console.log("searchParams", searchParams);
  console.log("searchParams.orderId", searchParams.orderId);
  console.log("payments", payments);
  // console.log("payments.totalAmount", payments.totalAmount);

  useEffect(() => {
    debugger;
    const fetchPayments = async () => {
      try {
        const secretKey = process.env.NEXT_PUBLIC_TOSS_SECRET_KEY ?? "";
        const basicToken = Buffer.from(`${secretKey}:`, `utf-8`).toString(
          "base64"
        );

        const url = `https://api.tosspayments.com/v1/payments/orders/${searchParams.orderId}`;
        const res = await fetch(url, {
          headers: {
            Authorization: `Basic ${basicToken}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) {
          throw new Error(`API call failed with status: ${res.status}`);
        }

        const data = await res.json();
        setPayments(data);
      } catch (err) {
        setError("Failed to fetch payment details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [searchParams.orderId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>결제가 완료되었습니다</h1>
      <ul>
        <li>결제 상품 {payments.orderName}</li>
        <li>주문번호 {payments.orderId}</li>
        <li>결제금액 {payments.totalAmount}</li>
        <li>
          결제승인날짜{" "}
          {Intl.DateTimeFormat().format(new Date(payments.approvedAt))}
        </li>
      </ul>
    </div>
  );
}
