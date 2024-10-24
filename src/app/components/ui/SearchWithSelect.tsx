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
}

export interface Option {
    id: number | string;
    value: any;
    label: string;
}

export default function SearchWithSelect<T>(props: SearchWithSelectProps<T>) {
    const { searchValue, placeholder = "", onSearch, onOptionClick, debounceDelay = 300, selected } = props;
    const [search, setSearch] = useState<string>(searchValue || '')
    const [options, setOptions] = useState<Option[]>([])
    const [open, setOpen] = useState(false)
    const [selection, setSelection] = useState<Option | undefined>(selected)
    const timeout = useRef<NodeJS.Timeout | null>(null);
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState('')

    const dropdownRef = useRef<HTMLDivElement>(null);
  
    useClickOutside(dropdownRef, () => setOpen(false));
  
    useEffect(() => {

    }, [searchValue])

    async function callApi(val: string) {
        setLoading(true)
        const options = await onSearch(val)
        if(!options.length){
            setMsg("결과를 찾을 수 없습니다: 다른 키워드로 다시 시도해 주세요.")
        }else{
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
        <div className="border border-black px-5 py-3 rounded-2xl text-lg font-semibold relative">
            <div className="flex items-center gap-4">
                <Search />
                <input onFocus={() => setOpen(true)} value={search} className="outline-none w-full text-gray-400" type="text" placeholder={placeholder} onChange={handleChange} />
                <Loader loading={loading} />
            </div>
            {open && options.length != 0 && <div ref={dropdownRef} className="flex flex-col gap-1 w-full absolute top-14 left-0 border border-black rounded-2xl p-3 bg-white max-h-64 overflow-y-scroll">
                {options.map((option) => <p
                    key={option.id}
                    className={clsx("rounded-2xl py-3 px-5", selection?.value === option.value ? "!bg-purple text-white" : "hover:bg-purple-50 hover:text-purple")}
                    onClick={() => { handleOptionClick(option) }}>{option.label}
                </p>
                )}
            </div>}

        </div>
        {msg && <p className="text-xs mt-2 text-orange-500 font-semibold">{msg}</p>}

    </>
}