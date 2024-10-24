import clsx from "clsx"

export default function Input(props: React.InputHTMLAttributes<HTMLInputElement> & {classes?:string}) {
    const {classes, ...rest} = props
    return <input {...rest} className={clsx(classes||'', "outline-none  py-3 px-5 rounded-2.5xl border border-black font-bold text-gray-400")}  />
}