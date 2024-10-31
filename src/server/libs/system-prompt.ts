import { env } from "@/env";
import { InterviewInput, SystemPromptInput } from "../interfaces/OpenAiInterface";
import PromptService from "../api/services/PromptService";

const PROMPT_KEYS:Record<string,string> = {
    default:"DEFAULT_SYSTEM_PROMPT",
    pm:"PM_SYSTEM_PROMPT"
}
function candiatePrompt(promptVariables: InterviewInput) {
    let prompt = ""
    const { experience, position, resume_summary, interview_type } = promptVariables
    prompt += "Here' more info about the candidate: "
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
        prompt += `\n Here's the resume summary of the candiate. \n`
        prompt += resume_summary
    }

    return prompt
}

export function languagePrompt() {
    const language = env.AI_LANGUAGE || 'ENGLISH'
    return ` YOU ARE STRICTLY ADVISED TO KEEP CONVERSATION IN ${language} ONLY`
}
export async function getSystemPrompt(promptVariables: SystemPromptInput, key?:string) {

    const { questions, created_at } = promptVariables
    let mappedKey = PROMPT_KEYS[key||"default"] || PROMPT_KEYS["default"] as string
    let prompt = await PromptService.getPromptByKey(mappedKey)

    prompt += candiatePrompt(promptVariables)

    if (questions?.length) {
        prompt += `\n These are the few questions you can ask to candidate. \n`
        prompt += questions.map((item, index) => `${index + 1}. ${item}`).join(`\n`)
    }
    if(created_at){
        let mins:number = Math.floor((new Date(created_at).valueOf() - new Date().valueOf())/60000)
        prompt+=`It has been ${mins} since the interview started.`
     }
 

    prompt += languagePrompt()

    return prompt
}


export function evaluationPrompt(promptVariables: InterviewInput) {
    let prompt = `As an AI interviewer you now have to evaluate the candiate responses and provide a summary with specific feedback on strengths and areas for improvement. Use "you" in your feedback to keep it direct and constructive`
    prompt += candiatePrompt(promptVariables)
    prompt += languagePrompt()
    return prompt

}