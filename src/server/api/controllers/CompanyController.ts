import CompanyService from "../services/CompanyService";

class CompanyController {

    static async searchCompany(search:string, country:string){
        return await CompanyService.searchCompaniesByName(search, 20, country)
    }

    static async getCompanyRoles(search:string){
        return await CompanyService.getAllRolesForCompany(search)
    }
}

export default CompanyController;