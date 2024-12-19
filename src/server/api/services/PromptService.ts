import PromptRepository from "../repostitory/PromptRepository"

class PromptService{

    static async getPromptByPosition(position:string, interviewType?:string){
        return await PromptRepository.getPromptByPosition(position, interviewType)
    }

    static async getPromptById(id:string){
        return await PromptRepository.getPromptById(id)
    }
}

export default PromptService