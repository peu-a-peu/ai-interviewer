import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

export type OpenAIMessageRole = "user"|"function"|"assistant"|"system" 

export interface InterviewInput{
    name:string;
    experience?:number;
    interview_type?:string;
    resume_summary?:string;
    position?:string;
}
export interface SystemPromptInput extends InterviewInput {
    questions?:string[];
    created_at?:Date;
}

export interface GetOpenAiResponseParam{
    prompt:string;
    role:OpenAIMessageRole;
    messageContext?:ChatCompletionMessageParam[];
}
export type EvaluationResponse = {
    candidate_name:string | null;
    position:string | null;
    feedback:string;
}