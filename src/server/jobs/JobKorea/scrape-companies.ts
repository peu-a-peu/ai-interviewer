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

type CompanyScraperConstructor = {
    batchSize: number;
    pageStart: number;
    pageEnd: number;
    masterBatch: number;
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

    getUrl(page: number) {
        return `https://www.jobkorea.co.kr/starter/Review?FavorCo_Stat=0&G_ID=0&OrderBy=11&Page=${page}`
    }

    callApi(page: number) {
        const url = this.getUrl(page)
        return axios.get(url,{
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        })
    }

    batchCalls(pageStart: number, pageEnd: number) {
        let promises = []
        for (let i = pageStart; i <= pageEnd; i++) {
            promises.push(this.callApi(i))
        }
        return promises;
    }


    cheerioExtractor(html: string) {
        const $ = cheerio.load(html)

        const data: NewCompany[] = []
        const reviews:any  = $(".reviewWrap li:nth-child(2) .num")
        $("div.coWrap").each((index, element) => {
            const $ele = $(element);
            let id: any = $ele.find("a.inner").attr("href")?.match(/[?&]C_Idx=(\d+)/)?.[1]
            let metadata;
            if (id) {
                id = parseInt(id)
                metadata = {
                    sourceCompanyId: id,
                    totalQuestions: $(reviews[index]).text()
                }
            }

            const obj = {
                company_id: ulid(),
                logo: $ele.find(".logo img").attr("src"),
                company_name: $ele.find("strong.co").text(),
                metadata
            }
            if (obj.logo) {
                obj.logo = "https:" + obj.logo
            }
            data.push(obj)
        })
        return data;
    }

    async saveToDB(records: NewCompany[]) {
        await db.insert(company).values(records)
    }

    async run() {
        let batchNo = 1
        try {
            console.log(`-------------RUNNING COMPANY SCRAPER JOB MasterBatch : ${this.masterBatch} starts ${this.pageStart} ends ${this.pageEnd} -------------`)
            for (let i = this.pageStart; i <= this.pageEnd; i += this.batchSize) {
                const data: NewCompany[] = []
                console.log(`-------- ON BATCH : ${batchNo} ---------`)
                const promises = await this.batchCalls(i, Math.min(i + this.batchSize - 1, this.pageEnd))
                const results = await Promise.all(promises)
                for (let result of results) {
                    const html = result?.data || ""
                    data.push(...this.cheerioExtractor(html))
                }
                if (data.length) {
                    await this.saveToDB(data)
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
    const pageStart = 1, pageEnd = 130, masterBatchSize = 40
    let masterBatch = 1
    for (let i = pageStart; i <= pageEnd; i += masterBatchSize) {
        const scraper = new CompanyScraper({
            pageStart: i,
            pageEnd: Math.min(i + masterBatchSize - 1, pageEnd),
            batchSize: 5,
            masterBatch
        })
        await scraper.run()
        await wait(15000)
        masterBatch++
    }
}


pageStart()