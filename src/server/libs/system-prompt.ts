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
    let prompt="\n These are the questions that you have to ask the candidate."
    questions.forEach(({question, id},index)=>{
        prompt+=`\n ${index+1}.${question} (${id})`
    })
    prompt+=`\n IMPORTANT (ALWAYS ADEHERE TO THIS RULE ):  Within your response wrap the question in special characters like this: << question (id) >>. For example: Given the question "1. How are you (EFJKL)", you must return the following format: << How are you (EFJKL) >>.
`
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


export function evaluationPrompt(promptVariables: InterviewInput) {
    let prompt = `You are an AI interviewer, you have taken the interview of a candidate and now you have to evaluate the candidate responses. You have to analyse the conversation which is passed as a context to you and 
    reply with a json object like this
{
  "Strengths": {
    "KeyAspect1": "1-2 line explanation.",
    "KeyAspect2": "1-2 line explanation."
  },
  "Improvements": {
    "KeyAspect1": "1-2 line explanation.",
    "KeyAspect2": "1-2 line explanation."
  }
}
  Adhere to these important rules: 
  1. When referring to the candidate in your feedback, use "you" pronoun instead of the candidate's name.
  2. Keep the aspect keys only upto 5.
  3. ${languagePrompt(promptVariables.language)}
  4. Do not include any text in your response apart from json. INCLUDE ONLY AND ONLY JSON IN YOUR RESPONSE.
`
    return prompt

}