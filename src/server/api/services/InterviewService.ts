import { ulid } from "ulidx";
import InterviewRepository from "../repostitory/InterviewRepository";
import { Interview, NewInterview } from "@/server/interfaces/drizzle";
import ConversationRepository from "../repostitory/ConversationRepository";

class InterviewService {

    static async getInterviewById(interviewId: string) {
        return await InterviewRepository.getInterviewById(interviewId)
    }

    static async createInterview(record: NewInterview) {
        record.interview_id = ulid()
        return await InterviewRepository.createInterview(record)
    }

    static async closeInterview(interviewId:string){
        return await InterviewRepository.updateInterview(interviewId,{ended_at: new Date()})
    }

    static async getInterviewConversations(interviewId: string) {
        return await ConversationRepository.getConversationsByInterviewId(interviewId)
    }

    static async addConversation(interviewId: string, question:string) {
        const record = {
            conversation_id: ulid(),
            interview_id: interviewId,
            question,
            answer: ''
        }
        return await ConversationRepository.addConversation(record)
    }

    static async updateConversation(conversation_id: string, answer:string) {
        const record = {
            conversation_id,
            answer
        }
        return await ConversationRepository.updateConversation(record)
    }
}

export default InterviewService

