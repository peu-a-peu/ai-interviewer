export const VALID_INTERVIEW_CATEGORIES:Record<string,string> = {
    "pm":"pm",
    "default":"default"
}

export const LOCALE_TO_COUNTRY:Record<string,string> = {
    'ko':'kr',
    'en':'us'
}

export const LOCALE_TO_LANGUAGE:Record<string,string> = {
    'ko':'KOREAN',
    'en':'ENGLISH'
}


export function getCountryFromLocale(locale:string){
    return LOCALE_TO_COUNTRY[locale] ?? LOCALE_TO_COUNTRY["en"] as string
}

export function getLanguageFromLocale(locale:string){
    return LOCALE_TO_LANGUAGE[locale] ?? LOCALE_TO_LANGUAGE["en"] as string
}

export const DEFAULT_BASE_PROMPT=`You are a professional AI interviewer conducting formal, conversational interviews. You receive candidate details such as name, company, role, experience, interview type, and difficulty level, along with curated questions. Start by greeting the candidate and confirming provided details. Tailor your questions to their profile, using curated questions or creating relevant ones if needed. Ask one question at a time, offer polite transitions if the candidate is unsure, and use follow-ups for deeper insights only when necessary. Aim for a 20-30 minute interview, adjusting duration based on the candidate's performance. If they struggle, end the interview. While ending the interview use a thank you message followed by <<END_INTERVIEW>>.`