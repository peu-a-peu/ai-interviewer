import { db } from "@/server/db";
import { company } from "@/server/db/schema/company";
import { NewCompany } from "@/server/interfaces/drizzle";
import { wait } from "@/utils/util";
import axios from "axios";
import * as cheerio from "cheerio"
import { sql } from "drizzle-orm";
import { ulid } from "ulidx";


/*
pageStart - page no to start with
pageEnd - the last page to go
batchSize - number of pages to process in a batch
masterBatch - batch that allows higher wait time to prevent IP from getting disabled
*/

const CSRF_TOKEN = process.env.GLASSDOOR_CSRF_TOKEN
type CompanyScraperConstructor = {
    batchSize: number;
    pageStart: number;
    pageEnd: number;
    masterBatch: number;
}
interface TempData {
    id?: string;
    bestProfileId?: string;
    logo?: string;
    name: string;
}
export class CompanyScraper {
    batchSize: number;
    pageStart: number;
    pageEnd: number;
    masterBatch: number;

    constructor({ batchSize, pageStart, pageEnd, masterBatch }: CompanyScraperConstructor) {
        this.batchSize = batchSize
        this.pageStart = pageStart
        this.pageEnd = pageEnd
        this.masterBatch = masterBatch
    }


    callApi(page: number) {
        return axios.post("https://www.glassdoor.co.in/graph", [
            {
                "operationName": "ExplorerEmployerSearchGraphQuery",
                "variables": {
                    "employerSearchRangeFilters": [
                        {
                            "filterType": "RATING_OVERALL",
                            "maxInclusive": 5,
                            "minInclusive": 3.5
                        }
                    ],
                    "industries": [
                        {
                            "id": 200063
                        }
                    ],
                    "jobTitle": "",
                    "location": {
                        "locationId": 1,
                        "locationType": "N"
                    },
                    "pageRequested": page,
                    "preferredTldId": 4,
                    "sGocIds": [
                        1018
                    ],
                    "sectors": []
                },
                "query": "query ExplorerEmployerSearchGraphQuery($employerSearchRangeFilters: [EmployerSearchRangeFilter], $industries: [IndustryIdent], $jobTitle: String, $location: UgcSearchV2LocationIdent, $pageRequested: Int, $preferredTldId: Int, $sGocIds: [Int], $sectors: [SectorIdent]) {\n  employerSearchV2(\n    employerSearchRangeFilters: $employerSearchRangeFilters\n    industries: $industries\n    jobTitle: $jobTitle\n    location: $location\n    pageRequested: $pageRequested\n    preferredTldId: $preferredTldId\n    sGocIds: $sGocIds\n    sectors: $sectors\n  ) {\n    employerResults {\n      demographicRatings {\n        category\n        categoryRatings {\n          categoryValue\n          ratings {\n            overallRating\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      employer {\n        bestProfile {\n          id\n          __typename\n        }\n        id\n        shortName\n        ratings {\n          overallRating\n          careerOpportunitiesRating\n          compensationAndBenefitsRating\n          cultureAndValuesRating\n          diversityAndInclusionRating\n          seniorManagementRating\n          workLifeBalanceRating\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    numOfPagesAvailable\n    numOfRecordsAvailable\n    __typename\n  }\n}\n"
            }
        ], { headers: { "gd-csrf-token": CSRF_TOKEN } })

    }

    async getLogos(data: TempData[]):Promise<string[]> {
        const res = await axios.post("https://www.glassdoor.co.in/graph",
            data.map((item: any) => ({
                "operationName": "ExplorerEmployerResultsGraphQuery",
                "variables": {
                    "employerProfileId": item.bestProfileId,
                    "id": item.id,
                    "shortName": item.name,
                    "locationId": 1,
                    "locationType": "N"
                },
                "query": "query ExplorerEmployerResultsGraphQuery($employerProfileId: Int, $id: Int!, $locationId: Int, $locationType: String, $shortName: String) {\n  EmployerLocations: employerOfficeLocation(\n    employer: {id: $id, name: $shortName}\n    locationId: $locationId\n    locationType: $locationType\n  ) {\n    eiOfficesLocationUrl\n    officeAddresses {\n      addressLine1\n      addressLine2\n      administrativeAreaName1\n      cityName\n      id\n      officeLocationId\n      __typename\n    }\n    __typename\n  }\n  EmployerReviews: employerReviewsRG(\n    employerReviewsInput: {employer: {id: $id}, dynamicProfileId: $employerProfileId}\n  ) {\n    allReviewsCount\n    employer {\n      headquarters\n      id\n      counts {\n        globalJobCount {\n          jobCount\n          __typename\n        }\n        __typename\n      }\n      links {\n        overviewUrl\n        reviewsUrl\n        salariesUrl\n        __typename\n      }\n      overview {\n        description\n        __typename\n      }\n      primaryIndustry {\n        industryId\n        __typename\n      }\n      shortName\n      sizeCategory\n      squareLogoUrl\n      __typename\n    }\n    ratings {\n      overallRating\n      careerOpportunitiesRating\n      compensationAndBenefitsRating\n      cultureAndValuesRating\n      diversityAndInclusionRating\n      seniorManagementRating\n      workLifeBalanceRating\n      __typename\n    }\n    __typename\n  }\n  EmployerSalary: aggregatedSalaryEstimates(\n    aggregatedSalaryEstimatesInput: {employer: {id: $id}, location: {}}\n  ) {\n    salaryCount\n    __typename\n  }\n}\n"
            })),
            { headers: { "gd-csrf-token": CSRF_TOKEN } })
        return res.data.map((item: any) => item.data.EmployerReviews.employer.squareLogoUrl)
    }

    batchCalls(pageStart: number, pageEnd: number) {
        let promises = []
        for (let i = pageStart; i <= pageEnd; i++) {
            promises.push(this.callApi(i))
        }
        return promises;
    }




    async saveToDB(records: NewCompany[]) {
        await db.insert(company).values(records)
    }

    async run() {
        let batchNo = 1
        try {
            console.log(`-------------RUNNING COMPANY SCRAPER JOB MasterBatch : ${this.masterBatch} starts ${this.pageStart} ends ${this.pageEnd} -------------`)
            for (let i = this.pageStart; i <= this.pageEnd; i += this.batchSize) {
                const data: TempData[] = []
                console.log(`-------- ON BATCH : ${batchNo} ---------`)
                const promises = await this.batchCalls(i, Math.min(i + this.batchSize - 1, this.pageEnd))
                const results = await Promise.all(promises)
                for (let result of results) {
                    const records = result?.data?.[0]?.data?.employerSearchV2?.employerResults || []
                    records.forEach(({ employer }: any) => {
                        data.push({ id: employer.id, name: employer.shortName, bestProfileId: employer.bestProfile.id })
                    })
                }
                const logos = await this.getLogos(data)
                const finalData: NewCompany[] = data.map((item,index) => ({ company_id: ulid(), company_name: item.name, logo: logos[index], metadata:{source:"Glassdoor"},country:"us"}))
                if (finalData.length) {
                    await this.saveToDB(finalData)
                } else {
                    console.warn(`-------- SOMETHING WRONG AS FINISHED BATCH : ${batchNo} with 0 items ---------`)
                }
                console.log(`-------- FINISHED BATCH : ${batchNo} ---------`)
                batchNo++
                await wait(5000)
            }
            console.log(`-------------FINISHED COMPANY SCRAPER JOB MasterBatch : ${this.masterBatch} -------------`)
        } catch (err) {
            console.log(`------------ FAILED AT BATCH ${batchNo} of masterBatch ${this.masterBatch}------------------`)
            console.log(err)
        }

    }

}

async function pageStart() {
    const pageStart = 1, pageEnd = 80, masterBatchSize = 1
    let masterBatch = 1
    for (let i = pageStart; i <= pageEnd; i += masterBatchSize) {
        const scraper = new CompanyScraper({
            pageStart: i,
            pageEnd: Math.min(i + masterBatchSize - 1, pageEnd),
            batchSize: 5,
            masterBatch
        })
        await scraper.run()
        await wait(2000)
        masterBatch++
    }
}


pageStart()