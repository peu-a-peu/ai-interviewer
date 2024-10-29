import { ChatCompletionContentPartText, ChatCompletionMessageParam } from "openai/resources/index.mjs";

export type OpenAIMessageRole = "user"|"function"|"assistant"|"system" 

export interface InterviewInput{
    experience?:number;
    interview_type?:string;
    resume_summary?:string;
    position?:string;
}
export interface SystemPromptInput extends InterviewInput {
    questions?:string[];
    created_at?:Date;
}

export type OpenAIContent = string | Array<ChatCompletionContentPartText>;

export interface GetOpenAiResponseParam{
    prompt:OpenAIContent;
    role:OpenAIMessageRole;
    messageContext?:ChatCompletionMessageParam[];
}