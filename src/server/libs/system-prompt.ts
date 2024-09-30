import { SystemPromptInput } from "../interfaces/OpenAiInterface";

export function getSystemPrompt(promptVariables:SystemPromptInput) {

    const {companyName,employeeName,employmentType,interviewType,position,questions} = promptVariables

    return `
    Create an AI interview script for ${employeeName} who is applying for ${companyName}, designed for a ${employmentType} candidate.
     This will be a ${interviewType} interview for the position of ${position}.
     Generate relevant interview questions based on this information.
    Each question should focus on assessing the candidate’s skills, experience, and suitability for the role.
     Start with an introduction and then proceed with 5-7 tailored interview questions.
      Also, ensure the tone is professional and engaging.
       You may dig further on the interviewee's answer especially when the answer sounds not so compelling.
Variables:
	•	CompanyName: The name of the company conducting the interview.
	•	EmploymentType: Whether the candidate is applying as an intern, new hire, or experienced hire.
	•	InterviewType: The type of interview (e.g., behavioral, technical, case-based).
	•	Position: The specific role the candidate is applying for.
	•	Question: The question you want the AI to ask the candidate.
Make sure the questions align with the interview type and position.”
You can replace the variables with the relevant details to get a set of customized interview questions.
    `
}