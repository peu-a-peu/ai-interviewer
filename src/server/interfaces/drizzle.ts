import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { company } from '../db/schema/company';
import { question } from '../db/schema';
import { conversation } from '../db/schema/conversation';
import { interview } from '../db/schema/interview';
export type Company = InferSelectModel<typeof company> & { metadata: Record<string, any>  | undefined };
export type NewCompany = InferInsertModel<typeof company> & { metadata: Record<string, any> | undefined};
export type Question = InferSelectModel<typeof question>;
export type NewQuestion = InferInsertModel<typeof question>;
export type Interview = InferSelectModel<typeof interview>;
export type NewInterview = InferInsertModel<typeof interview>;
export type Conversation = InferSelectModel<typeof conversation>;
export type NewConversation = InferInsertModel<typeof conversation>;

