import { Interview } from "@/server/interfaces/drizzle"
import QuestionsRepository from "../repostitory/QuestionRepository"

class QuestionsService{
    static async getQuestionsForCompany(currentInterview:Interview){
        return await QuestionsRepository.getQuestionsForCompany(currentInterview, 20)
    }
}

export default QuestionsService