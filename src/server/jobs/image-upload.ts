import axios, { Axios, AxiosResponse } from 'axios';
import { db } from '../db';
import { company } from '../db/schema';
import SupabaseStorage from '../libs/storage';
import { asc, eq } from 'drizzle-orm';
import { SUPABASE_BUCKETS } from '../constants/constant';
import { Company } from '../interfaces/drizzle';

class ImageUpload {
    private supabaseStorage: SupabaseStorage;
    private batchSize: number;

    constructor(batchSize = 2) {
        this.supabaseStorage = new SupabaseStorage();
        this.batchSize = batchSize;
    }

    private async fetchBatch(offset: number): Promise<Company[]> {
        return db.select()
            .from(company)
            .where(eq(company.is_processed, false))
            .orderBy(asc(company.company_id))
            .limit(this.batchSize)
            .offset(offset);
    }

    private async getImage(url: string): Promise<AxiosResponse> {
        return axios.get(url, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0',
            },
        });
    }

    private async uploadImageToSupabase(companyId: string, fileBuffer: Blob | Buffer) {
        if (!fileBuffer) {
            return Promise.resolve(null)
        }
        const filePath = `${companyId}.png`;
        return this.supabaseStorage.uploadFile(SUPABASE_BUCKETS.COMPANY_LOGOS, filePath, fileBuffer);
    }

    private async updateLogoUrl(companyId: string, newUrl: string) {
        return db.update(company)
            .set({ logo: newUrl, is_processed: true })
            .where(eq(company.company_id, companyId));
    }

    private async wait(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public async processLogos() {
        console.log(`---------- started logo processing job -----------`)
        let offset = 0;
        let hasMore = true;

        while (hasMore) {
            const companiesBatch: Company[] = await this.fetchBatch(offset);
            if (companiesBatch.length === 0) {
                hasMore = false;
                break;
            }
            const images = companiesBatch.map((item) => item.logo)
            console.log({ images })
            const imageFetchPromises = companiesBatch.map((item) =>
                item.logo ? this.getImage(item.logo) : Promise.resolve(null)
            );

            // Fetch all images concurrently
            const imageResponses = await Promise.allSettled(imageFetchPromises);
            const uploadPromises = imageResponses.map((item, index) => {
                if (item.status == 'fulfilled') {
                    const data = item.value?.data
                    console.log({ data })
                    if (!data) return null;
                    let buffer = Buffer.from(data, 'binary')
                    return this.uploadImageToSupabase(companiesBatch[index]!.company_id, buffer)
                } else {
                    return null
                }

            })

            // Await all upload operations
            const uploadResponses = await Promise.all(uploadPromises);
            hasMore = false
            console.log({ uploadResponses })
        }

        offset += this.batchSize;
        await this.wait(5000); // Wait 5 seconds before the next batch
        console.log('------------- All logos have been processed. --------------');
    }

}

try {
    const imgupload = new ImageUpload()
    imgupload.processLogos()
} catch (err) {
    console.log({ E: err })
    process.exit(1)
}
