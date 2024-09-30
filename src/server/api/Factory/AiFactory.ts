import OpenAiAudioService from "../services/AudioService/OpenAiAudioService"
import OpenAiChatService from "../services/ChatService/OpenAiChatService"

class AiFactory{

    static getChatService(){
        return new OpenAiChatService()
    }

    static getAudioService(){
        return new OpenAiAudioService()
    }
}
export default AiFactory