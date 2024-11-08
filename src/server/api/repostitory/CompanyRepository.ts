import { db } from "@/server/db";
import { company } from "@/server/db/schema";
import { CompanyFromSearch } from "@/server/interfaces/company";
import { and, eq, ilike } from "drizzle-orm";

class CompanyRepository {

    static async searchCompanies(key: string, limit: number, country:string):Promise<CompanyFromSearch[]> {
        return await db.select({
            company_id: company.company_id,
            company_name: company.company_name,
            logo: company.logo
        }).from(company).where(and(ilike(company.company_name, `${key}%`),eq(company.country, country))).limit(limit)
    }

}
export default CompanyRepository;