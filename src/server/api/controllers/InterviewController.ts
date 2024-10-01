import AiFactory from "../Factory/AiFactory";
import openAIService from "../services/AiChatService";
import { ChatCompletion } from "openai/resources/index.mjs";
import OpenAI from "openai";
import path from "path"
import fs from "fs"
import { ChatCompletionMessageParam } from "openai/src/resources/index.js";
class InterviewController{

    static async startInterview(){

    }
    static async getNextQuestion(prompt:string, messageContext:ChatCompletionMessageParam[]=[]){
        const interviewId = 1
        // TODO : Fetch set of question answers from database based on interview ID
        const chatService = AiFactory.getChatService()
        const audioService = AiFactory.getAudioService()

        const aiResponse: string = await chatService.getAiResponse({
            messageContext,
            prompt,
            role:"user"
        })

        return aiResponse;
        // const speechFile = path.resolve("./speech2.mp3");
  
        // if (aiResponse) {
        //   const mp3 = await audioService.convertTextToAudio(aiResponse)
        //   const buffer = Buffer.from(await mp3.arrayBuffer());
        //   await fs.promises.writeFile(speechFile, buffer);
        // }
    }

    static async evaluateAnswers(){

    }


}

export default InterviewController;