import { useTranslations } from "next-intl";
import { useEffect } from "react";
// import { setUserLocale } from "../services/locale";
import StartInterviewForm from "../components/form/StartInterviewForm";
import Lottie from "react-lottie-player";
import SpeakingAnimation from "../lotties/speaking.json";
// import { usePathname } from "next/navigation";
export default function Home() {
  const t = useTranslations();
  // const path = usePathname();
  // useEffect(() => {
  //   const browserLocale =
  //     path == "/" ? navigator.language || navigator.languages[0] || "en" : "en";
  //   setUserLocale(browserLocale);
  // }, []);
  return (
    <section className="flex flex-col items-center justify-center max-w-3xl mx-auto">
      <section className="py-10 px-3 mx-6">
        <h1 className="whitespace-pre-line text-[32px] md:text-5xl !leading-normal font-bold text-black text-center">
          {t(
            `Mock interviews with an AI interviewer trained on 40,000 interview questions`
          )}
        </h1>
        <p className="text-lg text-black mt-4 text-center">
          {t(
            `Improve your success rate with practice questions and feedback on areas for improvement!`
          )}
        </p>
        <div className="dots flex justify-center items-center gap-2 py-20 h-48">
          <Lottie
            loop
            animationData={SpeakingAnimation}
            play
            style={{ width: 150, height: 150 }}
          />
        </div>
        <StartInterviewForm />
      </section>
    </section>
  );
}
