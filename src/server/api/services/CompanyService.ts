import CompanyRepository from "../repostitory/CompanyRepository"
import QuestionsRepository from "../repostitory/QuestionRepository"

class CompanyService {

    static async searchCompaniesByName(key: string, limit: number) {
        return await CompanyRepository.searchCompanies(key, limit)
    }

    static async getAllRolesForCompany(companyId:string){
        return await QuestionsRepository.getDistinctRolesForCompany(companyId)
    }
}

export default CompanyService