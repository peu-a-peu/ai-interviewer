import clsx from "clsx"

export default function Input(props: React.InputHTMLAttributes<HTMLInputElement> & {classes?:string}) {
    const {classes, ...rest} = props
    return <input {...rest} className={clsx(classes||'', "outline-none text-lg  p-4 rounded-md border border-gray-300 font-bold focus:border-black text-gray-400 w-full")}  />
}