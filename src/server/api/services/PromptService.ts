import PromptRepository from "../repostitory/PromptRepository"

class PromptService{

    static async getPromptByPosition(position:string, interviewType?:string){
        return await PromptRepository.getPromptByPosition(position, interviewType)
    }
}

export default PromptService