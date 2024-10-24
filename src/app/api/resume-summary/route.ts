import InterviewController from '@/server/api/controllers/InterviewController';
import { NextRequest, NextResponse } from 'next/server';
//@ts-ignore
import pdfParse from 'pdf-parse/lib/pdf-parse';

export async function POST(req: NextRequest, res: NextResponse) {

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
       
        if(!file){
            return NextResponse.json({ message: 'No content' }, { status: 400 });
        }
        const buffer = Buffer.from(await file.arrayBuffer()); // Convert Blob to Buffer
        const data = await pdfParse(buffer);
        let resumeText = data.text.trim().replace(/\n/g, ' ')
        if(resumeText){
           resumeText =  await InterviewController.summarizeResume(resumeText)
        }
        return NextResponse.json({ text: resumeText }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Server Error' }, { status: 500 });
    }
};


