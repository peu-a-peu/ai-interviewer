import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

import InterviewController from "../controllers/InterviewController";
export const interviewRouter = createTRPCRouter({

  createInterview: publicProcedure
  .query(async({input})=>{

  }),

  getAIResponse: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(async ({ input }) => {
      await InterviewController.getNextQuestion(input.text)
    }),


  convertText2Speech: publicProcedure
    .input(z.object({ response: z.string() }))
    .query(async ({ input }) => {

    })



});