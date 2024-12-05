"use client";
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
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { DEFAULT_COMPANY_IMAGE } from "@/app/constants/values";
import ConfirmModal from "./ConfirmModal";
import PaymentModal from "../payment/PaymentModal";
import Checkbox from "../ui/Checkbox";

export default function StartInterviewForm({ }) {
  const t = useTranslations();
  const ROLES = {
    [t("Administrative Assistant")]: "administrative_assistant",
    [t("Back-End Engineer")]: "back_end_engineer",
    [t("Business Analyst")]: "business_analyst",
    [t("Business Development Manager")]: "business_development_manager",
    [t("Customer Support Specialist")]: "customer_support_specialist",
    [t("Finance Manager")]: "finance_manager",
    [t("Front-End Engineer")]: "front_end_engineer",
    [t("Graphic Designer")]: "graphic_designer",
    [t("Human Resources Specialist")]: "human_resources_specialist",
    [t("Marketing Specialist")]: "marketing_specialist",
    [t("Product Manager")]: "product_manager",
    [t("Quality Assurance (QA)")]: "quality_assurance",
    [t("Research and Development (R&D)")]: "research_and_development",
    [t("Sales Representative")]: "sales_representative",
    [t("Software Engineer")]: "software_engineer",
    [t("Product Designer")]: "product_designer",
    [t("Full-Stack Engineer")]: "full_stack_engineer",
  };

  const roleKeys = Object.keys(ROLES);
  const roleValues = Object.values(ROLES);
  const roleOptions: Option[] = roleKeys.map((item, index) => ({
    id: roleValues[index]!,
    value: roleValues[index],
    label: item,
  }));
  const formSchema = z.object({
    candidate_name: z.string().min(1, { message: t("Name is required") }),
    company_id: z.string().min(1, { message: t("Company is required") }),
    experience: z
      .number()
      .gt(-1, { message: t("Experience should be non negative") })
      .lt(100, { message: t("Too large value for experience") }),
    interview_type: z
      .string()
      .min(1, { message: t("Select an interview type") }),
    resume_summary: z.string(),
    position: z
      .string()
      .min(1, { message: t("Enter position for which you are applying for") }),
  });

  type FormData = z.infer<typeof formSchema>;

  const initialState: FormData = {
    candidate_name: "",
    company_id: "",
    experience: NaN,
    interview_type: "",
    resume_summary: "",
    position: "",
  };
  const apiUtil = api.useUtils();
  const router = useRouter();
  const [selected, setSelected] = useState<Option>();
  const [formData, setFormData] = useState<FormData>(initialState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File>();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [showTerms, setShowTerms] = useState(false);

  let interviewTypes = ["capability_interview", "behavioral_interview"];
  let interviewTypesText = [
    t("Capability Interview"),
    t("Behavioral Interview"),
  ];

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    const token = localStorage.getItem("emailVerificationToken");
    const expires = localStorage.getItem("sessionExpires");
    const agreed = localStorage.getItem("agreed")
    if (userEmail && token && expires && new Date(expires) > new Date()) {
      setUserEmail(userEmail);
    }
    if (!agreed) {
      setAcceptTerms(false)
      setShowTerms(true)
    }
  }, []);

  const { data: userData, error: userDataError } =
    api.ticket.getTransactionData.useQuery(
      { email: userEmail ?? "" },
      {
        enabled: !!userEmail,
        refetchOnWindowFocus: false,
        retry: 1,
        // onError: (error) => {
        //   console.error("Error fetching user data:", error);
        // },
      }
    );

  async function handleSearch(query: string): Promise<Option[]> {
    try {
      let data = await apiUtil.company.searchCompanyByName.fetch({
        search: query,
      });
      return data.map(({ company_id, company_name, logo }) => ({
        id: company_id,
        value: company_id,
        label: company_name,
        logo: logo as string | undefined,
      }));
    } catch (err) {
      console.log(err);
    }
    return [];
  }
  function validate(): FormData | null {
    try {
      const validatedData = formSchema.parse(formData);
      return validatedData;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formErrors = error.errors;
        const newErrors: Record<string, string> = {};
        formErrors.forEach((error) => {
          let key = error.path[0] as string;
          newErrors[key] = newErrors[key]
            ? newErrors[key].concat(", ", error.message)
            : error.message;
        });
        setFormErrors(newErrors);
      }
      return null;
    }
  }

  async function createInterview(formData: FormData) {
    try {
      // Skip validation if no tickets or no user email
      if (!userEmail || userData?.user?.ticketCount === 0) {
        setShowPaymentModal(true);
        return;
      }

      // Only validate if user has tickets and is logged in
      const validatedData = validate();
      if (!validatedData) {
        return;
      }

      setShowConfirmModal(true);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }
  const handleLoginRedirect = () => {
    localStorage.setItem(
      "formData",
      JSON.stringify(formData)
    );
    if (selected) {
      localStorage.setItem("company", JSON.stringify(selected))
    }
    router.push("/login");
  };

  useEffect(() => {
    const savedFormData = localStorage.getItem("formData");
    const savedCompany = localStorage.getItem("company")
    console.log({ savedCompany })
    if (savedFormData) {
      const parsedData = JSON.parse(savedFormData);
      setFormData((prev) => ({
        ...prev,
        ...parsedData
      }));
      localStorage.removeItem("formData")
    }
    if (savedCompany) {
      setSelected(JSON.parse(savedCompany))
      localStorage.removeItem("company")
    }

  }, []);

  const handleModalConfirm = async () => {
    try {
      setLoading(true);
      let data = await apiUtil.interview.createInterview.fetch({
        ...formData,
      });
      router.push(`/interview/${data}`);
      localStorage.removeItem("formData");
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userEmail) {
      localStorage.setItem("agreed", "agreed")
      handleLoginRedirect();
      return;
    }

    // Skip validation if user has no tickets
    if (!userEmail || userData?.user?.ticketCount === 0) {
      const summary = await extractText();
      handleChange("resume_summary", summary);
      createInterview({
        ...formData,
        resume_summary: summary || "",
      });
      return;
    }

    // Proceed with validation for users with tickets
    const data: FormData | null = validate();
    if (data) {
      setLoading(true);
      const summary = await extractText();
      handleChange("resume_summary", summary);
      data.resume_summary = summary || "";
      localStorage.setItem("agreed", "agreed")
      createInterview(data);
    }
  }

  function handleChange(key: keyof FormData, val: string | number) {
    setFormData((prev) => ({ ...prev, [key]: val }));
    setFormErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function selectFile(e: any) {
    const file = e.target.files?.[0];
    setFile(file);
  }

  const extractText = async () => {
    if (!file) {
      return "";
    }
    const fd = new FormData();
    fd.append("file", file);

    const data = await fetch("/api/resume-summary", {
      method: "POST",
      body: fd,
    });
    if (!data.ok) {
      return "";
    }

    const res = await data.json();
    return res.text;
  };

  return (
    <>
      <form
        className="max-w-xl flex flex-col gap-8 mx-auto"
        onSubmit={loading ? () => { } : handleSubmit}
      >
        <div>
          <Label>{t("Name")}</Label>
          <Input
            value={formData.candidate_name}
            error={formErrors?.candidate_name}
            onChange={(e) => handleChange("candidate_name", e.target.value)}
            placeholder={t(`Please enter your name`)}
          />
        </div>
        <div>
          <Label>{t(`Company`)}</Label>
          <SearchWithSelect
            error={formErrors?.company_id}
            placeholder={t("Please enter the company name here")}
            selected={selected}
            onSearch={handleSearch}
            onOptionClick={(option) => {
              setSelected(option);
              handleChange("company_id", option.value);
            }}
            onErrorImage={DEFAULT_COMPANY_IMAGE}
          />
        </div>
        <div>
          <Label>{t(`Job title`)}</Label>
          <Select
            selected={roleOptions.find((item) => item.value === formData.position)}
            allowSearchToBeValue
            error={formErrors?.position}
            placeholder={t(`Search job title`)}
            options={roleOptions}
            onOptionClick={(option) => {
              handleChange("position", option.value);
            }}
          />
        </div>
        <div>
          <Label>{t(`Total job experience`)}</Label>
          <Input
            error={formErrors?.experience}
            onChange={(e) =>
              handleChange("experience", parseInt(e.target.value))
            }
            type="number"
            value={formData.experience}
            classes="w-16 pr-14 "
            placeholder={t(`Please enter total years of experience`)}
            tailText={t("years")}
          />
        </div>
        <div>
          <Label error={formErrors?.interview_type}>
            {t(`Interview type`)}
          </Label>
          <div className="flex gap-2.5 flex-wrap">
            {interviewTypes.map((item, index) => (
              <Chip
                extraClass={clsx(
                  "cursor-pointer",
                  formData.interview_type === item ? "!bg-black text-white" : ""
                )}
                onClick={() => handleChange("interview_type", item)}
                key={index}
              >
                {interviewTypesText[index]}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <Label>
            {t(`Upload Resume`)}{" "}
            <span className="text-gray-400">({t(`Optional`)})</span>
          </Label>
          <p className="text-gray-500 text-sm -mt-2 mb-4">
            {t(`The interview quality will improve if you upload your resume`)}.
          </p>
          <label
            className="rounded-md p-4 border border-gray-300 inline-block w-full text-center font-semibold text-gray-950"
            htmlFor={"fileUpload"}
          >
            {file?.name || t(`Upload Resume`)}
          </label>
          <Input
            error={formErrors?.resume_summary}
            onChange={selectFile}
            type="file"
            classes="hidden"
            id="fileUpload"
            accept="application/pdf"
          />
        </div>

        <Button
          isLoading={loading}
          disabled={!acceptTerms}
          extraClasses="disabled:opacity-50"
        >
          {userData?.user?.ticketCount === 0
            ? t("Please purchase a ticket for the mock interview")
            : userData?.user?.ticketCount === 1
              ? t("Experience a mock interview for free once")
              : t("Conduct a mock interview")}
        </Button>
          {showTerms && <div className="flex items-start gap-2">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              {t(
                "I agree to the collection of data necessary to prevent duplicate use of the free trial service"
              )}{" "}
              
            </label>
          </div>}
      </form>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleModalConfirm}
      // userEmail={formData.candidate_name}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
      // email={formData.candidate_name}
      />
    </>
  );
}
