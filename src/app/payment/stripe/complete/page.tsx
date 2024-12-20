"use client";

import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toast";

export default function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) {

  const {data, error, mutate, isPending} = api.payment.getStripeSession.useMutation()
  const {update} = useSession()
  if(error){
    toast.error(error.message)
  }

  if(!isPending && !error && data && data.paymentStatus==='paid'){
    update()
  }
  const sessionId = searchParams.session_id

  async function callApi(sessionId:string){
    await mutate({sessionId})
  }
  useEffect(() => {
    if(sessionId){
        callApi(sessionId)
    }
  }, [sessionId]);



  return (
    <div className="body-height flex flex-col items-center justify-center gap-y-4">
      {isPending ? <h1>Please wait while we check payment status...</h1> : <>
        {data ? <h1 className="font-semibold text-black text-3xl">{(data?.sessionStatus!='complete' || data?.paymentStatus!='paid') ? '‼️': '✅'}</h1>: error?.message}
      {data ? <h1 className="font-semibold text-black text-3xl">{(data?.sessionStatus!='complete' || data?.paymentStatus!='paid') ? 'Payment Failed' : 'Payment Successful'}</h1>: error?.message}
      </>}
      <Link href="/">
        <p className="text-lg text-blue-600 underline">Go to Main Page</p>
      </Link>
      
    </div>
  );
}
