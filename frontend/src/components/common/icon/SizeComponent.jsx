const SizeComponent = ({Component,className,fontSize,onClick}) => {
    return (<Component className={className} sx={{ fontSize: fontSize }} onClick={onClick} />)
}
export default SizeComponent;