import ConditionItem from "@/components/common/layout/conditions/conditionItem";
import { Button } from "antd";

export default function ConditionPanel(props) {
    const {
        conditions,
        onConditionChange,
        onSearch,
        orderKeys,
        types,
        labels,
        options,
        min,
        max
    } = props;
    return (
        <div className="flex flex-row items-end w-full">
            <div className="flex flex-row w-full justify-between">
                <div className="flex flex-row flex-wrap">
                    {orderKeys.map((condition) => 
                    (
                        <ConditionItem
                            key={condition}
                            label={labels[condition]}
                            value={conditions[condition]}
                            id={condition}
                            onChange={onConditionChange}
                            options={options?.[condition] || []}
                            type={types?.[condition] || "text"}
                            min={min}
                            max={max}
                        />
                    ))}
                </div>

                <div className="p-2">
                    <Button color="primary" variant="outlined"
                            style={{width: 70}} onClick={onSearch}>
                        조회
                    </Button>
                </div>
            </div>


        </div>
    );
}