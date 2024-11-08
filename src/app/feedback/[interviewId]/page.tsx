import Button from "@/app/components/ui/Button";
import Image from "next/image";
import { api } from '@/trpc/server';
import { getTranslations } from "next-intl/server";
import { capitalize } from "@/utils/util";
export default async function FeedbackPage({ params }: { params: { interviewId: string } }) {
    const t = await getTranslations()
    const { interviewId } = params;
    let data;
    try {
        data = await api.interview.evaluateAnswers({ interviewId })
    } catch (err: any) {
        return <h1>{err?.message}</h1>
    }
    if (!data) {
        return <h1>Nothing to show here</h1>
    }
    const summary: any = JSON.parse(data?.feedback || "{}") || {}
    return (
        <div>
            <section className="relative max-w-xl mx-auto py-12 px-3 flex flex-col justify-center items-center">
                <Image alt="feedback" width={120} height={120} src={"/pngs/feedback.png"} />
                <h1 className="text-3xl leading-relaxed mt-3 text-center">{capitalize(data?.candidate_name || "")} <br />{t(`Mock interview results`)}</h1>
                <p className="mt-3 text-center">{t(`The interview has ended`)}. {t(`Check out your strengths and points of improvement`)}</p>
                <div className="flex flex-col">
                    {Object.keys(summary).map((key) => {
                        const subKeys = Object.keys(summary[key])
                        return <div className="mt-10">
                            <h2 className="text-lg text-black mb-3 font-semibold">{key}</h2>
                            <div className="border flex flex-col gap-8 border-gray-100 rounded-xl py-7 px-6">
                                {subKeys.map((subKey) => {
                                    return <div>
                                        <h3 className="font-semibold text-black">{subKey}</h3>
                                        <p className="mt-2 text-gray-800">{summary[key][subKey]}</p>
                                    </div>
                                })}
                            </div>
                        </div>
                    })}
                </div>
                <p className="mt-8 text-center">{t(`As you gain more experience, I hope you will further strengthen your strengths and make improvements`)}</p>
                <p className="mt-4 mb-10 text-center">{t(`I hope you get good results`)} {":)"}</p>
               <Button variant="secondary" extraClasses="mt-15 font-semibold">{t(`Go to home`)}</Button>
            </section>
        </div>
    );
}
