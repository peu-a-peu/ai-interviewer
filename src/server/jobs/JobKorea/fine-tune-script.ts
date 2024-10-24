import * as dotenv from "dotenv"
dotenv.config()
import { db } from "@/server/db";
import { company, question } from "@/server/db/schema";
import { sql } from "drizzle-orm";
import fs from "fs"
import path, { dirname } from "path"
import { fileURLToPath } from "url";
import { env } from "@/env";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const outputFilePath = path.join(__dirname, 'finetune.jsonl');
const companyId = '01J9JMH0X49GV2WPTDNFA234GM'

  async function execute(){
    const jsonlLines:any[] = [];
    const records = await db.select().from(question).where(sql`company_id=${companyId}`)
    const companyDetails = (await db.select({
        name: company.company_name
    }).from(company).where(sql`company_id=${companyId}`))[0]

    let obj:Record<string,string[]> = {}
    records.forEach(({question,experience_level,position,interview_type})=>{
        if(!position){
            return;
        }
        const key = `${position?.trim()}%${interview_type?.trim()}%${experience_level?.trim()}`
        if(obj[key]){
            obj[key].push(question)
        }else{
            obj[key] = [question]
        }
    })
    Object.keys(obj).forEach(item => {
        let sp = item.split("%")
        const jsonlEntry = {
          messages: [
            {
              role: "system",
              content:`당신은 ${companyDetails?.name}의 ${sp[0]} 직군에 지원한 지원자를 인터뷰 해야하는 면접관입니다. 지원자는 ${sp[2]} 포지션으로 지원했고 이 면접은 ${sp[1]} 입니다. 아래는 당신이 참고할 수 있는 질문 목록입니다`
            },
            {
              role:"assistant",
              content: obj[item]!.map((el,index)=>`${index+1}. ${el}`)
            }
          ]
        };
        
        jsonlLines.push(JSON.stringify(jsonlEntry));
      });
      fs.writeFile(outputFilePath, jsonlLines.join('\n'), 'utf8', (err:any) => {
        if (err) {
          console.error('Error writing the JSONL file:', err);
        } else {
          console.log('JSONL file created successfully:', outputFilePath);
        }
      });
    
  }

  execute()


