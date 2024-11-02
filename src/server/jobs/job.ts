import { execSync } from 'child_process';

const args = process.argv.slice(2)!;
const name = args.find(arg => arg.startsWith('name='))?.split("=")?.[1] || ""
const src = args.find(arg => arg.startsWith('src='))?.split("=")?.[1] || ""
const sources: Record<string, number> = {
  JobKorea: 1,
  Glassdoor: 1
}

const jobMapping: Record<string, Record<string, any>> = {
  ScrapeCompanies: {
    path: `src/server/jobs/${src}/scrape-companies.ts`,
    needSrc: true
  },
  ScrapeQuestions: {
    path: `src/server/jobs/${src}/scrape-questions.ts`,
    needSrc: true
  },
  FineTune: {
    path: `src/server/jobs/${src}/fine-tune-script.ts`,
    needSrc: true
  },
  ImageUpload: {
    path:`src/server/jobs/image-upload.ts`
  }
};

const job = jobMapping[name]
if (job) {
  if (job.needSrc && !sources[src]) {
    console.log('Invalid src')
    process.exit(1)
  }
  execSync(`tsx ${job.path}`, { stdio: 'inherit' });
} else {
  console.error('Job name not recognized.');
  process.exit(1);
}
