import { env } from "@/env";
import { InterviewInput, SystemPromptInput } from "../interfaces/OpenAiInterface";
import PromptService from "../api/services/PromptService";

const PROMPT_KEYS: Record<string, string> = {
    default: "DEFAULT_SYSTEM_PROMPT",
    pm: "PM_SYSTEM_PROMPT"
}
function candiatePrompt(promptVariables: InterviewInput) {
    console.log({promptVariables})
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
        prompt += `\n Here's the resume summary of the candiate. \n`
        prompt += resume_summary
    }

    return prompt
}

export function languagePrompt() {
    const language = env.AI_LANGUAGE || 'ENGLISH'
    return ` YOU ARE STRICTLY ADVISED TO KEEP CONVERSATION IN ${language} ONLY`
}
export async function getSystemPrompt(promptVariables: SystemPromptInput, key?: string) {

    const { questions, created_at } = promptVariables
    let mappedKey = PROMPT_KEYS[key || "default"] || PROMPT_KEYS["default"] as string
    let prompt = await PromptService.getPromptByKey(mappedKey)
    console.log({P1: prompt})
    prompt += candiatePrompt(promptVariables)
    console.log({P2: prompt})
    if (questions?.length) {
        prompt += `\n These are the few questions you can ask to candidate. \n`
        prompt += questions.map((item, index) => `${index + 1}. ${item}`).join(`\n`)
    }
    if (created_at) {
        console.log({created_at, diff: (new Date().valueOf() - new Date(created_at).valueOf())})
        let mins: number = Math.floor((new Date().valueOf() - new Date(created_at).valueOf()) / 60000)
        prompt += ` It has been ${mins} minutes since the interview started.`
    }


    prompt += languagePrompt()
    console.log({P3: prompt})
    return prompt
}


export function evaluationPrompt(promptVariables: InterviewInput) {
    let prompt = `As an AI interviewer you now have to evaluate the candiate responses and return direct json object as response having keys 'Strengths' and 'Improvements' something like this. 
    {
    "Strengths": {
    "Communication": "Clearly articulated thought process during technical explanations.",
  },
  "Improvements": {
    "Attention to Detail": "Missed a few minor edge cases during problem-solving exercises.",
  }
}
   Make sure the there should be max 5 subkeys and should not be more than 1-2 lines.`
    prompt += candiatePrompt(promptVariables)
    prompt += languagePrompt()
    return prompt

}