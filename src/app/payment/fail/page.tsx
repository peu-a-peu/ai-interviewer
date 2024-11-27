"use client";
import React, { useEffect, useState } from "react";

const PaymentFail = () => {
  const [params, setParams] = useState({ code: "", message: "", orderId: "" });

  useEffect(() => {
    debugger;
    console.log("params", params);

    const searchParams = new URLSearchParams(window.location.search);
    setParams({
      code: searchParams.get("code") || "",
      message: searchParams.get("message") || "",
      orderId: searchParams.get("orderId") || "",
    });
  }, []);

  console.log("params", params);
  console.log(
    "decodeURIComponent(params.message)",
    decodeURIComponent(params.message)
  );
  console.log("code", params.code);
  console.log("orderId", params.orderId);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Payment Failed</h1>
      {params.code && <p className="mb-2">Error Code: {params.code}</p>}
      {params.message && (
        <p className="mb-2">Message: {decodeURIComponent(params.message)}</p>
      )}
      {params.orderId && <p className="mb-2">Order ID: {params.orderId}</p>}
      <button
        onClick={() => (window.location.href = "/")}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Return to Home
      </button>
    </div>
  );
};

export default PaymentFail;
