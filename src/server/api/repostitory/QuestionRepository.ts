import { db } from "@/server/db"
import { question } from "@/server/db/schema"
import { Interview } from "@/server/interfaces/drizzle"
import { and, eq, sql } from "drizzle-orm"

class QuestionsRepository{
    static async getQuestionsForCompany(currentInterview:Interview, limit:number):Promise<string[]>{
        return (await db.select({question: question.question})
        .from(question)
        .where(and(
            eq(question.company_id, currentInterview.company_id),
            eq(question.position, currentInterview.position as string),
            eq(question.interview_type, currentInterview.interview_type as string),
        ))
        .limit(limit)).map((q)=>q.question)
    }

    static async getDistinctRolesForCompany(companyId:string):Promise<string[]>{
        return (await db.selectDistinct({position: question.position}).from(question).where(eq(question.company_id, companyId)).groupBy(question.position)).map((q)=>q.position) as string[]
    }
}

export default QuestionsRepository