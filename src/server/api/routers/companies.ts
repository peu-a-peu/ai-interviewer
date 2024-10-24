import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import CompanyController from "../controllers/CompanyController";
export const companyRouter = createTRPCRouter({

    searchCompanyByName: publicProcedure
        .input(z.object({
            search: z.string()
        }).strict())
        .query(async ({ input }) => {
            return await CompanyController.searchCompany(input.search)
        }),

    getAllCompanyRoles: publicProcedure
        .input(z.object({
            companyId: z.string()
        }).strict())
        .query(async ({ input }) => {
            return await CompanyController.getCompanyRoles(input.companyId)
        }),
})