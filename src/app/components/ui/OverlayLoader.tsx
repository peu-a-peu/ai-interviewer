import clsx from "clsx"

type LoaderProps = {
    size?: 'xs' | 'sm' | 'md' | 'lg',
    extraClass?: string,
    loading: boolean,
    inverted?: boolean
}
export default function OverlayLoader(props: LoaderProps) {
    const { extraClass, size = 'xs', loading, inverted = false } = props
    if (!loading)
        return null
    const sizeClasses = {
        'xs': "w-6 h-6 border-4",
        'sm': "w-10 h-10 border-4",
        "md": "w-16 h-16 border-8",
        "lg": "w-24 h-24 border-8"
    }
    return <div className="absolute top-0 left-0 w-full h-full bg-white opacity-85 flex justify-center items-center">
        <div className={clsx(extraClass, sizeClasses[size], "rounded-full loader shrink-0", inverted ? "border-white border-l-black" : "border-black border-l-white")}>
        </div>
    </div>
}