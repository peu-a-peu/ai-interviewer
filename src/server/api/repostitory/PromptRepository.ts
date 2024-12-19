import { db } from "@/server/db";
import { prompt } from "@/server/db/schema";
import { eq, or, ne, and, sql, desc } from "drizzle-orm";

class PromptRepository {

  static getPromptByPosition = async (position: string, interviewType?: string) => {
    const BEHAVIORAL = 'behavioral_interview'
    let query;
    if (interviewType === BEHAVIORAL) {
      query = db.select({
        prompt: prompt.prompt
      }).from(prompt).where(or(eq(prompt.prompt_id, 'BASE_PROMPT'), eq(prompt.interview_type, BEHAVIORAL))).orderBy(desc(eq(prompt.prompt_id, 'BASE_PROMPT')))
    } else {
      query = db.select({
        prompt: prompt.prompt
      }).from(prompt).where(or(eq(prompt.prompt_id, 'BASE_PROMPT'), and(eq(prompt.interview_type, interviewType || ""), eq(prompt.position, position)))).orderBy(desc(eq(prompt.prompt_id, 'BASE_PROMPT')))
    }

    return (await query).map((item) => item.prompt);

  }


  static getPromptById = async(id:string)=>{
    return (await db.select({
      prompt: prompt.prompt
    }).from(prompt).where(eq(prompt.prompt_id, id)))?.[0]?.prompt
  }
}

export default PromptRepository;