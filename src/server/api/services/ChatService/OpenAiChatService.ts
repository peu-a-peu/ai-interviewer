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
            messages
        })

        return res.choices[0]?.message.content || ""
    }

}

export default OpenAiChatService