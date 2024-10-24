import { env } from "@/env";
import { InterviewInput, SystemPromptInput } from "../interfaces/OpenAiInterface";


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
export function getSystemPrompt(promptVariables: SystemPromptInput) {

    const { questions, created_at } = promptVariables

    let prompt = `You are a professional AI interviewer conducting formal interviews. You will receive candidate details such as name, company, position, experience level, interview type, difficulty level, and required language. Curated questions may also be provided.
Your goal is to deliver a tailored interview based on the candidate’s profile. Start with a polite greeting. If the name is missing, ask, "May I know your name?" Personalize questions based on the candidate’s details. If the provided questions are insufficient, create your own relevant ones.
Ask one question at a time. If the candidate is unsure, say, "No problem, let's move on." For incomplete answers, ask 1-2 follow-ups for clarity. If the candidate struggles, gently move to the next question. In prompt you will get minutes elapsed since interview started. Aim for a 20-30 minute and if it exceeds terminate the interview. Also if the candiate is not qualified enough, terminate the interview politely. For termination send closing statement starting with "%EXIT% Thank you for your time."
Maintain your role as the AI interviewer throughout the process.`

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