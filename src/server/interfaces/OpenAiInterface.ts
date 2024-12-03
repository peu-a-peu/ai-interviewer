import { ChatCompletionContentPartText, ChatCompletionMessageParam } from "openai/resources/index.mjs";

export type OpenAIMessageRole = "user"|"function"|"assistant"|"system" 

export interface InterviewInput{
    name:string;
    experience?:number;
    interview_type?:string;
    resume_summary?:string;
    position?:string;
    language:string;
}
export interface SystemPromptInput extends InterviewInput {
    created_at?:Date;
}

export type OpenAIContent = string | Array<ChatCompletionContentPartText>;

export interface GetOpenAiResponseParam{
    prompt:OpenAIContent;
    role:OpenAIMessageRole;
    messageContext?:ChatCompletionMessageParam[];
}
export type EvaluationResponse = {
    candidate_name:string | null;
    position:string | null;
    feedback:string;
}