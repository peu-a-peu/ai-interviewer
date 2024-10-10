import { execSync } from 'child_process';

const args = process.argv.slice(2)!;
const name = args.find(arg=>arg.startsWith('name='))?.split("=")?.[1]||""
const jobMapping:Record<string,string> = {
  ScrapeCompanies: 'src/server/jobs/JobKorea/scrape-companies.ts',
  ScrapeQuestions: 'src/server/jobs/JobKorea/scrape-questions.ts',
  FineTune: 'src/server/jobs/JobKorea/fine-tune-script.ts',
};

if (jobMapping[name]) {
  execSync(`tsx ${jobMapping[name]}`, { stdio: 'inherit' });
} else {
  console.error('Job name not recognized.');
  process.exit(1);
}
