import ConditionPicker from "@/components/common/layout/conditions/conditionPicker";

export default function ConditionItem(props) {
    const {
        label,
        id,
        type,
        value,
        onChange,
        options,
        placeholder,
        min,
        max,
    } = props;

    if (label === undefined) {
        throw new Error("orderKeys에 작성한 conditions와 일치하는 label이 지정되지 않았습니다. 다시 가서 작성하고 오세요^^");
    }
    return (
        <div className="flex flex-row items-center p-2 gap-2">
            <label className="weight-600 text-[15px] w-[80px] text-right">{label}</label>
            <div className="flex gap-2">
                <ConditionPicker
                    id={id}
                    type={type}
                    value={value}
                    onChange={(v) => onChange(id, v)}
                    options={options}
                    placeholder={placeholder}
                    min={min}
                    max={max}
                />
            </div>
        </div>
    )
}