import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { prompt, question, conversation, interview, company } from '../db/schema';
export type Company = InferSelectModel<typeof company> & { metadata: Record<string, any>  | undefined };
export type NewCompany = InferInsertModel<typeof company> & { metadata?: Record<string, any> | undefined};
export type Question = InferSelectModel<typeof question>;
export type NewQuestion = InferInsertModel<typeof question>;
export type Interview = InferSelectModel<typeof interview>;
export type NewInterview = InferInsertModel<typeof interview>;
export type Conversation = InferSelectModel<typeof conversation>;
export type NewConversation = InferInsertModel<typeof conversation>;
export type NewPrompt = InferInsertModel<typeof prompt>;
export type Prompt = InferInsertModel<typeof prompt>;

