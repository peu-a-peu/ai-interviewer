'use client';
import StartInterviewForm from "./components/form/StartInterviewForm";

export default async function Home() {
  return (
    <section className="max-w-2xl mx-auto min-h-screen py-16 px-3">
      <h1 className="text-3xl font-bold text-black text-center">4만개의 실제 기출 질문을 학습한 AI 면접관과
        모의면접 하고 합격 확률을 높여보세요!</h1>

      <div className="dots flex justify-center gap-2 py-20">
        {new Array(4).fill(null).map((_, index) => <div style={{ '--i': index } as React.CSSProperties} className="dot w-12 h-12  rounded-full bg-black"></div>)}
      </div>
        <StartInterviewForm />
    </section>
  );
}
