import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { setUserLocale } from "../services/locale";
import StartInterviewForm from "../components/form/StartInterviewForm";
import { usePathname } from "next/navigation";
export default function Home() {
    const t = useTranslations()
    useEffect(()=>{
      const browserLocale =  navigator.language || navigator.languages[0] || "en";
      setUserLocale(browserLocale)
    },[])
    return (<section className="max-w-3xl mx-auto min-h-screen py-16 px-3">
        <h1 className="text-3xl font-bold text-black text-center">{t(`Practice with an AI interviewer trained on 40,000 real exam questions to increase your chances of passing!`)}</h1>

        <div className="dots flex justify-center items-center gap-2 py-20 h-48">
            {new Array(4).fill(null).map((_, index) => <div style={{ '--i': index } as React.CSSProperties} className="dot w-12 h-12 rounded-full bg-black"></div>)}
        </div>
        <StartInterviewForm />
    </section>)
}