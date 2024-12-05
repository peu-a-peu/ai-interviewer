'use client';
import {  useEffect, useRef, useState } from "react";
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
    error?:string;
    allowSearchToBeValue?:boolean;
}

export interface Option {
    id: number | string;
    value: any;
    label: string;
}

export default function Select<T>(props: SelectProps<T>) {
    const { searchValue, placeholder = "",  onOptionClick, selected, options,infoMsg, disabled=false,error,allowSearchToBeValue } = props;
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
        return items.filter((item) => {
          return item.label.toLowerCase().includes(searchTerm.toLowerCase());
        });
      };
      let FilteredOptions = filterAndSortItems(options,search)
      if(allowSearchToBeValue && !FilteredOptions.length){
        FilteredOptions.push({
            id:search,
            value:search,
            label:search
        })
      }

      useEffect(()=>{
        setSelection(selection)
        setSearch(selected?.label||"")
      },[selected])
  
    return <>
        <div className= {clsx(disabled ? "bg-gray-100 border-gray-400":"","border border-gray-300 px-4 py-3 rounded-md text-lg font-semibold relative")}>
            <div  onClick={() => setOpen(true)} className="flex items-center gap-4">
                <input disabled={disabled} placeholder={placeholder} value={search} className="outline-none w-full text-lg" type="text"  onChange={handleChange} />
                <Search />
            </div>
           
            {open && FilteredOptions.length != 0 && <div ref={dropdownRef} className="z-10 flex flex-col gap-1 w-full absolute top-16 left-0 border border-black rounded-md p-3 bg-white max-h-64 overflow-y-scroll">
                {FilteredOptions.map((option) => <p
                    key={option.id}
                    className={clsx("rounded-md py-3 px-5", selection?.value === option.value ? "!bg-black text-white" : "hover:bg-gray-100 hover:text-black")}
                    onClick={() => { handleOptionClick(option) }}>{option.label}
                </p>
                )}
            </div>}

        </div>
        {infoMsg && <p className="text-xs mt-2.5 text-orange-500 font-medium">{infoMsg}</p>}
        {error && <p className="text-xs mt-2.5 text-red-500 font-medium">{error}</p>}

    </>
}