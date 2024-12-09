import { Interview } from "@/server/interfaces/drizzle"
import QuestionsRepository from "../repostitory/QuestionRepository"

class QuestionsService{
    static async getQuestions(currentInterview:Interview){
        return await QuestionsRepository.getQuestions(currentInterview, 20)
    }
}

export default QuestionsService