import { GetOpenAiResponseParam } from "../../interfaces/OpenAiInterface"

type GetResponseParam = GetOpenAiResponseParam
export interface AIAudioResponse{
    base64audio:string;
    text:string;
    id:string;
}

export interface AITextResponse{
    text:string;
}

export interface ChatService {
    getAiAudioResponse(param:GetResponseParam):Promise<AIAudioResponse>
    getAiTextResponse(param:GetResponseParam):Promise<AITextResponse>
}


class AiChatService{
    service:ChatService
    constructor(service:ChatService){
        this.service = service
    }

    getAudioResponse(param:GetResponseParam){
        this.service.getAiAudioResponse(param)
    }

    getTextResponse(param:GetResponseParam){
        this.service.getAiTextResponse(param)
    }
}


export default AiChatService;