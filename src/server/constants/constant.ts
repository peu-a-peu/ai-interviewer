export const VALID_INTERVIEW_CATEGORIES:Record<string,string> = {
    "pm":"pm",
    "default":"default"
}

export const LOCALE_TO_COUNTRY:Record<string,string> = {
    'ko':'kr',
    'en':'us'
}

export function getCountryFromLocale(locale:string){
    return LOCALE_TO_COUNTRY[locale] ?? LOCALE_TO_COUNTRY["en"] as string
}

export const SUPABASE_BUCKETS = {
    COMPANY_LOGOS: "company_logos"
}