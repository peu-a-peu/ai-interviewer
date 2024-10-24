import { db } from "@/server/db";
import { company } from "@/server/db/schema";
import { CompanyFromSearch } from "@/server/interfaces/company";
import { eq, like } from "drizzle-orm";

class CompanyRepository {

    static async searchCompanies(key: string, limit: number):Promise<CompanyFromSearch[]> {
        return await db.select({
            company_id: company.company_id,
            company_name: company.company_name
        }).from(company).where(like(company.company_name, `%${key}%`)).limit(limit)
    }

}
export default CompanyRepository;