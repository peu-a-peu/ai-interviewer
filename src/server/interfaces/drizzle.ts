import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { company } from '../db/schema/company';
import { question } from '../db/schema';
export type Company = InferSelectModel<typeof company> & { metadata: Record<string, any>  | undefined };
export type NewCompany = InferInsertModel<typeof company> & { metadata: Record<string, any> | undefined};
export type Question = InferSelectModel<typeof question>;
export type NewQuestion = InferInsertModel<typeof question>;
