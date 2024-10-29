import { env } from "@/env";
import { GetOpenAiResponseParam } from "../../../interfaces/OpenAiInterface"
import OpenAiConnection from "../../connections/OpenAI/OpenAiConnection";
import { ChatService } from "../AiChatService";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
class OpenAiChatService implements ChatService{
    instance:OpenAiConnection
    constructor(){
        this.instance = OpenAiConnection.getInstance()
    }

    getAiResponse = async(param:GetOpenAiResponseParam)=>{
        const {role, prompt, messageContext=[]} = param;
        let messages = [{
            role,
            content: prompt,
        },...messageContext] as ChatCompletionMessageParam[]
      
        const res = await  this.instance.client.chat.completions.create({
            model: env.OPENAI_CHAT_MODEL!,
            modalities: ["text", "audio"],
            //@ts-ignore
            audio: { voice: "alloy", format: "wav" },
            messages
        })

        console.log(res.choices[0]?.message)

        let audio = res.choices[0]?.message?.audio
        console.log(audio)
        return {base64audio: audio?.data || "", text: audio?.transcript || "", id: audio?.id || ""}
    }

}

export default OpenAiChatService