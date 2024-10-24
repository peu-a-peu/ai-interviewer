import { Uploadable } from "openai/uploads.mjs";
import OpenAiConnection from "../../connections/OpenAI/OpenAiConnection";
import openAIService from "../AiChatService";
import { AudioService } from "../TextToSpeechService";
import { env } from "@/env";
import { Transcription } from "openai/resources/audio/transcriptions.mjs";
class OpenAiAudioService implements AudioService{

    instance: OpenAiConnection
    constructor(){
        this.instance = OpenAiConnection.getInstance()
    }
    async convertTextToAudio(text: string): Promise<Blob> {
        const response = await this.instance.client.audio.speech.create({
            input: text,
            model: env.OPENAI_TTS_MODEL,
            voice: "alloy"
        });

       
        if (!response.ok) {
            throw new Error(`Failed to convert text to audio: ${response.statusText}`);
        }
    
        const blob = await response.blob(); // Convert the response to a Blob
        return blob;
    }

    convertAudioToText(file: any): Promise<Transcription> {
        return this.instance.client.audio.transcriptions.create({
            file,
            model: env.OPENAI_STT_MODEL,
        })
    }
}

export default OpenAiAudioService;