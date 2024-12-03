import AiFactory from "../Factory/AiFactory";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import InterviewService from "../services/InterviewService";
import { NewInterview } from "@/server/interfaces/drizzle";
import CustomError from "@/app/components/utils/CustomError";
import { evaluationPrompt, getSystemPrompt } from "@/server/libs/system-prompt";
import { OpenAIContent, SystemPromptInput } from "@/server/interfaces/OpenAiInterface";
import { ChatAIResponse } from "../services/AiChatService";
import { EvaluationResponse } from "@/server/interfaces/OpenAiInterface";

class InterviewController {
    static chatService = AiFactory.getChatService()
    static audioService = AiFactory.getAudioService()
    static async createInterview(data: NewInterview) {
        return await InterviewService.createInterview(data)
    }

    static async getNextQuestion(interviewId: string, audio?: Blob) {

        const currentInterview = await InterviewService.getInterviewById(interviewId)
        if (!currentInterview || currentInterview.ended_at) {
            throw new CustomError("Interview not found", 404)
        }
        const conversations = await  InterviewService.getInterviewConversations(interviewId)
           

        const { experience, interview_type, resume_summary, position,created_at, candidate_name, language } = currentInterview
        const prompt = await getSystemPrompt({
            name: candidate_name,
            experience,
            interview_type,
            resume_summary,
            position,
            created_at,
            language
        } as SystemPromptInput)

        let lastAns:OpenAIContent="", lastConversationId = conversations[conversations.length - 1]?.conversation_id
        if (audio) {
            const buffer = await audio.arrayBuffer();
            const base64str = Buffer.from(buffer).toString("base64");
            console.log({base64str})
            lastAns = {type:"input_audio", input_audio:{data:base64str, format:"wav"}} as any;
        }
        const messageContext: ChatCompletionMessageParam[] = []
        conversations.forEach(({ question, answer, conversation_id }, index) => {
            messageContext.push({
                role: "assistant",
                content: question
            }, {
                role: "user",
                content: conversation_id === lastConversationId ? lastAns : (answer || "")
            })
        });


        console.log(prompt)
        console.log(messageContext)
        let aiResponse: ChatAIResponse = await this.chatService.getAiResponse({
            prompt,
            messageContext,
            role: "system"
        })

        const isOver = aiResponse.text.includes("<<END_INTERVIEW>>")
        if (isOver) {
            await InterviewService.closeInterview(interviewId)
        }

        await Promise.all([
            InterviewService.addConversation(interviewId, aiResponse.text),
            lastConversationId && InterviewService.updateConversation(lastConversationId, "")
        ])

        // let mp3;
        // if (aiResponse) {
        //     mp3 = await this.audioService.convertTextToAudio(aiResponse)
        // }
        return { mp3: aiResponse.base64audio, isOver:false }
    }

    static async summarizeResume(resumeContent: string) {
        const prompt = `Extract the candidate's name, total years of experience, industries or domains worked in, and tools and technologies used from the following resume text. Present this information in a single, coherent paragraph of no more than 300 words, ensuring to exclude irrelevant details."
Resume text: ${resumeContent}`

        // const aiResponse: string = await this.chatService.getAiResponse({
        //     prompt,
        //     role: "system"
        // })

        // return aiResponse;
    }


    static async closeInterview(interviewId: string) {
        return await InterviewService.closeInterview(interviewId)
    }

    
    static async evaluateAnswers(interviewId: string):Promise<EvaluationResponse> {
        const currentInterview = await InterviewService.getInterviewById(interviewId)
        if (!currentInterview) {
            throw new CustomError("Interview not found", 404)
        }
        const { experience, interview_type, resume_summary, position, candidate_name, feedback } = currentInterview
        if(feedback){
            return {
                candidate_name,
                position:position,
                feedback
            }
        }
        const conversations = await InterviewService.getInterviewConversations(interviewId)
        const messageContext: ChatCompletionMessageParam[] = []
        conversations.forEach(({ question, answer }, index) => {
            messageContext.push({
                role: "assistant",
                content: question
            }, {
                role: "user",
                content: answer || ""
            })
        });

        let aiResponse=""
        // const aiResponse: string = await this.chatService.getAiResponse({
        //     prompt: evaluationPrompt({
        //         experience,
        //         interview_type,
        //         resume_summary,
        //         position,
        //     } as SystemPromptInput),
        //     role: "system",
        //     messageContext

        // })

        await InterviewService.updateInterview(interviewId,{feedback: aiResponse})

        return {
                candidate_name,
                position:position,
                feedback:aiResponse
        };


    }


}

export default InterviewController;