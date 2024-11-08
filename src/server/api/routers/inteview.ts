import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

import InterviewController from "../controllers/InterviewController";
import { TRPCError } from "@trpc/server";
export const interviewRouter = createTRPCRouter({

  createInterview: publicProcedure
    .input(z.object({
      candidate_name: z.string(),
      company_id: z.string(),
      position: z.string().optional(),
      interview_type: z.string().optional(),
      experience: z.number().optional(),
      resume_summary: z.string().optional(),
      category: z.string().optional()
    }).strict())
    .query(async ({ input, ctx }) => {
      const res = await InterviewController.createInterview({ interview_id: "", ...input })
      return res?.interview_id
    }),


  closeInterview: publicProcedure
    .input(z.object({ interviewId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const interview_id = input.interviewId || ctx.headers.get('interview-id')
      if (!interview_id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Interview id is not present"
        })
      }

      return await InterviewController.closeInterview(interview_id)
    }),

  evaluateAnswers: publicProcedure
    .input(z.object({ interviewId: z.string() }))
    .query(async ({ input }) => {
      return await InterviewController.evaluateAnswers(input.interviewId)
    })

});