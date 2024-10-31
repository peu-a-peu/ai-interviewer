import PromptRepository from "../repostitory/PromptRepository"

class PromptService{

    static async getPromptByKey(key:string){
        return await PromptRepository.getPromptById(key)
    }
}

export default PromptService