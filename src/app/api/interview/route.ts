import CustomError from "@/app/components/utils/CustomError";
import InterviewController from "@/server/api/controllers/InterviewController";
import { NextRequest, NextResponse } from 'next/server'; // Correct import for App Router

export async function POST(request: NextRequest, res:NextResponse) {
    // Use request.formData() to extract form data
    const body = await request.formData();
    const interviewId = body.get('interviewId') as string;
    const audioBlob = body.get('audio') as Blob | undefined;


    try{
    // Assuming getNextQuestion returns a Blob or buffer
    const {mp3, isOver} = await InterviewController.getNextQuestion(interviewId, audioBlob);
    if(!mp3){
        return null;
    }
    // Convert Blob to ArrayBuffer or Buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Create a response with the appropriate headers
    const response = new NextResponse(buffer, {
        headers: {
            'Content-Type': 'audio/webm',
            'Content-Disposition': 'attachment; filename="audio.webm"',
            'interview-over':isOver ? 'Y':'N'
        },
    });

    return response;
}catch(err){
    if(err instanceof CustomError){
        return NextResponse.json({ message: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
}
}

