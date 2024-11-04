'use client';
import { Modal } from '@/app/components/modals/Modal';
import Button from '@/app/components/ui/Button';
import Cross from 'public/svgs/cross';
import Mic from 'public/svgs/mic';
import { useEffect, useState } from 'react';
import { useRecordVoice } from "@/app/components/hooks/useAudioRecord";
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import Lottie from "react-lottie-player"
import SpeakingAnimation from "../../lotties/speaking.json"

export default function ViewPage({ params }: { params: { interviewId: string } }) {

    const { interviewId } = params;
    const mutation = api.interview.closeInterview.useMutation()
    const { data: summary, refetch, } = api.interview.evaluateAnswers.useQuery({ interviewId }, { enabled: false })
    const router = useRouter()
    const { recordingStatus, audioBlob, startRecording, stopRecording } = useRecordVoice();
    const [modals, showModals] = useState<any>({
        'error': {
            show: false,
            msg: ""
        },
        'close': {
            show: false,
            msg: ""
        },
        'summary': {
            show: false,
            msg: ""
        }
    })

    function closeModal(modalName: string) {
        showModals((prev: any) => ({ ...prev, [modalName]: { show: false, msg: "" } }))
    }
    function openModal(modalName: string, msg?: any) {
        showModals((prev: any) => ({ ...prev, [modalName]: { show: true, msg: msg || "" } }))
    }

    async function getQuestion(interviewId: string, audioBlob: Blob) {
        stopRecording()
        const formData = new FormData()
        formData.append('interviewId', interviewId)
        if (audioBlob) {
            formData.append('audio', audioBlob, 'audio.webm')
        }
        try {
            const response = await fetch('/api/interview', { method: "POST", body: formData })

            if (response.status !== 200) {
                const res = await response.json()
                openModal('error', res.message)
            }

            const isOver = response.headers.get("interview-over") == 'Y'
            // Convert the response to a Blob
            const audioBlob = await response.blob();

            // Create a URL for the Blob
            const audioUrl = URL.createObjectURL(audioBlob);

            // Create an audio element and play the audio
            const audio = new Audio(audioUrl);
            // Define the event listener
            const onEnded = async () => {
                console.log('Audio playback has finished.');
                // Add any additional logic you want to execute when audio finishes
                if (!isOver) {
                    startRecording()
                } else {
                    await refetch()
                    openModal('summary')
                }
            };

            // Add event listener for when the audio ends
            audio.addEventListener('ended', onEnded);

            audio.play()
            // Play the audio
            return () => {
                audio.removeEventListener('ended', onEnded);
                // Optionally revoke the object URL to free up resources
                URL.revokeObjectURL(audioUrl);
            };

        } catch (err) {

        }
    }

    useEffect(() => {
        getQuestion(interviewId, audioBlob as Blob)
    }, [interviewId, audioBlob])


    async function closeInterview() {
        await mutation.mutateAsync({ interviewId })
        router.replace("/")
    }
    return (
        <div>
            <section className="relative max-w-sm mx-auto h-[calc(100vh-60px)] py-12 px-3 flex flex-col justify-center items-center">
                <Lottie
                    className='bottom-16 relative'
                    loop
                    animationData={SpeakingAnimation}
                    play
                    style={{ width: 150, height: 150 }}
                />
                <div className='absolute left-0 px-4 bottom-4 flex justify-between w-full'>
                    <div className={clsx(recordingStatus == 'inactive' ? 'mic-disabled' : "")}><Mic /></div>
                    <div onClick={() => openModal('close')}><Cross /></div>

                    <Modal isOpen={modals['summary'].show} onClose={() => closeModal('summary')}>
                        <h1>Interview Summary</h1>
                        <p>
                            {summary}
                        </p>
                        <Button onClick={() => { closeModal('summary'), router.replace("/") }} extraClasses='flex-grow' variant='primary'>OK</Button>
                    </Modal>
                    <Modal isOpen={modals['close'].show} onClose={() => closeModal('close')}>
                        <p className='text-sm text-center text-black font-medium'>면접을 중단하시겠어요?</p>
                        <div className="flex justify-between mt-5 gap-3 flex-wrap">
                            <Button isLoading={mutation.isPending} extraClasses='flex-grow' variant='primary' onClick={closeInterview}>계속 할래요</Button>
                            <Button extraClasses='flex-grow' variant='secondary' onClick={() => closeModal('close')}>계속 할래요</Button>
                        </div>
                    </Modal>

                    <Modal isOpen={modals['error'].show} onClose={() => { closeModal('error') }}>
                        <p className='text-sm text-center text-black font-medium'>{modals['error'].msg}</p>
                        <div className="flex justify-between mt-5 gap-3 flex-wrap">
                            <Button onClick={() => { closeModal('error') }} extraClasses='flex-grow' variant='primary'>Close</Button>
                        </div>
                    </Modal>

                </div>
            </section>
        </div>
    );
}
