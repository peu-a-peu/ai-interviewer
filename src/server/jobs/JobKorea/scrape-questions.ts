import { db } from "@/server/db";
import { question } from "@/server/db/schema";
import { company } from "@/server/db/schema/company";
import { Company, NewQuestion } from "@/server/interfaces/drizzle";
import { wait } from "@/utils/util";
import axios from "axios";
import * as cheerio from "cheerio"
import { sql } from "drizzle-orm";
import { ulid } from "ulidx";



const PAGE_SIZE = 30
type CompanyScraperConstructor = {
    batchSize: number;
    start: number;
}
export class QuestionScraper {
    batchSize: number;
    start: number;
    currentCompany: Company | undefined;
    questionScanned: number;


    constructor({ batchSize, start }: CompanyScraperConstructor) {
        this.batchSize = batchSize
        this.start = start
        this.currentCompany = undefined
        this.questionScanned = 0
    }

    async getCompany() {
        return await db.select()
            .from(company)
            .where((company) => sql`${company.is_processed} = false`)
            .orderBy(sql`(metadata->>'sourceCompanyId')::int asc`)
            .limit(1) as Company[]

    }

    getUrl(page: number) {
        return `https://www.jobkorea.co.kr/starter/Review/view?C_Idx=${this.currentCompany?.metadata?.sourceCompanyId}&Ctgr_Code=5&Vpage=${page}`
    }

    callApi(page: number) {
        const url = this.getUrl(page)
        console.log(url)
        return axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        })
    }

    batchCalls(start: number, end: number) {
        let promises = []
        for (let i = start; i <= end; i++) {
            promises.push(this.callApi(i))
        }
        return promises;
    }

    cheerioExtractor(html: string) {
        const $ = cheerio.load(html)
        const data: NewQuestion[] = []
        $(".qusList>li>.items").each((_, item) => {
            const ele = $(item)
            const title = ele.find(".tit").text().trim().split('-')
            data.push({
                question_id: ulid(),
                company_id: this.currentCompany?.company_id,
                experience_level: ele.find(".sCateWrap .item:nth-child(2)").text().trim(),
                interview_type: title[0]?.trim(),
                position: title[1]?.trim(),
                question: ele.find(".tx").text().trim()
            })
        })
        console.log({"Questions Found": data.length})
        return data;
    }

    async saveToDB(records: NewQuestion[]) {
        await db.insert(question).values(records)

    }

    async updateCompanyWhenDone() {
        await db.update(company).set({ is_processed: true, updated_at: new Date() }).where(sql`company_id=${this.currentCompany?.company_id}`)
    }
    async run() {
        let batchNo = 1
        try {
            const result = await this.getCompany()
            if (result[0]) {
                this.currentCompany = result[0]
            } else {
                console.log(`---------- NO RECORDS TO FETCH : FINISHING JOB ----------------`)
                return false;
            }
            console.log(`-------------RUNNING QUESTION SCRAPER JOB FOR company : ${this.currentCompany?.company_id} original id: ${this.currentCompany?.metadata?.sourceCompanyId} -------------`)
            let hasPages = true
            while (hasPages) {
                const data: NewQuestion[] = []
                console.log(`-------- ON BATCH : ${batchNo} ---------`)
                const totalQuestions = parseInt(this.currentCompany?.metadata?.totalQuestions || '0')
                let end = Math.min(Math.ceil((totalQuestions - this.questionScanned)/PAGE_SIZE), this.batchSize)
                const promises = await this.batchCalls(this.start, this.start + end - 1)
                const results = await Promise.all(promises)
                for (let result of results) {
                    const html = result?.data || ""
                    const records = this.cheerioExtractor(html)
                    data.push(...records)
                    if(!records.length || records.length < PAGE_SIZE){
                        hasPages = false
                        break;
                    }
                }
                if (data.length) {
                    await this.saveToDB(data)
                    this.questionScanned+=data.length
                    if(this.questionScanned>=totalQuestions){
                        hasPages = false
                    }
                    await wait(1000 + end*1000)
                } else {
                    console.warn(`-------- SOMETHING WRONG AS FINISHED BATCH : ${batchNo} with 0 items ---------`)
                    hasPages = false
                }
                console.log(`-------- FINISHED BATCH : ${batchNo} ---------`)
                batchNo++
                this.start+=end
               
            }

            this.updateCompanyWhenDone()
            console.log(`-------------FINISHED QUESTION SCRAPER JOB FOR company : ${this.currentCompany?.company_id} original id: ${this.currentCompany?.metadata?.sourceCompanyId} -------------`)
            return true;
        } catch (err) {
            console.log(`------------ FAILED AT BATCH ${batchNo} of QUESTION SCRAPER JOB FOR company  ${this.currentCompany?.company_id} original id: ${this.currentCompany?.metadata?.sourceCompanyId} ------------------`)
            console.log(err)
            return false
        }

    }

}

async function start() {
    let isRunning = true
    while (isRunning) {
        let scraper = new QuestionScraper({ start: 1, batchSize: 5 })
        isRunning = await scraper.run()
        await wait(2000)
    }
}


start()