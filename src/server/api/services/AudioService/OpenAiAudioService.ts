import OpenAiConnection from "../../connections/OpenAI/OpenAiConnection";
import openAIService from "../AiChatService";
import { AudioService } from "../TextToSpeechService";
import { env } from "@/env";
class OpenAiAudioService implements AudioService{

    instance: OpenAiConnection
    constructor(){
        this.instance = OpenAiConnection.getInstance()
    }
    convertTextToAudio(text: string): Promise<Response> {
        return this.instance.client.audio.speech.create({
            input: text,
            model: env.OPENAI_VOICE_MODEL,
            voice:"alloy"
        })
    }
}

export default OpenAiAudioService;