import CustomError from "@/app/components/utils/CustomError";
import InterviewController from "@/server/api/controllers/InterviewController";
import { NextRequest, NextResponse } from 'next/server'; // Correct import for App Router

export async function POST(request: NextRequest, res: NextResponse) {
    // Use request.formData() to extract form data
    const body = await request.formData();
    const interviewId = body.get('interviewId') as string;
    const audioBlob = body.get('audio') as Blob | undefined;


    try {
        // Assuming getNextQuestion returns a Blob or buffer
        const { mp3, isOver, images, question } = await InterviewController.getNextQuestion(interviewId, audioBlob);
        let audioBuffer;
        if (mp3) {
            audioBuffer =  Buffer.from((mp3 as Base64URLString),'base64');
        }

        const metadata = {
            isOver: isOver? "Y" : "",
            images,
            question
        }

        return new NextResponse(audioBuffer, {
            headers: {
                "Content-Type": "audio/webm", // Adjust MIME type to your audio format
                "metadata": JSON.stringify(metadata)
            },
        });

    } catch (err) {
        console.log(err)
        if (err instanceof CustomError) {
            return NextResponse.json({ message: err.message }, { status: err.statusCode });
        }
        return NextResponse.json({ message: 'Server Error' }, { status: 500 });
    }
}

