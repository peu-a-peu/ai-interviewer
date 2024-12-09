import CompanyRepository from "../repostitory/CompanyRepository"
import QuestionsRepository from "../repostitory/QuestionRepository"

class CompanyService {

    static async searchCompaniesByName(key: string, limit: number, country:string) {
        return await CompanyRepository.searchCompanies(key, limit, country)
    }

    static async getAllRolesForCompany(companyId:string){
        return await QuestionsRepository.getDistinctRolesForCompany(companyId)
    }

    static async getCompanyById(companyId:string){
        return await CompanyRepository.getCompanyById(companyId)
    }
}

export default CompanyService