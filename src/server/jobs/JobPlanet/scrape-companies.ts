import { db } from "@/server/db";
import { company } from "@/server/db/schema/company";
import { NewCompany } from "@/server/interfaces/drizzle";
import { wait } from "@/utils/util";
import * as cheerio from "cheerio"
import { ulid } from "ulidx";
import puppeteer from "puppeteer-extra"
import StealthPlugin from "puppeteer-extra-plugin-stealth"

puppeteer.use(StealthPlugin())
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
        return `https://www.jobplanet.co.kr/companies?industry_id=700&page=${page}`
    }

    async callApi(pageNo: number) {
        const url = this.getUrl(pageNo)

        const browser = await puppeteer.launch({headless:true});
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000, });

        // Perform your scraping logic here
        const content = await page.content(); // You can extract data or just save it
        console.log(`Scraped content from: ${url}`);
        await browser.close();
        return content; // Return content or any other data you want to process

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
        $("section.company").each((index, element) => {
            const $ele = $(element);
            let id: any = $ele.find(".llogo").attr("href")?.match(/\/companies\/(\d+)/)?.[1]
            console.log({id})
            id = id ? parseInt(id) : id
            let metadata;
            metadata = {
                source: "JobPlanet",
                ...id && { sourceCompanyId: id }
            }

            const obj = {
                company_id: ulid(),
                logo: $ele.find(".llogo img").attr("src"),
                company_name: $ele.find(".us_titb_l3 a").text()?.replaceAll('(주)', ''),
                metadata,
                country:"kr"
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
                    const html = result || ""
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
            throw err
        }

    }

}

async function pageStart() {
    const pageStart = 610, pageEnd = 622, masterBatchSize = 50
    let masterBatch = 1
    for (let i = pageStart; i <= pageEnd; i += masterBatchSize) {
        const scraper = new CompanyScraper({
            pageStart: i,
            pageEnd: Math.min(i + masterBatchSize - 1, pageEnd),
            batchSize: 10,
            masterBatch
        })
        await scraper.run()
        await wait(15000)
        masterBatch++
    }
}


pageStart()