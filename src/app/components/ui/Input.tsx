import clsx from "clsx"

export default function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { classes?: string, error?: string, tailText?: string }) {
    const { classes, error, tailText, ...rest } = props
    return <>
        <div className="relative">
            <input {...rest} className={clsx(error ? "border-red-500" : "", classes || '', "outline-none text-lg  p-4 rounded-md border border-gray-300 font-bold focus:border-black  w-full")} />
            {tailText && <p className="absolute right-0 top-1/2 -translate-y-1/2 mr-2">{tailText}</p>}
        </div>
        {error && <p className="mt-2.5 text-xs text-red-500 font-medium">{error}</p>}
    </>
}