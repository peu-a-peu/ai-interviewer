import AiFactory from "../Factory/AiFactory";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import InterviewService from "../services/InterviewService";
import { NewInterview } from "@/server/interfaces/drizzle";
import CustomError from "@/app/components/utils/CustomError";
import { evaluationPrompt, getSystemPrompt } from "@/server/libs/system-prompt";
import { AIAudioResponse } from "../services/AiChatService";
import { EvaluationResponse, SystemPromptInput } from "@/server/interfaces/OpenAiInterface";
import QuestionsService from "../services/QuestionsService";

class InterviewController {
    static chatService = AiFactory.getChatService()
    static audioService = AiFactory.getAudioService()
    static async createInterview(data: NewInterview) {
        return await InterviewService.createInterview(data)
    }

    static async getInterviewById(id:string){
        return await InterviewService.getInterviewById(id)
    }

    static async getNextQuestion(interviewId: string, audio?: Blob) {

        const currentInterview = await InterviewService.getInterviewById(interviewId)
        if (!currentInterview || currentInterview.ended_at) {
            throw new CustomError("Interview not found", 404)
        }
        const [conversations, questions] = await Promise.all([
            InterviewService.getInterviewConversations(interviewId),
            QuestionsService.getQuestions(currentInterview)
        ])


        const { experience, interview_type, resume_summary, position, created_at, candidate_name, language } = currentInterview
        const prompt = await getSystemPrompt({
            name: candidate_name,
            experience,
            interview_type,
            resume_summary,
            position,
            created_at,
            language,
            questions
        } as SystemPromptInput)

        const imageMap:Record<string,string>={}
        questions.forEach((item)=>{
            imageMap[item.id] = item.images||""
        })
        let lastAns:any = "", lastConversationId = conversations[conversations.length - 1]?.conversation_id
        if (audio) {
            const buffer = await audio.arrayBuffer();
            const base64str = Buffer.from(buffer).toString("base64");
            console.log({ base64str })
            lastAns = [{ type: "input_audio", input_audio: { data: base64str, format: "mp3" } } as any];
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

        let response = await this.chatService.getAiAudioResponse({
            messageContext,
            prompt,
            role: "system"
        })

        let aiResponse = response.text

        console.log({aiResponse})
        const isOver = aiResponse.includes("<<END_INTERVIEW>>")
        if (isOver) {
            await InterviewService.closeInterview(interviewId)
        }
        const regex = /<<([^<>]+)>>/;
        const match = aiResponse.match(regex);
         let id = '', question=""
        if (match) {
            question = match?.[1] || ""
            if(question){
                aiResponse = aiResponse.replace('<<','')
                aiResponse = aiResponse.replace('>>','')
            }
            const regex2 = /\(([^()]+)\)/;
            const match2 = aiResponse.match(regex2)
            if (match2?.[1]) {
                id = match2?.[1]?.trim()
               aiResponse = aiResponse.replace(`(${id})`, '')
               question = question.replace(`(${id})`, '')
            }
            aiResponse.trim()
        }

        await Promise.all([
            InterviewService.addConversation(interviewId, response.id),
        ])
        console.log({aiResponseClear: aiResponse})
        let mp3;
        if (aiResponse) {
            mp3 = await this.audioService.convertTextToAudio(aiResponse)
        }
        return { mp3: response.base64audio, isOver, question, images: imageMap[id]||"" }
    }

     
    static async summarizeResume(resumeContent: string) {
        const prompt = `Extract the candidate's name, total years of experience, industries or domains worked in, and tools and technologies used from the following resume text. Present this information in a single, coherent paragraph of no more than 300 words, ensuring to exclude irrelevant details."
Resume text: ${resumeContent}`

        const aiResponse = await this.chatService.getAiTextResponse({
            prompt,
            role: "system"
        })

        return aiResponse.text;
    }

    static async closeInterview(interviewId: string) {
        return await InterviewService.closeInterview(interviewId)
    }


    static async evaluateAnswers(interviewId: string): Promise<EvaluationResponse> {
        const currentInterview = await InterviewService.getInterviewById(interviewId)
        if (!currentInterview) {
            throw new CustomError("Interview not found", 404)
        }
        const { experience, interview_type, resume_summary, position, candidate_name, feedback, language } = currentInterview
        if (feedback) {
            return {
                candidate_name,
                position: position,
                feedback
            }
        }
        const conversations = await InterviewService.getInterviewConversations(interviewId)
        const messageContext: ChatCompletionMessageParam[] = []
        conversations.forEach(({ answer }, index) => {
            if (answer) {
                messageContext.push({
                    role: "assistant",
                    audio: {
                        id: answer || ""
                    }
                })
            }
        });

        let aiResponse: any = ''
        if (messageContext.length) {
            aiResponse = (await this.chatService.getAiTextResponse({
                prompt: evaluationPrompt({
                    experience,
                    interview_type,
                    resume_summary,
                    position,
                    language
                } as SystemPromptInput),
                role: "system",
                messageContext

            }))?.text
        } else {
            aiResponse = `You have not taken the interview so can't provide you any feedback.`
        }

        await InterviewService.updateInterview(interviewId, { feedback: aiResponse })

        return {
            candidate_name,
            position: position,
            feedback: aiResponse
        };


    }


}

export default InterviewController;