'use client';
import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Chip from "../ui/Chip";
import Input from "../ui/Input";
import Label from "../ui/Label";
import SearchWithSelect, { Option } from "../ui/SearchWithSelect";
import { api } from "@/trpc/react";
import { z } from "zod";
import clsx from "clsx";
import Select from "../ui/Select";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
const interviewTypes = ['인성면접', 'PT면접', '토론면접', '일반면접', '임원면접']



const formSchema = z.object({
    candiate_name: z.string().min(1, {message:"Name is required"}),
    company_id: z.string().min(1, { message: "회사 이름은 필수입니다" }),
    experience: z.number().gt(0, { message: "경력은 0보다 커야 합니다" }).lt(100, { message: "경력은 100보다 작아야 합니다" }),
    interview_type: z.string().min(1, { message: "면접 유형은 필수입니다" }),
    resume_summary: z.string(),
    position: z.string()
});


// Infer TypeScript types from the schema
type FormData = z.infer<typeof formSchema>;

const initialState: FormData = {
    candiate_name:"",
    company_id: '',
    experience: 0,
    interview_type: '',
    resume_summary: '',
    position: ''
}
export default function StartInterviewForm() {
    const t = useTranslations()
    const pathname = usePathname()
    const apiUtil = api.useUtils()
    const router = useRouter()
    const [selected, setSelected] = useState<Option>()
    const [formData, setFormData] = useState<FormData>(initialState)
    const [formErrors, setFormErrors] = useState<Record<string, string>>()
    const [options, setOptions] = useState<Option[]>([])
    const [loading, setLoading] = useState(false)
    const [file, setFile] = useState<File>()
    const category = pathname.split("/")?.[1] || "default"
    const interviewTypesText = [
        t("Personality Interview"),
        t("Presentation Interview"),
        t("Discussion Interview"),
        t("General Interview"),
        t("Executive Interview")
    ]


    async function handleSearch(query: string): Promise<Option[]> {
        try {
            let data = await apiUtil.company.searchCompanyByName.fetch({ search: query })
            return data.map(({ company_id, company_name, logo }) => ({ id: company_id, value: company_id, label: company_name, logo: logo as string | undefined }))
        } catch (err) {
            console.log(err)
        }
        return []

    }
    function validate(): FormData | null {
        try {
            const validatedData = formSchema.parse(formData);
            return validatedData
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Handle validation errors
                const formErrors = error.errors;
                const newErrors: Record<string, string> = {};
                formErrors.forEach((error) => {
                    let key = error.path[0] as string
                    newErrors[key] = newErrors[key] ? newErrors[key].concat(', ', error.message) : error.message
                })
                setFormErrors(newErrors)
            }
            return null
        }
    }

    async function createInterview(formData: FormData) {
        try {
            setLoading(true)
            let data = await apiUtil.interview.createInterview.fetch({
                ...formData,
                category
            })
            router.push(`/interview/${data}`)
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const data: FormData | null = validate()
        if (data) {
            setLoading(true)
            const summary = await extractText()
            handleChange('resume_summary', summary)
            data.resume_summary = summary || ""
            createInterview(data)
        }
    }

    function handleChange(key: keyof FormData, val: string | number) {
        setFormData((prev) => ({ ...prev, [key]: val }))
        setFormErrors((prev) => ({ ...prev, [key]: '' }))
    }

    async function getCompanyRoles(companyId: string) {
        try {
            let data = await apiUtil.company.getAllCompanyRoles.fetch({ companyId })
            setOptions(data.map((key) => ({ id: key, value: key, label: key })))
        } catch (err) {
            console.log(err)
        }
    }

    function selectFile(e: any) {
        const file = e.target.files?.[0]
        setFile(file)
    }

    const extractText = async () => {
        if (!file) {
            return ""
        }
        const fd = new FormData()
        fd.append('file', file)

        const data = await fetch('/api/resume-summary', { method: "POST", body: fd })
        if (!data.ok) {
            return ""
        }

        const res = await data.json()
        return res.text
    }

    useEffect(() => {
        selected && getCompanyRoles(selected.value)
    }, [selected])

    return <form className="max-w-xl flex flex-col gap-8 mx-auto" onSubmit={loading ? () => { } : handleSubmit}>
        <div>
            <Label>{t('Name')}</Label>
            <Input onChange={(e) => handleChange('candiate_name', e.target.value)} placeholder={t(`Please enter your name`)} />
        </div>
        <div>
            <Label error={formErrors?.company_id}>{t(`Company`)}</Label>
            <SearchWithSelect
                placeholder={t("Please enter the company name here")}
                selected={selected}
                onSearch={handleSearch}
                onOptionClick={(option) => { setSelected(option); handleChange('company_id', option.value) }}
            />
        </div>
        <div>
            <Label>{t(`Job title`)}</Label>
            <Select placeholder={t(`Search job title`)} disabled={!formData.company_id} options={options} onOptionClick={(option) => { handleChange('position', option.value) }} />
        </div>
        <div>
            <Label error={formErrors?.experience}>{t(`Total job experience`)}</Label>
            <Input onChange={(e) => handleChange('experience', parseInt(e.target.value))} type="number" classes="w-16" placeholder={t(`Please enter total years of experience`)} />
        </div>
        <div>
            <Label error={formErrors?.interview_type}>{t(`Interview type`)}</Label>
            <div className="flex gap-2.5 flex-wrap">
                {interviewTypes.map((item, index) => <Chip extraClass={clsx('cursor-pointer', formData.interview_type === item ? "!bg-black text-white" : "")} onClick={() => handleChange('interview_type', item)} key={index}>{interviewTypesText[index]}</Chip>)}
            </div>
        </div>
        <div>
            <Label error={formErrors?.resume_summary}>{t(`Upload Resume`)}  <span className="text-gray-400">({t(`Optional`)})</span></Label>
            <p className="text-gray-500 text-sm -mt-2 mb-4">{t(`The interview quality will improve if you upload your resume`)}.</p>
            <label className="rounded-md p-4 border border-gray-300 inline-block w-full text-center font-semibold text-gray-950" htmlFor={"fileUpload"}>
                {file?.name || t(`Upload Resume`)}
            </label>
            <Input onChange={selectFile} type="file" classes="hidden" id="fileUpload" accept="application/pdf" />
        </div>
        <Button isLoading={loading} >{t(`Experience a mock interview for free once`)}</Button>


    </form>
}