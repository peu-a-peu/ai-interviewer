type LabelAttributes = React.InputHTMLAttributes<HTMLLabelElement> & {error?:string}
export default function Label(props: LabelAttributes) {
    const {children, error,...rest} = props
    return <label {...rest} className="text-black font-bold text-lg md:text-xl mb-3 block">
        {props.children}
        {error && <p className="text-xs text-red-500 mt-2 font-normal">{error}</p>}
    </label>
}

