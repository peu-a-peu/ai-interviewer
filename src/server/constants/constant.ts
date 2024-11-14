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