"use client"
import { ButtonHTMLAttributes, ReactNode, useEffect, useRef, useState } from "react";
import clsx from 'clsx';
import Search from "public/svgs/search";
import Loader from "./Loader";
import useClickOutside from "../hooks/useOutsideClick";

interface SearchWithSelectProps<T> {
    searchValue?: string;
    placeholder?: string;
    onSearch: (query: string) => Promise<Option[]>;
    onOptionClick: (option: Option) => void;
    debounceDelay?: number
    selected?: Option
    error?: string
    onErrorImage?:string
}

export interface Option {
    id: number | string;
    value: any;
    label: string;
    logo?: string;
}

export default function SearchWithSelect<T>(props: SearchWithSelectProps<T>) {
    const { searchValue, placeholder = "", onSearch, onOptionClick, debounceDelay = 300, selected, error, onErrorImage } = props;
    const [search, setSearch] = useState<string>(searchValue || '')
    const [options, setOptions] = useState<Option[]>([])
    const [open, setOpen] = useState(false)
    const [selection, setSelection] = useState<Option | undefined>(selected)
    const timeout = useRef<NodeJS.Timeout | null>(null);
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState('')

    const dropdownRef = useRef<HTMLDivElement>(null);

    useClickOutside(dropdownRef, () => setOpen(false));

    useEffect(()=>{
        setSelection(selection)
        setSearch(selected?.label||"")
      },[selected])
  

    async function callApi(val: string) {
        setLoading(true)
        const options = await onSearch(val)
        if (!options.length) {
            setMsg("결과를 찾을 수 없습니다: 다른 키워드로 다시 시도해 주세요.")
        } else {
            setMsg("")
        }
        setOptions(options)
        setLoading(false)
    }
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setSearch(e.target.value)
        if (timeout.current) {
            clearTimeout(timeout.current);
        }
        timeout.current = setTimeout(() => {
            if (!e.target.value) {
                setOptions([])
                return;
            }
            callApi(e.target.value)
        }, debounceDelay)
    }

    function handleOptionClick(option: Option) {
        setSearch(option.label)
        setSelection(option)
        setOpen(false)
        onOptionClick(option)
    }
    return <>
        <div className={clsx("border border-gray-300 p-4 rounded-md text-lg font-semibold relative", open ? "border-black" : "", error ? "border-red-500" : "",)}>
            <div className="flex items-center gap-4">
                {selected?.logo && <img className="h-8 shrink-0" src={selected.logo} />}
                <input onFocus={() => setOpen(true)} value={search} className="outline-none w-full" type="text" placeholder={placeholder} onChange={handleChange} />
                <Loader loading={loading} />
                <Search />
            </div>
            {open && options.length != 0 && <div ref={dropdownRef} className="flex z-10 flex-col gap-1 w-full absolute top-[72px] left-0 border border-black rounded-md p-3 bg-white max-h-64 overflow-y-scroll">
                {options.map((option) => <>
                    <p
                        key={option.id}
                        className={clsx("rounded-md py-3 px-4 flex items-center gap-4", selection?.value === option.value ? "!bg-black text-white" : "hover:bg-gray-100 hover:text-black")}
                        onClick={() => { handleOptionClick(option) }}>
                        <div className="max-w-20 basis-3/12 flex justify-center">
                        {option.logo && <img className="h-10 shrink-0" src={option.logo} onError={(e)=>{e.currentTarget.src = onErrorImage || ''}}/>}
                        </div>
                        {option.label}
                    </p>
                </>
                )}
            </div>}

        </div>
        {msg && <p className="text-xs mt-2.5 text-orange-500 font-medium">{msg}</p>}
        {error && <p className="text-xs mt-2.5 text-red-500 font-medium">{error}</p>}

    </>
}