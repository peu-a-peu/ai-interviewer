import { GetOpenAiResponseParam } from "../../interfaces/OpenAiInterface"

type GetResponseParam = GetOpenAiResponseParam
export interface ChatService {
    getAiResponse(param:GetResponseParam):Promise<string>
}


class AiChatService{
    service:ChatService
    constructor(service:ChatService){
        this.service = service
    }

    getResponse(param:GetResponseParam){
        this.service.getAiResponse(param)
    }
}


export default AiChatService;