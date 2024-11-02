import { env } from "@/env";
import { StorageClient } from '@supabase/storage-js'
class SupabaseStorage {

    private client: StorageClient;

    constructor() {
        console.log({env})
        this.client = new StorageClient(env.SUPABASE_STORAGE_URL, {
            apikey: env.SUPABASE_STORAGE_API_KEY,
            Authorization: `Bearer ${env.SUPABASE_STORAGE_API_KEY}`,
        })
    }

    async uploadFile(bucketName: string, filePath: string, file: File | Buffer | Blob | string) {
        const { data, error } = await this.client.from(bucketName).upload(filePath, file);
        if (error) {
            console.log({error})
           throw error;
        }
        return data;
    }

}


export default SupabaseStorage;