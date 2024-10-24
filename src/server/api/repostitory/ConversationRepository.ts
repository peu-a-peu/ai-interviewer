import { db } from "@/server/db";
import { conversation } from "@/server/db/schema/conversation";
import { Conversation, NewConversation } from "@/server/interfaces/drizzle";
import { asc, eq } from "drizzle-orm";

class ConversationRepository {

    static async addConversation(record: NewConversation) {
        return await db.insert(conversation).values(record)
    }

    static async updateConversation(record: Partial<Conversation>&{conversation_id:string}) {
        return await db.update(conversation).set(record).where(eq(conversation.conversation_id,record.conversation_id))
    }

    static async getConversationsByInterviewId(interviewId: string) {
        return await db.select().from(conversation).where(eq(conversation.interview_id, interviewId)).orderBy(asc(conversation.created_at))
    }
}
export default ConversationRepository;