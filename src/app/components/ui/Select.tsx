'use client';
import {  useRef, useState } from "react";
import clsx from 'clsx';
import Search from "public/svgs/search";
import Loader from "./Loader";
import useClickOutside from "../hooks/useOutsideClick";

interface SelectProps<T> {
    searchValue?: string;
    placeholder?: string;
    onOptionClick: (option: Option) => void;
    options:Option[];
    selected?: Option;
    disabled?:boolean;
    infoMsg?:string;
}

export interface Option {
    id: number | string;
    value: any;
    label: string;
}

export default function Select<T>(props: SelectProps<T>) {
    const { searchValue, placeholder = "",  onOptionClick, selected, options,infoMsg, disabled=false } = props;
    const [search, setSearch] = useState<string>(searchValue || '')
    const [open, setOpen] = useState(false)
    const [selection, setSelection] = useState<Option | undefined>(selected)
    const dropdownRef = useRef<HTMLDivElement>(null);
  
    useClickOutside(dropdownRef, () => setOpen(false));
    
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setSearch(e.target.value)
      
    }

    function handleOptionClick(option: Option) {
        setSearch(option.label)
        setSelection(option)
        setOpen(false)
        onOptionClick(option)
    }

    const filterAndSortItems = (items: Option[], searchTerm: string) => {
        return items.sort((a, b) => {
          const aMatches = a.label.toLowerCase().includes(searchTerm.toLowerCase());
          const bMatches = b.label.toLowerCase().includes(searchTerm.toLowerCase());
      
          if (aMatches && !bMatches) return -1; 
          if (!aMatches && bMatches) return 1; 
          return 0;
        });
      };

    let FilteredOptions = filterAndSortItems(options,search)
  
    return <>
        <div className= {clsx(disabled ? "bg-gray-100 border-gray-400":"","border border-black px-5 py-3 rounded-2xl text-lg font-semibold relative")}>
            <div  onClick={() => setOpen(true)} className="flex items-center gap-4">
                <Search />
                <input disabled={disabled} placeholder={placeholder} value={search} className="outline-none w-full text-gray-400" type="text"  onChange={handleChange} />
            </div>
            {open && FilteredOptions.length != 0 && <div ref={dropdownRef} className="flex flex-col gap-1 w-full absolute top-14 left-0 border border-black rounded-2xl p-3 bg-white max-h-64 overflow-y-scroll">
                {FilteredOptions.map((option) => <p
                    key={option.id}
                    className={clsx("rounded-2xl py-3 px-5", selection?.value === option.value ? "!bg-purple text-white" : "hover:bg-purple-50 hover:text-purple")}
                    onClick={() => { handleOptionClick(option) }}>{option.label}
                </p>
                )}
            </div>}

        </div>
        {infoMsg && <p className="text-xs mt-2 text-orange-500 font-semibold">{infoMsg}</p>}

    </>
}