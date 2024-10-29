import { GetOpenAiResponseParam } from "../../interfaces/OpenAiInterface"

type GetResponseParam = GetOpenAiResponseParam
export interface ChatAIResponse{
    base64audio:string;
    text:string;
    id:string;
}
export interface ChatService {
    getAiResponse(param:GetResponseParam):Promise<ChatAIResponse>
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