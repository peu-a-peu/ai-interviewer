import CompanyService from "../services/CompanyService";

class CompanyController {

    static async searchCompany(search:string, country:string){
        return await CompanyService.searchCompaniesByName(search, 20, country)
    }

    static async getCompanyRoles(search:string){
        return await CompanyService.getAllRolesForCompany(search)
    }

    static async getCompanyById(id:string){
        return await CompanyService.getCompanyById(id)
    }
}

export default CompanyController;