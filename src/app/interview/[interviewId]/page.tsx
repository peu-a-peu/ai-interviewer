"use client";
import { Modal } from "@/app/components/modals/Modal";
import Button from "@/app/components/ui/Button";
import Cross from "public/svgs/cross";
import Mic from "public/svgs/mic";
import { useEffect, useState } from "react";
import { useRecordVoice } from "@/app/components/hooks/useAudioRecord";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import Lottie from "react-lottie-player";
import SpeakingAnimation from "../../lotties/speaking.json";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { toast } from "react-toast";

export default function ViewPage({
  params,
}: {
  params: { interviewId: string };
}) {
  const t = useTranslations();
  const { interviewId } = params;
  const mutation = api.interview.closeInterview.useMutation();
  const { data, refetch } = api.interview.getInterview.useQuery({ interview_id: interviewId }, { enabled: false })
  const router = useRouter();
  const {
    recordingStatus,
    audioBlob,
    startRecording,
    stopRecording,
    pauseMediaRecording,
    resumeMediaRecording,
  } = useRecordVoice();
  const [showText, setShowText] = useState(false);
  const [modals, showModals] = useState<any>({
    error: {
      show: false,
      msg: "",
    },
    close: {
      show: false,
      msg: "",
    },
    summary: {
      show: false,
      msg: "",
    },
  });

  const [questionData, setQuestionData] = useState({
    question: "",
    images: ""
  })
  function closeModal(modalName: string) {
    showModals((prev: any) => ({
      ...prev,
      [modalName]: { show: false, msg: "" },
    }));
  }
  function openModal(modalName: string, msg?: any) {
    showModals((prev: any) => ({
      ...prev,
      [modalName]: { show: true, msg: msg || "" },
    }));
  }

  async function getQuestion(interviewId: string, audioBlob: Blob) {
    stopRecording();
    const formData = new FormData();
    formData.append("interviewId", interviewId);
    if (audioBlob) {
      formData.append("audio", audioBlob, "audio.webm");
    }
    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        body: formData,
      });

      if (response.status !== 200) {
        const res = await response.json();
        if(response.status==404){
          toast.error(t('Interview does not exists'))
          toast.info(t('Try creating a new interview'))
          router.replace(`/`);
          return;
        }
        openModal("error", res.message);
      }


      const metadata = JSON.parse(response.headers.get("metadata") || "{}")
      let { isOver, question, images="" } = metadata;
      isOver = isOver==='Y'
      setQuestionData({ question, images })
      // Convert the response to a Blob
      const audioBlob = await response.blob();

      // Create a URL for the Blob
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create an audio element and play the audio
      const audio = new Audio(audioUrl);
      // Define the event listener
      const onEnded = async () => {
        console.log("Audio playback has finished.");
        // Add any additional logic you want to execute when audio finishes
        if (!isOver) {
          startRecording();
          setShowText(true);
          setTimeout(() => {
            setShowText(false);
          }, 5000);
        } else {
          router.replace(`/feedback/${interviewId}`);
        }
      };

      // Add event listener for when the audio ends
      audio.addEventListener("ended", onEnded);

      stopRecording();
      audio.play();
      // Play the audio
      const data = await response.json()
      return () => {
        audio.removeEventListener("ended", onEnded);
        // Optionally revoke the object URL to free up resources
        URL.revokeObjectURL(audioUrl);
      };

    } catch (err) { }
  }

  function handleMicClick() {
    if (recordingStatus == "paused") {
      resumeMediaRecording();
    } else {
      pauseMediaRecording();
    }
  }

  useEffect(() => {
    if (interviewId) {
      refetch()
    }
  }, [interviewId])
  useEffect(() => {
    getQuestion(interviewId, audioBlob as Blob);
  }, [interviewId, audioBlob]);

  async function closeInterview() {
    await mutation.mutateAsync({ interviewId });
    toast.success(t("Closed interview successfully"))
    router.replace(`/feedback/${interviewId}`);
  }

  let position = data?.position || ""
  position = position.replace(/_/g, ' ')
  position = position[0]?.toUpperCase() + position.slice(1)
  let { question, images } = questionData
  const imageArray = (images.split(',') || []).filter((item) => !!item)
  const hasImages = imageArray.length != 0
  return (
    <div>
      <section className="relative max-w-xl mx-auto body-height py-6 px-3 flex flex-col justify-between items-center">
        <div className="h-24 text-center font-semibold !leading-none">
          {data && <>
          <p className="text-gray-600">{t(`Interview in progress`)}</p>
          <h3 className="mt-5 text-black text-2xl">{data?.candiateName}</h3>
          <p className="text-gray-700 mt-3">{data?.companyName} / {position}</p>
          </>}
        </div>
        <div className="text-center flex flex-col items-center max-w-md">
          {hasImages ? imageArray.map((image) => (
            <div style={{ position: 'relative', width: '100%', height: '200px' }}>
            <Image
              src={image}
              alt="Question image"
              layout="fill"
              objectFit="contain" // or "contain"
            />
          </div>)) : <Lottie
            className="bottom-16 relative"
            loop
            animationData={SpeakingAnimation}
            play
            style={{ width: 150, height: 150 }}
          />}
          <p className={clsx("text-gray-600", !hasImages ? "-mt-12" : "mt-4")}>{question}</p>
          {showText && (
            <p className="text-lg my-6 text-center font-medium text-gray-700">
              {t(`You can start speaking now`)}
            </p>
          )}
        </div>
        <div className="md:max-w-60 px-4 bottom-8 flex justify-between w-full">
          <div
            className={clsx(
              recordingStatus === "inactive"
                ? "mic-disabled"
                : recordingStatus === "paused"
                  ? "mic-disabled-user"
                  : ""
            )}
            onClick={() => handleMicClick()}
          >
            <Mic />
          </div>
          <div onClick={() => openModal("close")}>
            <Cross />
          </div>
          <Modal
            isOpen={modals["close"].show}
            onClose={() => closeModal("close")}
          >
            <p className="text-sm text-center text-black font-medium">
              {t(`Would you like to stop the interview`)}?
            </p>
            <div className="flex justify-between mt-5 gap-3 flex-wrap">
              <Button
                isLoading={mutation.isPending}
                extraClasses="flex-grow"
                variant="primary"
                onClick={closeInterview}
              >
                {t(`Yes`)}
              </Button>
              <Button
                extraClasses="flex-grow"
                variant="secondary"
                onClick={() => closeModal("close")}
              >
                {t(`No`)}
              </Button>
            </div>
          </Modal>

          <Modal
            isOpen={modals["error"].show}
            onClose={() => {
              closeModal("error");
            }}
          >
            <p className="text-sm text-center text-black font-medium">
              {modals["error"].msg}
            </p>
            <div className="flex justify-between mt-5 gap-3 flex-wrap">
              <Button
                onClick={() => {
                  closeModal("error");
                }}
                extraClasses="flex-grow"
                variant="primary"
              >
                {t(`Close`)}
              </Button>
            </div>
          </Modal>
        </div>
      </section>
    </div>
  );
}
