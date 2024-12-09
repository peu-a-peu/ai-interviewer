import clsx from "clsx"


type ChipProps = React.HTMLAttributes<HTMLSpanElement> & {extraClass?: string}

export default function Chip(props: ChipProps) {
    const {extraClass, children, ...rest} = props
    return <span {...rest} className={clsx(extraClass,"text-nowrap inline-block w-fit text-sm md:text-md bg-gray-100 rounded-lg font-medium text-gray-950 px-3 py-2")}>
        {props.children}
    </span>
}