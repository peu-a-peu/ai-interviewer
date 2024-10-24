import clsx from "clsx"


type ChipProps = React.HTMLAttributes<HTMLSpanElement> & {extraClass?: string}

export default function Chip(props: ChipProps) {
    const {extraClass, children, ...rest} = props
    return <span {...rest} className={clsx(extraClass,"text-nowrap inline-block w-fit border text-sm md:text-md border-black rounded-2xl font-medium text-black p-2.5")}>
        {props.children}
    </span>
}