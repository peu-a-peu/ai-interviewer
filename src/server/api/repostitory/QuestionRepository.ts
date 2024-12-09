import { db } from "@/server/db"
import { question } from "@/server/db/schema"
import { Interview } from "@/server/interfaces/drizzle"
import { QuestionOutput } from "@/server/interfaces/question"
import { and, eq, isNull, lte, or, sql } from "drizzle-orm"


class QuestionsRepository{
    static async getQuestions(currentInterview:Interview, limit:number):Promise<QuestionOutput[]>{
        return (await db.select({id: question.question_id, question: question.question, images: question.images})
        .from(question)
        .where(and(
            or(
                isNull(question.company_id), // Include questions where company_id is NULL
                eq(question.company_id, currentInterview.company_id) // Or where company_id matches
            ),
            eq(question.position, currentInterview.position as string),
            eq(question.interview_type, currentInterview.interview_type as string),
            lte(question.experience_level, currentInterview.experience as number)
        ))
        .limit(limit))
    }

    static async getDistinctRolesForCompany(companyId:string):Promise<string[]>{
        return (await db.selectDistinct({position: question.position}).from(question).where(eq(question.company_id, companyId)).groupBy(question.position)).map((q)=>q.position) as string[]
    }
}

export default QuestionsRepository