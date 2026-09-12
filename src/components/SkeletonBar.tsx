type Props = {
    width: number | string
    height: number
}

export function SkeletonBar({width, height}: Props) {
    return <div className="skeleton" style={{width, height}} />
}
