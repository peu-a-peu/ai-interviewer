import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

export type OpenAIMessageRole = "user"|"function"|"assistant"|"system" 

export interface SystemPromptInput {
    companyName:string;
    employmentType:string;
    interviewType:string;
    employeeName:string;
    questions:string[];
    position:string;
    previousQuestionAnswers?:Record<string,string>[];
}

export interface GetOpenAiResponseParam{
    prompt:string;
    role:OpenAIMessageRole;
    messageContext:ChatCompletionMessageParam[];
}