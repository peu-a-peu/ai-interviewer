import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { setUserLocale } from "../services/locale";
import StartInterviewForm from "../components/form/StartInterviewForm";
import Lottie from "react-lottie-player"
import SpeakingAnimation from "../lotties/speaking.json"
export default function Home() {
    const t = useTranslations()
    useEffect(() => {
        const browserLocale = navigator.language || navigator.languages[0] || "en";
        setUserLocale(browserLocale)
    }, [])
    return (<section className="max-w-3xl mx-auto min-h-screen py-10 px-3">
        <h1 className="text-[44px] md:text-5xl !leading-normal font-bold text-black text-center">{t(`Mock interviews with an AI interviewer trained on 40,000 interview questions`)}</h1>
        <p className="text-lg text-black mt-4 text-center">{t(`Improve your success rate with practice questions and feedback on areas for improvement!`)}</p>
        <div className="dots flex justify-center items-center gap-2 py-20 h-48">
            <Lottie
                loop
                animationData={SpeakingAnimation}
                play
                style={{ width: 150, height: 150 }}
            />
        </div>
        <StartInterviewForm />
    </section>)
}