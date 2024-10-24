import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import InterviewController from "../controllers/InterviewController";
import { OpenAIMessageRole } from "@/server/interfaces/OpenAiInterface";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import AiFactory from "../Factory/AiFactory";

const chatService = AiFactory.getChatService()
export const testRouter = createTRPCRouter({
  checkResponse: publicProcedure
    .input(z.object({ 
      prompt:z.string(),
      nameOfCandidate: z.string(),
      companyApplyingFor: z.string(),
      positionApplyingFor: z.string(),
      interviewType: z.string(),
      experienceType: z.string(),
      needAudio: z.string(),
      pairs:z.array(z.object({
        question:z.string(),
        answer:z.string()
      })).optional()
    }))
    .query(async({ input }) => {
      let {prompt,needAudio,pairs=[], ...rest} = input;
      prompt+=`/n you have to use this object and interprete its keys in your conversation accordingly. ${JSON.stringify(rest)}`
      const context = [] 
      for(const pair of pairs){
        context.push({
          role:"assistant" as OpenAIMessageRole, content:pair.question,
        },{
          role:"user" as OpenAIMessageRole, content:pair.answer,
        })
      }
        const aiResponse: string = await chatService.getAiResponse({
        messageContext: context as ChatCompletionMessageParam[],
        prompt,
        role: "system"
    })

    return aiResponse

    }),

});
