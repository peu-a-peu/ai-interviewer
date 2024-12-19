import { env } from "@/env";
import { InterviewInput, SystemPromptInput } from "../interfaces/OpenAiInterface";
import PromptService from "../api/services/PromptService";
import { DEFAULT_BASE_PROMPT } from "../constants/constant";
import { QuestionOutput } from "../interfaces/question";

function candiatePrompt(promptVariables: InterviewInput) {
    let prompt = ""
    const { experience, position, resume_summary, interview_type, name } = promptVariables
    prompt += " Here's candidate profile: "
    if (name) {
        prompt += `candidate name is ${name}`
    }
    if (experience) {
        prompt += ` candiate has ${experience} years of experience,`
    }
    if (position) {
        prompt += ` candiate is applying for the role of ${position},`
    }
    if (interview_type) {
        prompt += ` this is a ${interview_type} interview`
    }
    if (resume_summary) {
        prompt += `\n Here's the resume summary of the candiate. You can use it to frame tailored questions.\n`
        prompt += resume_summary
    }

    return prompt
}

export function languagePrompt(language: string) {
    return ` YOU ARE STRICTLY ADVISED TO KEEP CONVERSATION IN ${language} ONLY`
}

export function questionsPrompt(questions: QuestionOutput[]) {
    let prompt = "\n These are the questions that you have to ask the candidate."
    questions.forEach(({ question}, index) => {
        prompt += `\n ${index + 1}.${question}{id:${index+1}}`
    })
    return prompt;
}
export async function getSystemPrompt(promptVariables: SystemPromptInput): Promise<string> {
    const { created_at, language, position, interview_type } = promptVariables
    let [prompt = "", specialPrompt] = await PromptService.getPromptByPosition(position!, interview_type)
    prompt += specialPrompt || ""
    if (!prompt) {
        prompt += DEFAULT_BASE_PROMPT
    }
    prompt += candiatePrompt(promptVariables)

    if (created_at) {
        let mins: number = Math.floor((new Date().valueOf() - new Date(created_at).valueOf()) / 60000)
        prompt += ` \n It has been ${mins} minutes since the interview started.`
    }
    if (promptVariables.questions && promptVariables.questions.length) {
        prompt += questionsPrompt(promptVariables.questions)
    }
    prompt += languagePrompt(language)
    return prompt
}


export async function evaluationPrompt(promptVariables: InterviewInput) {
    let prompt = await PromptService.getPromptById('FEEDBACK_PROMPT')
    prompt += languagePrompt(promptVariables.language)
    return prompt
}