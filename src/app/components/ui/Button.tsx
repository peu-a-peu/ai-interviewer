import { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from 'clsx';
import Loader from "./Loader";
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    children: ReactNode;
    isLoading?: boolean;
    overrideClasses?: string;
    extraClasses?:string;
}

const variantClass = {
    primary: 'bg-purple text-white',
    secondary: 'border border-black bg-white text-black'
}
const variantLoadingClass = {
    primary: 'bg-purple-200 text-white',
    secondary: 'border border-black bg-white text-black'
}

export default function Button(props: ButtonProps) {
    let { variant, isLoading, children, overrideClasses='',extraClasses, onClick,  ...rest } = props
    variant = variant || 'primary'
    const inverted = variant=='primary'
    return <button onClick={isLoading? ()=>{}: onClick} className={clsx(overrideClasses||'rounded-xl px-4 py-2 text-sm', isLoading ? variantLoadingClass[variant]:"", variantClass[variant], extraClasses)} {...rest}>
        {isLoading ? <div className="w-full flex justify-center"><Loader inverted={inverted} loading={true}/></div> : children}
    </button>
}