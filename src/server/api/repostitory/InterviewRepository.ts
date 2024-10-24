import { db } from "@/server/db";
import { interview } from "@/server/db/schema/interview";
import { Interview, NewInterview } from "@/server/interfaces/drizzle";
import { eq } from "drizzle-orm";

class InterviewRepository {

    static async createInterview(record: NewInterview) {
        return (await db.insert(interview).values(record).returning())[0]
    }

    static async getInterviewById(id: string) {
        return (await db.select().from(interview).where(eq(interview.interview_id, id)))[0]
    }

    static async updateInterview(interviewId:string, data:Partial<Interview>){
        return await db.update(interview).set(data).where(eq(interview.interview_id, interviewId))
    }
}
export default InterviewRepository;