import { execSync } from 'child_process';

const args = process.argv.slice(2)!;
const name = args.find(arg=>arg.startsWith('name='))?.split("=")?.[1]||""
const src = args.find(arg=>arg.startsWith('src='))?.split("=")?.[1]||""

const sources:Record<string,number> = {
  JobKorea: 1,
  Glassdoor: 1
}
if(!src || !sources[src]){
  console.log('Invalid src')
  process.exit(1)
}
const jobMapping:Record<string,string> = {
  ScrapeCompanies: `src/server/jobs/${src}/scrape-companies.ts`,
  ScrapeQuestions: `src/server/jobs/${src}/scrape-questions.ts`,
  FineTune: `src/server/jobs/${src}/fine-tune-script.ts`,
};

if (jobMapping[name]) {
  execSync(`tsx ${jobMapping[name]}`, { stdio: 'inherit' });
} else {
  console.error('Job name not recognized.');
  process.exit(1);
}
