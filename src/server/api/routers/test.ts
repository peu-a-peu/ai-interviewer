import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import InterviewController from "../controllers/InterviewController";
import { OpenAIMessageRole } from "@/server/interfaces/OpenAiInterface";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

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
      prompt+=`/n you have to use this object to get values of the variables and then you have to ask questions accordingly. ${JSON.stringify(rest)}`
      const context = []
      for(let pair of pairs){
        context.push({
          role:"assistant" as OpenAIMessageRole, content:pair.question,
        },{
          role:"user" as OpenAIMessageRole, content:pair.answer,
        })
      }
      return await InterviewController.getNextQuestion(prompt,context as ChatCompletionMessageParam[])
    }),

});
