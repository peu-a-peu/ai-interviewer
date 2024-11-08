import { db } from "@/server/db";
import { prompt } from "@/server/db/schema";
import { eq } from "drizzle-orm";

class PromptRepository {

    static getPromptById = async (id: string) => {
        return (await db.select({ prompt: prompt.prompt }).from(prompt).where(eq(prompt.prompt_id, id)))?.[0]?.prompt || ""
    }
}

export default PromptRepository;