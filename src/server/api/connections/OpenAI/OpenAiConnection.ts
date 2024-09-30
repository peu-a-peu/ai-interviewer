import OpenAI, {}  from "openai"
import { env } from "@/env";

class OpenAiConnection{
    client: OpenAI
    public static instance: OpenAiConnection
    constructor(){
        this.client = new OpenAI({
            apiKey: env.OPENAI_API_KEY,
        })
    }

    public  static getInstance(){

        if(!OpenAiConnection.instance){
            OpenAiConnection.instance = new OpenAiConnection()
        }

        return OpenAiConnection.instance
    }

    text2Speech = async(response:string)=>{
        return this.client.audio.speech.create({
            input: response,
            model: env.OPENAI_VOICE_MODEL,
            voice:"alloy"
        })
    }
}

export default OpenAiConnection;